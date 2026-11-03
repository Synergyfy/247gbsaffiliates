import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskFromCentralDto } from './dto/create-task-from-central.dto';
import { FindTasksQueryDto } from './dto/find-tasks.dto';
import { UsersService } from '../users/users.service';
import { UserRole, VerificationStatus } from '../users/entities/user.entity';

const AFFILIATE_ROLES = [UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT];

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private centralUrl: string;

  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    private usersService: UsersService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.centralUrl = this.configService.get<string>('MCOM_CENTRAL_URL') || 'http://localhost:3010/api/v1';
  }

  async create(userId: string, createTaskDto: CreateTaskDto) {
    await this.assertVerifiedAffiliate(userId);
    const task = this.tasksRepo.create({
      ...createTaskDto,
      clientId: userId,
    });
    return this.tasksRepo.save(task);
  }

  async createFromCentral(dto: CreateTaskFromCentralDto) {
    const task = this.tasksRepo.create({
      ...dto,
      status: TaskStatus.OPEN,
    });
    return this.tasksRepo.save(task);
  }

  async findAll(query: FindTasksQueryDto, requesterId?: string, requesterRole?: UserRole) {
    const { page = 1, limit = 10, search, status, assignedAgentId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) where.title = Like(`%${search}%`);
    if (requesterId && requesterRole && AFFILIATE_ROLES.includes(requesterRole)) {
      await this.assertQualifiedAffiliate(requesterId);
      if (assignedAgentId || (status && status !== TaskStatus.OPEN)) {
        // Never trust the affiliate ID supplied in the query string, and never
        // return another affiliate's assigned/active work.
        where.assignedAgentId = requesterId;
      } else if (!status) {
        // Preserve the existing open-task pool while keeping assigned tasks private.
        where.status = TaskStatus.OPEN;
      }
    } else if (assignedAgentId) {
      where.assignedAgentId = assignedAgentId;
    }

    const [items, total] = await this.tasksRepo.findAndCount({
      where,
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
      relations: requesterRole && AFFILIATE_ROLES.includes(requesterRole) ? [] : ['client', 'assignedAgent'],
    });

    return {
      items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const task = await this.tasksRepo.findOne({
      where: { id },
      relations: ['client', 'assignedAgent'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async findOneForUser(id: string, requesterId: string, requesterRole: UserRole) {
    if (AFFILIATE_ROLES.includes(requesterRole)) {
      await this.assertQualifiedAffiliate(requesterId);
      const task = await this.tasksRepo.findOne({ where: { id, assignedAgentId: requesterId } });
      if (!task) throw new NotFoundException('Task not found');
      return task;
    }
    return this.findOne(id);
  }

  async assign(id: string, agentId: string) {
    const task = await this.findOne(id);
    if (task.status !== TaskStatus.OPEN && task.status !== TaskStatus.DECLINED) {
       // Allow re-assignment if declined
      throw new BadRequestException('Task is not open for assignment');
    }

    const agent = await this.usersService.findOne(agentId);
    if (agent.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot assign tasks to another Admin');
    }
    await this.assertQualifiedAffiliate(agentId);

    task.assignedAgent = agent;
    task.assignedAgentId = agentId;
    task.status = TaskStatus.ASSIGNED;
    
    const savedTask = await this.tasksRepo.save(task);
    this.notifyCentral(savedTask);
    return savedTask;
  }

  async respondToTask(id: string, userId: string, response: 'accept' | 'decline') {
    const task = await this.findOne(id);
    await this.assertQualifiedAffiliate(userId);
    
    if (task.assignedAgentId !== userId) {
      throw new ForbiddenException('You are not assigned to this task');
    }
    if (task.status !== TaskStatus.ASSIGNED) {
      throw new BadRequestException('Task is not in ASSIGNED state');
    }

    if (response === 'accept') {
      task.status = TaskStatus.ACCEPTED;
    } else {
      task.status = TaskStatus.DECLINED; 
    }

    const savedTask = await this.tasksRepo.save(task);
    this.notifyCentral(savedTask);
    return savedTask;
  }

  async updateStatus(id: string, status: TaskStatus, userId: string) {
    const task = await this.findOne(id);
    const user = await this.usersService.findOne(userId);
    if (AFFILIATE_ROLES.includes(user.role)) {
      await this.assertQualifiedAffiliate(userId);
      if (task.assignedAgentId !== userId) {
        throw new ForbiddenException('You are not authorized to update this task.');
      }
      if (task.status !== TaskStatus.ACCEPTED || status !== TaskStatus.SUBMITTED) {
        throw new BadRequestException('Affiliates can submit an accepted task for review.');
      }
    } else if (user.role !== UserRole.ADMIN) {
      if (task.assignedAgentId !== userId && task.clientId !== userId) {
        throw new ForbiddenException('You are not authorized to update this task.');
      }
    }
    task.status = status;
    const savedTask = await this.tasksRepo.save(task);
    this.notifyCentral(savedTask);
    return savedTask;
  }

  private async assertVerifiedAffiliate(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (user.role !== UserRole.ADMIN && (user.verificationStatus !== VerificationStatus.VERIFIED || !user.isOnboarded)) {
      throw new ForbiddenException('Administrator verification and completed onboarding are required for affiliate work.');
    }
    return user;
  }

  private async assertQualifiedAffiliate(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (user.role === UserRole.ADMIN) return user;
    if (!AFFILIATE_ROLES.includes(user.role)
      || user.verificationStatus !== VerificationStatus.VERIFIED
      || !user.isOnboarded
      || !user.isQuizPassed
      || !user.skills?.length) {
      throw new ForbiddenException('Administrator verification, onboarding, assessment, and skill requirements must be complete before affiliate task access.');
    }
    return user;
  }

  private async notifyCentral(task: Task) {
    if (task.externalTaskId) {
       this.logger.log(`Syncing task ${task.id} (External: ${task.externalTaskId}) status ${task.status} to Central...`);
       try {
         await lastValueFrom(
           this.httpService.patch(`${this.centralUrl}/tasks/${task.externalTaskId}`, {
             status: task.status,
             assignedAgentId: task.assignedAgentId
           }, {
             headers: {
               'x-api-key': this.configService.get<string>('INTERNAL_API_KEY'),
             }
           })
         );
         this.logger.log('Sync successful.');
       } catch (error) {
         this.logger.error(`Sync failed: ${error.message}`);
       }
    }
  }
}

