import { BadRequestException, ForbiddenException, HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction, TransactionType } from '../wallet/entities/transaction.entity';
import { User, UserRole, UserStatus, VerificationStatus } from '../users/entities/user.entity';

@Injectable()
export class AccountManagerService {
  private readonly logger = new Logger(AccountManagerService.name);

  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /** Businesses assigned to this account manager in Central Hub. */
  async getAssignedBusinesses(accountManagerId: string) {
    const manager = await this.usersRepo.findOne({ where: { id: accountManagerId } });
    if (!manager?.mcomUserId) return { manager: null, businesses: [], total: 0 };

    const centralUrl =
      this.config.get<string>('MCOM_CENTRAL_URL') ||
      'http://localhost:3010/api/v1';
    const apiKey = this.config.get<string>('INTERNAL_API_KEY');

    try {
      const response = await firstValueFrom(
        this.http.get(
          `${centralUrl.replace(/\/+$/, '')}/affiliate/account-managers/${encodeURIComponent(manager.mcomUserId)}/businesses`,
          { headers: { 'x-api-key': apiKey }, timeout: 10000 },
        ),
      );
      return response.data?.data ?? response.data ?? { manager: null, businesses: [], total: 0 };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Assigned businesses lookup failed: ${message}`);
      return { manager: null, businesses: [], total: 0, error: 'Central Hub is unavailable.' };
    }
  }

  private async centralConnection(accountManagerId: string) {
    const manager = await this.usersRepo.findOne({ where: { id: accountManagerId } });
    if (!manager?.mcomUserId) return null;
    const centralUrl =
      this.config.get<string>('MCOM_CENTRAL_URL') ||
      'http://localhost:3010/api/v1';
    const apiKey = this.config.get<string>('INTERNAL_API_KEY');
    return {
      manager,
      url: `${centralUrl.replace(/\/+$/, '')}/affiliate/account-managers/${encodeURIComponent(manager.mcomUserId)}`,
      headers: { 'x-api-key': apiKey },
    };
  }

  private async centralGet<T>(accountManagerId: string, path: string, params?: Record<string, unknown>) {
    const connection = await this.centralConnection(accountManagerId);
    if (!connection) {
      return { success: false, data: [], total: 0, message: 'Central Hub account is not linked.' };
    }
    try {
      const response = await firstValueFrom(
        this.http.get<T>(`${connection.url}${path}`, {
          headers: connection.headers,
          params,
          timeout: 12000,
        }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.warn(
        `Central manager request failed (${path}): ${error?.response?.data?.message || error?.message}`,
      );
      return {
        success: false,
        data: [],
        total: 0,
        message: 'Central Hub is unavailable.',
      };
    }
  }

  private async centralPost<T>(accountManagerId: string, path: string, body: unknown) {
    const connection = await this.centralConnection(accountManagerId);
    if (!connection) {
      throw new BadRequestException('Central Hub account is not linked.');
    }
    try {
      const response = await firstValueFrom(
        this.http.post<T>(`${connection.url}${path}`, body, {
          headers: connection.headers,
          timeout: 15000,
        }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.warn(
        `Central manager POST failed (${path}): ${JSON.stringify(error?.response?.data || error?.message)}`,
      );
      if (error instanceof HttpException) throw error;
      const status = typeof error?.response?.status === 'number' ? error.response.status : null;
      if (status) {
        throw new HttpException(error.response.data || error.message, status);
      }
      throw error;
    }
  }

  /**
   * Resolve a 247GBS directory affiliate id, Central Hub user id, or email into
   * the canonical identifier Central Hub expects, while preserving local active
   * affiliate eligibility checks.
   */
  private async resolveCentralAssigneeId(assigneeUserId: string): Promise<string> {
    const trimmed = assigneeUserId.trim();
    if (!trimmed) {
      throw new BadRequestException('Assignee user id is required.');
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
    const localUser = await this.usersRepo.findOne({
      where: [
        ...(isUuid ? [{ id: trimmed }] : []),
        { mcomUserId: trimmed },
        ...(trimmed.includes('@') ? [{ email: trimmed.toLowerCase() }] : []),
      ],
    });

    if (localUser) {
      if (
        ![UserRole.AGENT, UserRole.CONSULTANT, UserRole.ACCOUNT_MANAGER].includes(localUser.role)
      ) {
        throw new ForbiddenException('Selected user is not an eligible affiliate.');
      }
      if (localUser.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('Selected affiliate is not active.');
      }
      if (
        localUser.verificationStatus &&
        localUser.verificationStatus !== VerificationStatus.VERIFIED
      ) {
        throw new ForbiddenException('Selected affiliate is not verified yet.');
      }
      if (localUser.isOnboarded === false) {
        throw new ForbiddenException('Selected affiliate has not completed onboarding.');
      }
      if (
        localUser.role === UserRole.AGENT &&
        (localUser.isQuizPassed === false ||
          (Array.isArray(localUser.skills) && localUser.skills.length === 0))
      ) {
        throw new ForbiddenException('Selected agent has not completed assessment and skill qualification.');
      }
      return localUser.mcomUserId || localUser.email;
    }

    return trimmed;
  }

  /** All tasks across the businesses this manager coordinates. */
  getManagedTasks(accountManagerId: string, query: Record<string, unknown>) {
    return this.centralGet(accountManagerId, '/tasks', query);
  }

  getManagedTask(accountManagerId: string, taskId: string) {
    return this.centralGet(accountManagerId, `/tasks/${encodeURIComponent(taskId)}`);
  }

  /** Account Manager checks a submission before it reaches the business. */
  reviewManagedTask(
    accountManagerId: string,
    taskId: string,
    body: { decision: 'APPROVED' | 'CHANGES_REQUESTED'; notes?: string },
  ) {
    return this.centralPost(accountManagerId, `/tasks/${encodeURIComponent(taskId)}/review`, body);
  }

  async assignManagedTask(
    accountManagerId: string,
    taskId: string,
    body: { assigneeUserId: string; note?: string },
  ) {
    const resolvedAssigneeId = await this.resolveCentralAssigneeId(body.assigneeUserId);
    return this.centralPost(accountManagerId, `/tasks/${encodeURIComponent(taskId)}/assign`, {
      ...body,
      assigneeUserId: resolvedAssigneeId,
    });
  }

  getManagedRequests(accountManagerId: string, query: Record<string, unknown>) {
    return this.centralGet(accountManagerId, '/requests', query);
  }

  clarifyManagedRequest(accountManagerId: string, requestId: string, note: string) {
    return this.centralPost(accountManagerId, `/requests/${encodeURIComponent(requestId)}/clarify`, {
      note,
    });
  }

  quoteManagedRequest(
    accountManagerId: string,
    requestId: string,
    body: { estimatedCost: number; currency?: string; notes?: string },
  ) {
    return this.centralPost(accountManagerId, `/requests/${encodeURIComponent(requestId)}/quote`, body);
  }

  convertManagedRequest(
    accountManagerId: string,
    requestId: string,
    body: Record<string, unknown>,
  ) {
    return this.centralPost(accountManagerId, `/requests/${encodeURIComponent(requestId)}/convert`, body);
  }

  getManagedProjects(accountManagerId: string, query: Record<string, unknown>) {
    return this.centralGet(accountManagerId, '/projects', query);
  }

  async createManagedProjectTask(
    accountManagerId: string,
    projectId: string,
    body: Record<string, unknown>,
  ) {
    const payload: Record<string, unknown> = {
      ...body,
      projectId,
    };
    if (typeof payload.assigneeUserId === 'string' && payload.assigneeUserId.trim()) {
      payload.assigneeUserId = await this.resolveCentralAssigneeId(payload.assigneeUserId);
    } else {
      delete payload.assigneeUserId;
    }
    return this.centralPost(
      accountManagerId,
      `/projects/${encodeURIComponent(projectId)}/tasks`,
      payload,
    );
  }

  closeManagedProject(
    accountManagerId: string,
    projectId: string,
    body: Record<string, unknown>,
  ) {
    return this.centralPost(accountManagerId, `/projects/${encodeURIComponent(projectId)}/close`, body);
  }

  async getRevenueDashboard(accountManagerId: string) {
    const managedAgents = await this.usersRepo.find({
      where: { role: UserRole.AGENT },
      select: ['id', 'firstName', 'lastName', 'email'],
    });

    const agentIds = managedAgents.map(a => a.id);

    const [totalRevenue, pendingRevenue, completedTasks, totalAgents] = await Promise.all([
      this.tasksRepo
        .createQueryBuilder('task')
        .where('task.assignedAgentId IN (:...agentIds)', { agentIds })
        .andWhere('task.status = :status', { status: TaskStatus.COMPLETED })
        .select('COALESCE(SUM(task.budget), 0)', 'sum')
        .getRawOne()
        .then(r => Number(r?.sum || 0)),

      this.tasksRepo
        .createQueryBuilder('task')
        .where('task.assignedAgentId IN (:...agentIds)', { agentIds })
        .andWhere('task.status IN (:...statuses)', { statuses: [TaskStatus.ACCEPTED, TaskStatus.SUBMITTED] })
        .select('COALESCE(SUM(task.budget), 0)', 'sum')
        .getRawOne()
        .then(r => Number(r?.sum || 0)),

      this.tasksRepo.count({
        where: { assignedAgentId: agentIds.length > 0 ? In(agentIds) : 'no-agents', status: TaskStatus.COMPLETED },
      }),

      Promise.resolve(managedAgents.length),
    ]);

    const recentTransactions = await this.transactionRepo
      .createQueryBuilder('tx')
      .innerJoin('tx.wallet', 'wallet')
      .where('wallet.userId IN (:...agentIds)', { agentIds })
      .orderBy('tx.createdAt', 'DESC')
      .take(10)
      .getMany();

    return {
      totalRevenue,
      pendingRevenue,
      completedTasks,
      totalAgents,
      recentTransactions,
      agents: managedAgents,
    };
  }
}