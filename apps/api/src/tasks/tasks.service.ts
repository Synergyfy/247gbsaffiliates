import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { Task, TaskStatus, TaskType, TaskCategory, OriginSystem } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskFromCentralDto } from './dto/create-task-from-central.dto';
import { FindTasksQueryDto } from './dto/find-tasks.dto';
import { SubmitTaskDto } from './dto/task-collaboration.dto';
import { UsersService } from '../users/users.service';
import { User, UserRole, UserStatus, VerificationStatus } from '../users/entities/user.entity';
import { AccountManagerService } from '../account-manager/account-manager.service';

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
    private accountManagerService: AccountManagerService,
  ) {
    this.centralUrl = this.configService.get<string>('MCOM_CENTRAL_URL') || 'http://localhost:3010/api/v1';
  }

  async create(userId: string, createTaskDto: CreateTaskDto) {
    const creator = await this.usersService.findOne(userId);
    if (creator.role !== UserRole.ADMIN) {
      await this.assertQualifiedAffiliate(userId);
    }

    let assignee: User | null = null;
    if (createTaskDto.assignedAgentId) {
      assignee = await this.usersService.findOne(createTaskDto.assignedAgentId);
      if (assignee.role === UserRole.ADMIN) {
        throw new ForbiddenException('Cannot assign tasks to another Admin');
      }
      await this.assertQualifiedAffiliate(assignee.id);
    }

    // Client work must live in Central Hub. Creating it under the managed
    // project first keeps the business, project, escrow and AM review trail in
    // one place; the local row below is only the affiliate-side mirror.
    if (createTaskDto.centralProjectId) {
      return this.createClientProjectTask(userId, createTaskDto, assignee);
    }

    const { centralProjectId: _centralProjectId, ...localFields } = createTaskDto;
    const task = this.tasksRepo.create({
      ...localFields,
      clientId: userId,
      ...(createTaskDto.assignedAgentId
        ? { status: TaskStatus.ASSIGNED }
        : {}),
    });
    return this.tasksRepo.save(task);
  }

  /**
   * Create a task inside a Central Hub project and store the local mirror with
   * the Central task id. The incoming sync finds that id and updates the same
   * row instead of creating a duplicate.
   */
  private async createClientProjectTask(
    userId: string,
    createTaskDto: CreateTaskDto,
    assignee: User | null,
  ) {
    const { centralProjectId, ...localFields } = createTaskDto;
    if (!centralProjectId) {
      throw new BadRequestException('A Central Hub project is required for client work');
    }

    const payload: Record<string, unknown> = {
      title: localFields.title,
      description: localFields.description,
      ...(assignee ? { assigneeUserId: assignee.id } : {}),
      ...(localFields.dueDate
        ? { dueAt: new Date(localFields.dueDate).toISOString() }
        : {}),
      ...(localFields.requiredSkills?.length
        ? { requiredSkills: localFields.requiredSkills }
        : {}),
    };

    const response = await this.accountManagerService.createManagedProjectTask(
      userId,
      centralProjectId,
      payload,
    );
    const centralTask = ((response as { data?: any })?.data ?? response) as any;
    if (!centralTask?.id) {
      throw new BadRequestException('Central Hub did not return the created task.');
    }

    const existing = await this.tasksRepo.findOne({
      where: { externalTaskId: centralTask.id },
    });

    // Central may keep an over-quota task unassigned until a price is agreed.
    // Do not mirror an assignee locally when Central did not accept one.
    const assignedLocally = Boolean(
      centralTask.assigneeId ?? centralTask.assignee?.id,
    );
    const localAssignee = assignedLocally ? assignee : null;

    const centralDeliverables = Array.isArray(centralTask.deliverables)
      ? centralTask.deliverables
      : typeof centralTask.deliverables === 'string'
        ? centralTask.deliverables
            .split(/\r?\n|,/)
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [];

    const patch = {
      ...localFields,
      clientId: userId,
      externalTaskId: centralTask.id,
      originSystem: OriginSystem.MCOM_CENTRAL,
      originRequesterId: centralTask.businessId,
      centralBusinessId: centralTask.businessId,
      centralBusinessName: centralTask.business?.businessName ?? undefined,
      taskType: 'CENTRAL_DELEGATION',
      projectId: centralTask.projectId ?? centralProjectId,
      projectName: centralTask.project?.title ?? undefined,
      category:
        String(centralTask.category || '').toLowerCase() === 'internal'
          ? TaskCategory.INTERNAL
          : TaskCategory.EXTERNAL,
      platforms: centralTask.platforms ?? [],
      requiredSkills:
        centralTask.requiredSkills ?? localFields.requiredSkills ?? [],
      deliverables: centralDeliverables.length ? centralDeliverables : undefined,
      materials: centralTask.materials ?? undefined,
      dueDate: centralTask.dueAt
        ? new Date(centralTask.dueAt)
        : localFields.dueDate
          ? new Date(localFields.dueDate)
          : undefined,
      assigneeEmail:
        centralTask.assignee?.email?.toLowerCase() ??
        localAssignee?.email?.toLowerCase(),
      assignedAgentId: localAssignee?.id,
      assignedAgent: localAssignee ?? undefined,
      status: this.mapCentralTaskStatus(
        centralTask.status,
        Boolean(localAssignee),
      ),
      compensationModel: centralTask.compensationModel ?? undefined,
      compensationAmount: centralTask.compensationAmount ?? undefined,
      compensationCurrency: centralTask.compensationCurrency ?? undefined,
      paymentStatus: centralTask.paymentStatus ?? undefined,
      lastCentralSyncAt: new Date(),
    } as Partial<Task>;

    if (existing) {
      return this.tasksRepo.save(this.tasksRepo.merge(existing, patch));
    }
    return this.tasksRepo.save(this.tasksRepo.create(patch as never) as unknown as Task);
  }

  private mapCentralTaskStatus(
    status: string | undefined,
    hasAssignee: boolean,
  ): TaskStatus {
    const map: Record<string, TaskStatus> = {
      PENDING_ASSIGNMENT: TaskStatus.OPEN,
      ASSIGNED: TaskStatus.ASSIGNED,
      ACCEPTED: TaskStatus.ACCEPTED,
      IN_PROGRESS: TaskStatus.ACCEPTED,
      SUBMITTED: TaskStatus.SUBMITTED,
      PENDING_BUSINESS_APPROVAL: TaskStatus.PENDING_BUSINESS_APPROVAL,
      REVISION_REQUESTED: TaskStatus.REVISION_REQUESTED,
      COMPLETED: TaskStatus.COMPLETED,
      DECLINED: TaskStatus.DECLINED,
      CANCELLED: TaskStatus.CANCELLED,
    };
    return (
      map[String(status || '').toUpperCase()] ??
      (hasAssignee ? TaskStatus.ASSIGNED : TaskStatus.OPEN)
    );
  }

  /**
   * Public enterprise request from the marketplace. Creates real, routable
   * work: assigned straight to the chosen affiliate when they still exist,
   * otherwise left in the open pool.
   */
  async createWorkRequest(dto: {
    title: string;
    description: string;
    budget: number;
    currency?: string;
    assigneeId?: string;
    assigneeEmail?: string;
  }) {
    const assignee = await this.resolveWorkRequestAssignee(dto.assigneeId, dto.assigneeEmail);
    const email = assignee?.email?.toLowerCase() ?? dto.assigneeEmail?.trim().toLowerCase();

    const request = this.tasksRepo.create({
      title: dto.title,
      description: dto.description,
      budget: dto.budget,
      currency: dto.currency || 'GBP',
      type: TaskType.ONE_TIME,
      taskType: 'WORK_REQUEST',
      originSystem: OriginSystem.INTERNAL,
      status: assignee ? TaskStatus.ASSIGNED : TaskStatus.OPEN,
      assignedAgent: assignee ?? undefined,
      assignedAgentId: assignee?.id,
      // Always keep the email routing column in sync with the chosen affiliate
      // so dashboard queries (which match on assigneeEmail) keep working.
      assigneeEmail: email || null,
    } as never);

    return this.tasksRepo.save(request as unknown as Task);
  }

  /**
   * Resolve the affiliate a public work request should be routed to. Only
   * verified, active, onboarded affiliates are assignable; an unknown or
   * ineligible id falls back to the open pool.
   */
  private async resolveWorkRequestAssignee(assigneeId?: string, assigneeEmail?: string): Promise<User | null> {
    let candidate: User | null = null;

    if (assigneeId) {
      try {
        candidate = await this.usersService.findOne(assigneeId);
      } catch {
        candidate = null;
      }
    } else if (assigneeEmail) {
      candidate = await this.usersService.findByEmail(assigneeEmail.trim().toLowerCase());
    }

    if (!candidate) return null;
    if (!AFFILIATE_ROLES.includes(candidate.role)) return null;
    if (candidate.status !== UserStatus.ACTIVE) return null;
    if (candidate.verificationStatus !== VerificationStatus.VERIFIED) return null;
    if (!candidate.isOnboarded) return null;

    return candidate;
  }

  /**
   * Central Hub → Affiliates task intake. Idempotent on `externalTaskId` so a
   * retried backend-to-backend call never duplicates work. Assignee is resolved
   * by email (Central and Affiliates issue different local user ids).
   */
  async createFromCentral(dto: CreateTaskFromCentralDto) {
    const assignee = dto.assignedAgentEmail
      ? await this.usersService.findByEmail(dto.assignedAgentEmail)
      : null;

    const existing = await this.tasksRepo.findOne({ where: { externalTaskId: dto.externalTaskId } });

    const patch: any = {
      externalTaskId: dto.externalTaskId,
      originSystem: dto.originSystem,
      originRequesterId: dto.originRequesterId,
      centralBusinessId: dto.originRequesterId,
      centralBusinessName: dto.businessName ?? undefined,
      taskType: dto.taskType ?? 'CENTRAL_DELEGATION',
      title: dto.title,
      description: dto.description,
      category: (dto.category as TaskCategory) ?? TaskCategory.EXTERNAL,
      projectId: dto.projectId ?? undefined,
      projectName: dto.projectName ?? undefined,
      requiredSkills: dto.requiredSkills ?? [],
      deliverables: dto.deliverables ?? [],
      materials: dto.materials ?? undefined,
      prerequisiteExternalTaskId: dto.prerequisiteExternalTaskId ?? undefined,
      compensationModel: dto.compensationModel ?? undefined,
      compensationAmount: dto.compensationAmount ?? undefined,
      compensationCurrency: dto.compensationCurrency ?? 'GBP',
      billableToBusiness: dto.billableToBusiness ?? false,
      businessChargeAmount: dto.businessChargeAmount ?? undefined,
      businessChargeCurrency: dto.businessChargeCurrency ?? 'GBP',
      chargeApprovalRequired: dto.chargeApprovalRequired ?? false,
      paymentStatus: dto.paymentStatus ?? undefined,
      ...(dto.chargeApprovalRequired === false
        ? { chargeApprovedAt: new Date() }
        : {}),
      platforms: dto.platforms ?? [],
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assigneeEmail: dto.assignedAgentEmail?.toLowerCase() ?? undefined,
      lastCentralSyncAt: new Date(),
    };

    if (existing) {
      // Declined work returns for reassignment: a fresh Central assignment
      // reactivates the same local record instead of creating a duplicate.
      if (existing.status === TaskStatus.DECLINED) {
        if (assignee) {
          patch.assignedAgent = assignee;
          patch.assignedAgentId = assignee.id;
        }
        patch.status = TaskStatus.ASSIGNED;
        patch.submissionData = null;
        patch.reviewNotes = null;
        patch.reviewHistory = [];
        patch.revisionCount = 0;
        patch.declineReason = null;
        patch.submittedAt = null;
        patch.completedAt = null;
        return this.tasksRepo.save(this.tasksRepo.merge(existing, patch));
      }

      // Do not resurrect finished work; only refresh assignment/metadata while
      // the task is still active on the affiliate side.
      const active = [
        TaskStatus.OPEN,
        TaskStatus.ASSIGNED,
        TaskStatus.ACCEPTED,
        TaskStatus.SUBMITTED,
        TaskStatus.PENDING_BUSINESS_APPROVAL,
        TaskStatus.REVISION_REQUESTED,
      ].includes(existing.status);
      if (active) {
        if (assignee) {
          patch.assignedAgent = assignee;
          patch.assignedAgentId = assignee.id;
          if (existing.status === TaskStatus.OPEN) patch.status = TaskStatus.ASSIGNED;
        }
        // Never clear an existing submission on a routine metadata refresh.
        delete patch.submissionData;
        delete patch.reviewNotes;
        delete patch.reviewHistory;
        delete patch.revisionCount;
        return this.tasksRepo.save(this.tasksRepo.merge(existing, patch));
      }
      return existing;
    }

    const task = this.tasksRepo.create({
      ...(patch as any),
      assignedAgent: assignee ?? undefined,
      assignedAgentId: assignee?.id ?? undefined,
      status: assignee ? TaskStatus.ASSIGNED : TaskStatus.OPEN,
    } as any) as unknown as Task;
    const saved = await this.tasksRepo.save(task);
    this.logger.log(`Received Central task ${saved.externalTaskId} (local ${saved.id})`);
    return saved;
  }

  async findAll(query: FindTasksQueryDto, requesterId?: string, requesterRole?: UserRole) {
    const { page = 1, limit = 10, search, status, assignedAgentId } = query;
    const skip = (page - 1) * limit;

    const baseWhere: any = {};
    if (status) baseWhere.status = status;
    if (search) baseWhere.title = Like(`%${search}%`);

    let where: any = baseWhere;

    if (requesterId && requesterRole && AFFILIATE_ROLES.includes(requesterRole)) {
      await this.assertQualifiedAffiliate(requesterId);
      const me = await this.usersService.findOne(requesterId);
      const mine = [{ ...baseWhere, assignedAgentId: requesterId }];
      if (me?.email) mine.push({ ...baseWhere, assigneeEmail: me.email.toLowerCase() });

      if (status) {
        if (status === TaskStatus.OPEN) {
          where = { ...baseWhere, assignedAgentId: null };
        } else {
          where = mine;
        }
      } else {
        // Default affiliate view: my assigned work + the open task pool.
        where = [...mine, { ...baseWhere, status: TaskStatus.OPEN, assignedAgentId: null }];
      }
    } else if (assignedAgentId) {
      where = { ...baseWhere, assignedAgentId };
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
      const me = await this.usersService.findOne(requesterId);
      const task = await this.tasksRepo.findOne({
        where: [
          { id, assignedAgentId: requesterId },
          ...(me?.email ? [{ id, assigneeEmail: me.email.toLowerCase() }] : []),
        ],
      });
      if (!task) throw new NotFoundException('Task not found');
      return task;
    }
    return this.findOne(id);
  }

  async assign(id: string, agentId: string) {
    const task = await this.findOne(id);
    if (task.externalTaskId) {
      throw new ConflictException({
        code: 'CENTRAL_TASK_ASSIGNMENT_REQUIRED',
        message:
          'This task is managed in Central Hub. Reassign it from the Account Manager workspace so Central keeps the assignee, project and review trail in sync.',
      });
    }
    if (task.status !== TaskStatus.OPEN && task.status !== TaskStatus.DECLINED) {
      throw new BadRequestException('Task is not open for assignment');
    }

    const agent = await this.usersService.findOne(agentId);
    if (agent.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot assign tasks to another Admin');
    }
    await this.assertQualifiedAffiliate(agentId);

    task.assignedAgent = agent;
    task.assignedAgentId = agentId;
    task.assigneeEmail = agent.email?.toLowerCase() ?? null;
    task.status = TaskStatus.ASSIGNED;

    const savedTask = await this.tasksRepo.save(task);
    this.notifyCentral(savedTask);
    return savedTask;
  }

  async respondToTask(
    id: string,
    userId: string,
    response: 'accept' | 'decline',
    options: { reason?: string } = {},
  ) {
    const task = await this.findOne(id);
    const me = await this.assertQualifiedAffiliate(userId);

    const isAssignee =
      task.assignedAgentId === userId ||
      (task.assigneeEmail && me?.email && task.assigneeEmail === me.email.toLowerCase());
    if (!isAssignee) {
      throw new ForbiddenException('You are not assigned to this task');
    }
    if (task.status !== TaskStatus.ASSIGNED) {
      throw new BadRequestException('Task is not in ASSIGNED state');
    }

    // Central may have delegated before this affiliate completed their local
    // SSO signup; bind the local user id now that they are known.
    if (!task.assignedAgentId) {
      task.assignedAgent = me;
      task.assignedAgentId = userId;
    }

    if (response === 'accept') {
      if (task.paymentStatus === 'ON_HOLD') {
        throw new BadRequestException(
          'The business has not locked the funds for this task yet. You can see the task, but work cannot start until payment is secured.',
        );
      }
      if (task.chargeApprovalRequired) {
        throw new BadRequestException(
          'The business must approve the charge for this task before work begins.',
        );
      }
      if (task.prerequisiteExternalTaskId) {
        const prerequisite = await this.tasksRepo.findOne({
          where: { externalTaskId: task.prerequisiteExternalTaskId },
          select: ['id', 'status', 'title'],
        });
        if (prerequisite && prerequisite.status !== TaskStatus.COMPLETED) {
          throw new BadRequestException(
            `This task cannot start until "${prerequisite.title}" is completed and approved.`,
          );
        }
      }
      task.status = TaskStatus.ACCEPTED;
      task.acceptedAt = new Date();
      task.declineReason = null;
    } else {
      const reason = (options.reason ?? '').trim();
      if (reason.length < 5) {
        throw new BadRequestException(
          'Provide a reason for declining this task so the business and an administrator can reassign it.',
        );
      }
      task.status = TaskStatus.DECLINED;
      task.declineReason = reason;
    }

    const savedTask = await this.tasksRepo.save(task);
    this.notifyCentral(savedTask);
    return savedTask;
  }

  /**
   * Submit deliverables for manual Central review. Accepts photos, PDFs, docs
   * or links — all persisted in `submissionData` and (optionally) as an
   * attachment list. Review is manual on Central.
   */
  async submit(id: string, userId: string, dto: SubmitTaskDto) {
    const task = await this.findOne(id);
    const me = await this.usersService.findOne(userId);
    await this.assertQualifiedAffiliate(userId);

    const isAssignee =
      task.assignedAgentId === userId ||
      (task.assigneeEmail && me?.email && task.assigneeEmail === me.email.toLowerCase());
    if (!isAssignee) {
      throw new ForbiddenException('You are not assigned to this task');
    }
    if (![TaskStatus.ACCEPTED, TaskStatus.REVISION_REQUESTED, TaskStatus.ASSIGNED].includes(task.status)) {
      throw new BadRequestException('Only accepted or revision-requested tasks can be submitted');
    }

    const submissionData: Record<string, unknown> = {
      ...(dto.submissionData ?? {}),
    };
    if (dto.notes) submissionData.notes = dto.notes;
    if (dto.links?.length) submissionData.links = dto.links;
    if (dto.attachments?.length) submissionData.attachments = dto.attachments;

    task.submissionData = submissionData;
    task.status = TaskStatus.SUBMITTED;
    task.submittedAt = new Date();

    const savedTask = await this.tasksRepo.save(task);
    this.notifyCentral(savedTask);
    return savedTask;
  }

  /** Affiliate confirms it has seen the admin's review notes and is resubmitting. */
  async acknowledgeReview(id: string, userId: string) {
    const task = await this.findOne(id);
    const me = await this.assertQualifiedAffiliate(userId);
    const isAssignee =
      task.assignedAgentId === userId ||
      (task.assigneeEmail && me?.email && task.assigneeEmail === me.email.toLowerCase());
    if (!isAssignee) {
      throw new ForbiddenException('You are not assigned to this task');
    }
    if (task.status !== TaskStatus.REVISION_REQUESTED) {
      throw new BadRequestException('Task has no pending review to acknowledge');
    }

    if (!task.assignedAgentId) {
      task.assignedAgent = me;
      task.assignedAgentId = userId;
    }

    const history = [...(task.reviewHistory ?? [])];
    if (history.length) history[history.length - 1].acknowledgedAt = new Date().toISOString();
    task.reviewHistory = history;
    task.status = TaskStatus.ACCEPTED;
    const saved = await this.tasksRepo.save(task);
    this.notifyCentral(saved, { reviewAcknowledged: true });
    return saved;
  }

  /**
   * Central admin review outcome. APPROVED finishes the task locally; changes
   * requested puts it into a resubmission loop.
   */
  async applyReviewFromCentral(
    externalTaskId: string,
    input: {
      decision: 'APPROVED' | 'CHANGES_REQUESTED';
      notes?: string;
      round?: number;
      compensationPence?: number;
      compensationAmount?: number;
    },
  ) {
    const task = await this.tasksRepo.findOne({ where: { externalTaskId } });
    if (!task) throw new NotFoundException('Task not found');

    const history = [...(task.reviewHistory ?? [])];
    history.push({
      round: input.round ?? history.length + 1,
      decision: input.decision,
      notes: input.notes ?? null,
      reviewedAt: new Date().toISOString(),
      acknowledgedAt: null,
    });
    task.reviewHistory = history;
    task.reviewNotes = input.notes ?? '';
    task.reviewedAt = new Date();

    // The Central admin may price a membership/access-pass task at approval
    // time. Mirror the final compensation onto the affiliate's local task so
    // their dashboard shows what they were paid.
    if (input.compensationPence != null) {
      task.compensationAmount = Number(input.compensationPence) / 100;
      task.compensationModel = 'FIXED';
    } else if (input.compensationAmount != null) {
      task.compensationAmount = Number(input.compensationAmount);
      task.compensationModel = 'FIXED';
    }

    if (input.decision === 'APPROVED') {
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
    } else {
      task.status = TaskStatus.REVISION_REQUESTED;
      task.revisionCount = (task.revisionCount ?? 0) + 1;
    }

    const saved = await this.tasksRepo.save(task);
    this.logger.log(`Central review (${input.decision}) applied to task ${task.id}`);
    return saved;
  }

  /**
   * Central status push (charge approval, cancellation, business approval).
   * Keeps the affiliate copy in step without ever re-opening finished work.
   */
  async applyStatusFromCentral(
    externalTaskId: string,
    input: { status?: string; chargeApprovalRequired?: boolean; note?: string },
  ) {
    const task = await this.tasksRepo.findOne({ where: { externalTaskId } });
    if (!task) throw new NotFoundException('Task not found');

    const map: Record<string, TaskStatus> = {
      open: TaskStatus.OPEN,
      assigned: TaskStatus.ASSIGNED,
      accepted: TaskStatus.ACCEPTED,
      submitted: TaskStatus.SUBMITTED,
      pending_business_approval: TaskStatus.PENDING_BUSINESS_APPROVAL,
      revision_requested: TaskStatus.REVISION_REQUESTED,
      completed: TaskStatus.COMPLETED,
      cancelled: TaskStatus.CANCELLED,
      declined: TaskStatus.DECLINED,
    };

    if (input.chargeApprovalRequired === false) {
      task.chargeApprovalRequired = false;
      task.chargeApprovedAt = new Date();
    }
    if (input.chargeApprovalRequired === true) {
      task.chargeApprovalRequired = true;
    }

    const next = input.status ? map[input.status.toLowerCase()] : undefined;
    if (next) {
      task.status = next;
      if (next === TaskStatus.COMPLETED) task.completedAt = new Date();
      if (next === TaskStatus.ACCEPTED && !task.acceptedAt) task.acceptedAt = new Date();
    }
    if (input.note) task.reviewNotes = input.note;

    task.lastCentralSyncAt = new Date();
    return this.tasksRepo.save(task);
  }

  async updateStatus(id: string, status: TaskStatus, userId: string) {
    const task = await this.findOne(id);
    const user = await this.usersService.findOne(userId);
    if (AFFILIATE_ROLES.includes(user.role)) {
      await this.assertQualifiedAffiliate(userId);
      if (task.assignedAgentId !== userId) {
        throw new ForbiddenException('You are not authorized to update this task.');
      }
      const allowed =
        (task.status === TaskStatus.ACCEPTED && status === TaskStatus.SUBMITTED) ||
        (task.status === TaskStatus.REVISION_REQUESTED && status === TaskStatus.SUBMITTED);
      if (!allowed) {
        throw new BadRequestException('Affiliates can submit an accepted or revision-requested task for review.');
      }
    } else if (user.role !== UserRole.ADMIN) {
      if (task.assignedAgentId !== userId && task.clientId !== userId) {
        throw new ForbiddenException('You are not authorized to update this task.');
      }
    }
    task.status = status;
    if (status === TaskStatus.SUBMITTED) task.submittedAt = new Date();
    if (status === TaskStatus.COMPLETED) task.completedAt = new Date();
    const saved = await this.tasksRepo.save(task);
    this.notifyCentral(saved);
    return saved;
  }

  /** Reconcile stale onboarding flags when the real service supports it. */
  private async findAffiliateUser(userId: string) {
    const service = this.usersService as unknown as {
      reconcileOnboarding?: (id: string) => Promise<any>;
    };
    return typeof service.reconcileOnboarding === 'function'
      ? service.reconcileOnboarding(userId)
      : this.usersService.findOne(userId);
  }

  private async assertVerifiedAffiliate(userId: string) {
    const user = await this.findAffiliateUser(userId);
    if (user.role !== UserRole.ADMIN && (user.verificationStatus !== VerificationStatus.VERIFIED || !user.isOnboarded)) {
      throw this.taskAccessError(user);
    }
    return user;
  }

  private async assertQualifiedAffiliate(userId: string) {
    const user = await this.findAffiliateUser(userId);
    if (user.role === UserRole.ADMIN) return user;
    if (!AFFILIATE_ROLES.includes(user.role)) {
      throw new ForbiddenException({
        code: 'AFFILIATE_ROLE_REQUIRED',
        message: 'Only agent, account manager and consultant accounts can access delegated work.',
      });
    }

    // Agents execute marketplace work and must pass the full qualification
    // gate. Account managers and consultants are trusted relationship roles:
    // they can act on work delegated directly to them once onboarding is done.
    if (user.role === UserRole.AGENT) {
      if (
        user.verificationStatus !== VerificationStatus.VERIFIED ||
        !user.isOnboarded ||
        !user.isQuizPassed ||
        !user.skills?.length
      ) {
        throw this.taskAccessError(user);
      }
      return user;
    }

    if (!user.isOnboarded) {
      throw this.taskAccessError(user);
    }
    return user;
  }

  /**
   * Structured access error so the affiliate dashboard can explain the real
   * blocker (admin verification pending, onboarding incomplete, assessment or
   * skills missing) instead of showing a generic "complete onboarding" message
   * even after the user has finished the flow.
   */
  private taskAccessError(user: {
    verificationStatus: VerificationStatus;
    isOnboarded: boolean;
    isQuizPassed: boolean;
    skills?: string[] | null;
    verificationSubmission?: unknown;
    verificationDocumentMimeType?: string | null;
  }): ForbiddenException {
    const pendingVerification = user.verificationStatus === VerificationStatus.PENDING;
    const rejected = user.verificationStatus === VerificationStatus.REJECTED;
    const verified = user.verificationStatus === VerificationStatus.VERIFIED;
    const hasSubmission = Boolean(user.verificationSubmission);
    const hasDocument = Boolean(user.verificationDocumentMimeType);
    const hasSkills = Boolean(user.skills?.length);

    let message: string;
    if (rejected) {
      message = 'Your verification was not approved. Update your profile and identity document, then resubmit for review.';
    } else if (pendingVerification || (!verified && !rejected)) {
      message = hasSubmission && hasDocument
        ? 'Your profile is awaiting administrator verification. You will get access to delegated work as soon as it is approved.'
        : 'Submit your onboarding profile and identity document so an administrator can verify your account.';
    } else if (!user.isQuizPassed) {
      message = 'Your account is verified. Complete the assessment to unlock delegated work.';
    } else if (!user.isOnboarded) {
      message = 'Your account is verified and your assessment is passed. Finish the remaining onboarding steps to unlock delegated work.';
    } else if (user.skills && !hasSkills) {
      message = 'Your account is verified. Add at least one skill so work can be matched to you.';
    } else {
      message = 'Administrator verification, onboarding, assessment and skill requirements must be complete before affiliate task access.';
    }

    return new ForbiddenException({
      code: pendingVerification
        ? 'VERIFICATION_PENDING'
        : rejected
          ? 'VERIFICATION_REJECTED'
          : !user.isOnboarded
            ? 'ONBOARDING_REQUIRED'
            : 'AFFILIATE_QUALIFICATION_REQUIRED',
      message,
      verificationStatus: user.verificationStatus,
      isOnboarded: user.isOnboarded,
      isQuizPassed: user.isQuizPassed,
      hasVerificationSubmission: hasSubmission,
      hasVerificationDocument: hasDocument,
      hasSkills,
    });
  }

  private async notifyCentral(
    task: Task,
    extra: { reviewAcknowledged?: boolean } = {},
  ) {
    if (!task.externalTaskId) return;
    this.logger.log(`Syncing Central task ${task.externalTaskId} status ${task.status}...`);
    try {
      await lastValueFrom(
        this.httpService.post(
          `${this.centralUrl}/affiliate/tasks/${encodeURIComponent(task.externalTaskId)}/status`,
          {
            status: task.status,
            affiliateTaskId: task.id,
            submissionData: task.submissionData ?? null,
            reviewAcknowledged: extra.reviewAcknowledged ?? false,
            declineReason: task.declineReason ?? null,
          },
          {
            headers: {
              'x-api-key': this.configService.get<string>('INTERNAL_API_KEY'),
            },
          },
        ),
      );
      task.lastCentralSyncAt = new Date();
      await this.tasksRepo.update(task.id, { lastCentralSyncAt: task.lastCentralSyncAt });
      this.logger.log('Sync successful.');
    } catch (error: any) {
      this.logger.error(`Sync failed: ${error?.response?.data?.message || error.message}`);
    }
  }
}
