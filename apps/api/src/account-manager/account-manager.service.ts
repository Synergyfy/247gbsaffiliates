import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction, TransactionType } from '../wallet/entities/transaction.entity';
import { User, UserRole } from '../users/entities/user.entity';

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
      throw new Error('Central Hub account is not linked.');
    }
    const response = await firstValueFrom(
      this.http.post<T>(`${connection.url}${path}`, body, {
        headers: connection.headers,
        timeout: 15000,
      }),
    );
    return response.data;
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

  assignManagedTask(
    accountManagerId: string,
    taskId: string,
    body: { assigneeUserId: string; note?: string },
  ) {
    return this.centralPost(accountManagerId, `/tasks/${encodeURIComponent(taskId)}/assign`, body);
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