import {
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction, TransactionType } from '../wallet/entities/transaction.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { QuizAttempt } from '../assessment/entities/quiz_attempt.entity';

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
    @InjectRepository(QuizAttempt)
    private quizAttemptRepo: Repository<QuizAttempt>,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /** Businesses assigned to this account manager in Central Hub. */
  async getAssignedBusinesses(accountManagerId: string) {
    const manager = await this.usersRepo.findOne({ where: { id: accountManagerId } });
    if (!manager?.mcomUserId) {
      throw new ConflictException({
        code: 'CENTRAL_ACCOUNT_NOT_LINKED',
        message:
          'Your Central Hub account is not linked yet. Sign in through Central Hub SSO before managing businesses.',
      });
    }

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
    } catch (error: any) {
      const status = Number(error?.response?.status);
      if (status >= 400 && status < 500) {
        throw new HttpException(
          error?.response?.data ?? {
            code: 'CENTRAL_REQUEST_FAILED',
            message: 'Central Hub rejected the businesses request.',
          },
          status,
        );
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Assigned businesses lookup failed: ${message}`);
      throw new ServiceUnavailableException({
        code: 'CENTRAL_UNAVAILABLE',
        message:
          'Central Hub is unavailable right now. Your assigned businesses could not be loaded; please try again shortly.',
      });
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
      throw new ConflictException({
        code: 'CENTRAL_ACCOUNT_NOT_LINKED',
        message:
          'Your Central Hub account is not linked yet. Sign in through Central Hub SSO before managing work.',
      });
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
      const status = Number(error?.response?.status);
      if (status >= 400 && status < 500) {
        // Upstream validation/ownership errors must not masquerade as outages.
        throw new HttpException(
          error?.response?.data ?? {
            code: 'CENTRAL_REQUEST_FAILED',
            message: 'Central Hub rejected the request.',
          },
          status,
        );
      }
      throw new ServiceUnavailableException({
        code: 'CENTRAL_UNAVAILABLE',
        message:
          'Central Hub is unavailable right now. Your work list could not be loaded; please try again shortly.',
      });
    }
  }

  private async centralPost<T>(accountManagerId: string, path: string, body: unknown) {
    const connection = await this.centralConnection(accountManagerId);
    if (!connection) {
      throw new ConflictException({
        code: 'CENTRAL_ACCOUNT_NOT_LINKED',
        message:
          'Your Central Hub account is not linked yet. Sign in through Central Hub SSO before managing work.',
      });
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
      const status = Number(error?.response?.status);
      if (status >= 400 && status < 500) {
        throw new HttpException(
          error?.response?.data ?? {
            code: 'CENTRAL_REQUEST_FAILED',
            message: 'Central Hub rejected the request.',
          },
          status,
        );
      }
      this.logger.warn(
        `Central manager update failed (${path}): ${error?.message}`,
      );
      throw new ServiceUnavailableException({
        code: 'CENTRAL_UNAVAILABLE',
        message:
          'Central Hub is unavailable right now. The change was not saved; please try again shortly.',
      });
    }
  }

  /**
   * Central Hub identifies affiliates by its own user id. The UI works with
   * local 247GBS ids, so translate local -> Central before forwarding. If the
   * identifier is already a Central id (or an unknown id) it is passed through
   * and Central remains the final validator.
   */
  private async resolveCentralAssigneeId(identifier: string) {
    const byLocalId = await this.usersRepo.findOne({ where: { id: identifier } });
    if (byLocalId) {
      if (!byLocalId.mcomUserId) {
        throw new ConflictException({
          code: 'AFFILIATE_CENTRAL_ACCOUNT_NOT_LINKED',
          message:
            'That affiliate has not connected their Central Hub account yet, so work cannot be delegated to them.',
        });
      }
      return byLocalId.mcomUserId;
    }

    const byCentralId = await this.usersRepo.findOne({
      where: { mcomUserId: identifier },
    });
    return byCentralId?.mcomUserId ?? identifier;
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
    const assigneeUserId = await this.resolveCentralAssigneeId(body.assigneeUserId);
    return this.centralPost(accountManagerId, `/tasks/${encodeURIComponent(taskId)}/assign`, {
      ...body,
      assigneeUserId,
    });
  }

  /** Create a task inside one of the manager's projects and sync it to 247GBS. */
  async createManagedProjectTask(
    accountManagerId: string,
    projectId: string,
    body: Record<string, unknown>,
  ) {
    const payload = { ...body };
    if (typeof payload.assigneeUserId === 'string' && payload.assigneeUserId.trim()) {
      payload.assigneeUserId = await this.resolveCentralAssigneeId(
        payload.assigneeUserId.trim(),
      );
    }
    return this.centralPost(
      accountManagerId,
      `/projects/${encodeURIComponent(projectId)}/tasks`,
      payload,
    );
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

  /**
   * Build a task query limited to work this manager coordinates. There is no
   * local manager column on tasks, so the scope is:
   *   - tasks attached to a Central business assigned to this manager, or
   *   - tasks the manager created locally (campaigns/projects).
   * This prevents the revenue/agent dashboards from counting the whole portal.
   */
  private managerTaskQuery(accountManagerId: string, businessIds: string[]) {
    const qb = this.tasksRepo.createQueryBuilder('task').where(
      new Brackets((inner) => {
        inner.where('task.clientId = :accountManagerId', { accountManagerId });
        if (businessIds.length) {
          inner.orWhere('task.centralBusinessId IN (:...businessIds)', { businessIds });
        }
      }),
    );
    return qb;
  }

  private async managerBusinessIds(
    accountManagerId: string,
    rethrow = false,
  ): Promise<string[]> {
    try {
      const assigned = await this.getAssignedBusinesses(accountManagerId);
      const businesses = Array.isArray((assigned as { businesses?: unknown })?.businesses)
        ? ((assigned as { businesses: Array<{ id?: string }> }).businesses ?? [])
        : [];
      return businesses
        .map((business) => business.id)
        .filter((id): id is string => Boolean(id));
    } catch (error) {
      if (rethrow) throw error;
      // Local campaign/project tasks are still reportable when Central is
      // temporarily unreachable; the task scope falls back to manager-created
      // records instead of silently returning portal-wide totals.
      this.logger.warn(
        `Manager business scope unavailable: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }
  }

  async getRevenueDashboard(accountManagerId: string) {
    const businessIds = await this.managerBusinessIds(accountManagerId);
    const scoped = this.managerTaskQuery(accountManagerId, businessIds);
    const pendingStatuses = [
      TaskStatus.ACCEPTED,
      TaskStatus.SUBMITTED,
      TaskStatus.PENDING_BUSINESS_APPROVAL,
      TaskStatus.REVISION_REQUESTED,
      TaskStatus.APPROVED,
    ];

    // Never sum mixed currencies into one meaningless total. Each currency is
    // reported separately and `totalRevenue` is only a number when there is a
    // single currency in play.
    const currencyRows = await scoped
      .clone()
      .select("COALESCE(task.currency, 'USD')", 'currency')
      .addSelect(
        'COALESCE(SUM(CASE WHEN task.status = :completedStatus THEN task.budget ELSE 0 END), 0)',
        'completedRevenue',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN task.status IN (:...pendingStatuses) THEN task.budget ELSE 0 END), 0)',
        'pendingRevenue',
      )
      .addSelect(
        'COUNT(*) FILTER (WHERE task.status = :completedStatus)',
        'completedTasks',
      )
      .setParameters({
        completedStatus: TaskStatus.COMPLETED,
        pendingStatuses,
      })
      .groupBy("COALESCE(task.currency, 'USD')")
      .orderBy('currency', 'ASC')
      .getRawMany<{
        currency: string;
        completedRevenue: string;
        pendingRevenue: string;
        completedTasks: string;
      }>();

    const revenueByCurrency = currencyRows.map((row) => ({
      currency: (row.currency || 'USD').toUpperCase(),
      completedRevenue: Number(row.completedRevenue || 0),
      pendingRevenue: Number(row.pendingRevenue || 0),
      completedTasks: Number(row.completedTasks || 0),
    }));
    const singleCurrency = revenueByCurrency.length === 1;

    const agentRows = await scoped
      .clone()
      .select('DISTINCT task.assignedAgentId', 'agentId')
      .andWhere('task.assignedAgentId IS NOT NULL')
      .getRawMany<{ agentId: string }>();
    const agentIds = agentRows
      .map((row) => row.agentId)
      .filter((id): id is string => Boolean(id));

    const [managedAgents, recentTransactions] = await Promise.all([
      agentIds.length
        ? this.usersRepo.find({
            where: { id: In(agentIds), role: UserRole.AGENT },
            select: ['id', 'firstName', 'lastName', 'email'],
          })
        : Promise.resolve([] as User[]),
      agentIds.length
        ? this.transactionRepo
            .createQueryBuilder('tx')
            .innerJoin('tx.wallet', 'wallet')
            .where('wallet.userId IN (:...agentIds)', { agentIds })
            .orderBy('tx.createdAt', 'DESC')
            .take(10)
            .getMany()
        : Promise.resolve([] as Transaction[]),
    ]);

    const completedTasks = revenueByCurrency.reduce(
      (total, row) => total + row.completedTasks,
      0,
    );

    return {
      totalRevenue: singleCurrency ? revenueByCurrency[0].completedRevenue : null,
      pendingRevenue: singleCurrency ? revenueByCurrency[0].pendingRevenue : null,
      currency: singleCurrency ? revenueByCurrency[0].currency : null,
      mixedCurrencies: revenueByCurrency.length > 1,
      revenueByCurrency,
      completedTasks,
      totalAgents: managedAgents.length,
      recentTransactions,
      agents: managedAgents,
    };
  }

  /**
   * Manager-scoped agent roster for the Account Manager Agents screen. Agents
   * are derived from the work this manager coordinates (Central businesses +
   * locally created tasks), never from the global user table.
   */
  async getManagedAgents(accountManagerId: string) {
    const businessIds = await this.managerBusinessIds(accountManagerId, true);
    const taskRows = await this.managerTaskQuery(accountManagerId, businessIds)
      .clone()
      .select(['task.id', 'task.assignedAgentId', 'task.status'])
      .andWhere('task.assignedAgentId IS NOT NULL')
      .getMany();

    const counts = new Map<
      string,
      { active: number; completed: number; total: number }
    >();
    for (const task of taskRows) {
      if (!task.assignedAgentId) continue;
      const current = counts.get(task.assignedAgentId) ?? {
        active: 0,
        completed: 0,
        total: 0,
      };
      current.total += 1;
      if (task.status === TaskStatus.COMPLETED) {
        current.completed += 1;
      } else if (
        [
          TaskStatus.ASSIGNED,
          TaskStatus.ACCEPTED,
          TaskStatus.SUBMITTED,
          TaskStatus.PENDING_BUSINESS_APPROVAL,
          TaskStatus.REVISION_REQUESTED,
          TaskStatus.APPROVED,
        ].includes(task.status)
      ) {
        current.active += 1;
      }
      counts.set(task.assignedAgentId, current);
    }

    const agentIds = Array.from(counts.keys());
    if (!agentIds.length) {
      return {
        items: [],
        total: 0,
        scope: 'manager',
        businessCount: businessIds.length,
        message:
          businessIds.length > 0
            ? 'No agents have been assigned to your managed work yet.'
            : 'No Central Hub businesses are linked to your account yet, so there are no managed agents to show.',
      };
    }

    const [agents, attempts] = await Promise.all([
      this.usersRepo.find({
        where: { id: In(agentIds), role: UserRole.AGENT },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'profileImage',
          'role',
          'status',
          'verificationStatus',
          'isOnboarded',
          'isQuizPassed',
          'skills',
          'languages',
          'hourlyRate',
          'currency',
          'timezone',
          'city',
          'region',
          'postcode',
          'mcomUserId',
          'createdAt',
        ],
      }),
      this.quizAttemptRepo.find({
        where: { userId: In(agentIds) },
        order: { createdAt: 'DESC' },
        select: ['id', 'userId', 'percentage', 'band', 'createdAt'],
      }),
    ]);

    const latestAttempt = new Map<string, QuizAttempt>();
    const latestPassedAttempt = new Map<string, QuizAttempt>();
    for (const attempt of attempts) {
      if (!latestAttempt.has(attempt.userId)) latestAttempt.set(attempt.userId, attempt);
      if (
        !latestPassedAttempt.has(attempt.userId) &&
        String(attempt.band || '').toLowerCase() !== 'fail'
      ) {
        latestPassedAttempt.set(attempt.userId, attempt);
      }
    }

    const items = agents
      .map((agent) => {
        const stats = counts.get(agent.id) ?? { active: 0, completed: 0, total: 0 };
        const latest = latestAttempt.get(agent.id);
        const passed = latestPassedAttempt.get(agent.id);
        return {
          id: agent.id,
          mcomUserId: agent.mcomUserId ?? null,
          email: agent.email,
          firstName: agent.firstName,
          lastName: agent.lastName,
          name:
            [agent.firstName, agent.lastName].filter(Boolean).join(' ') ||
            agent.email,
          profileImage: agent.profileImage,
          role: agent.role,
          status: agent.status,
          verificationStatus: agent.verificationStatus,
          isOnboarded: agent.isOnboarded,
          isQuizPassed: agent.isQuizPassed,
          skills: agent.skills ?? [],
          languages: agent.languages ?? [],
          hourlyRate: agent.hourlyRate,
          currency: agent.currency,
          timezone: agent.timezone,
          city: agent.city,
          region: agent.region,
          postcode: agent.postcode,
          createdAt: agent.createdAt,
          assessmentScore: passed?.percentage ?? latest?.percentage ?? null,
          latestAssessmentBand: latest?.band ?? null,
          activeTasksCount: stats.active,
          completedTasksCount: stats.completed,
          totalTasksCount: stats.total,
        };
      })
      .sort(
        (a, b) =>
          b.completedTasksCount - a.completedTasksCount ||
          b.activeTasksCount - a.activeTasksCount ||
          a.name.localeCompare(b.name),
      );

    return {
      items,
      total: items.length,
      scope: 'manager',
      businessCount: businessIds.length,
    };
  }
}