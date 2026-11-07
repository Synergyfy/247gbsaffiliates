import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';

export interface McomWalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  platformName?: string | null;
  platformSlug?: string | null;
  category: string;
  reference?: string | null;
  description?: string | null;
  status: string;
  createdAt: string;
  /** Local 247GBS task id resolved from the Central settlement reference. */
  taskId?: string | null;
  taskTitle?: string | null;
}

export interface McomWalletSnapshot {
  wallet: {
    id: string;
    balance: number;
    availableBalance: number;
    currency: string;
    status: string;
    lastTransactionAt: string | null;
  };
  holds: Array<{
    id: string;
    amount: number;
    reference: string | null;
    description: string | null;
    status: string;
    expiresAt: string;
    createdAt: string;
  }>;
  transactions: {
    success: boolean;
    data: McomWalletTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  /**
   * Referral commission breakdown from Central Hub. These credits are already
   * part of the wallet balance; this view exists so affiliates can see which
   * referred users generated the earning.
   */
  referralEarnings?: {
    summary: {
      totalReferrals: number;
      creditedReferrals: number;
      totalEarnedCredits: number;
      totalEarnedGbp: number;
      creditedCommissionCount: number;
      configActive: boolean;
      configVersion: number | null;
    };
    referredUsers: Array<{
      id: string;
      email: string;
      displayName: string;
      role: string;
      joinedAt: string;
      earnedCredits: number;
      earnedGbp: number;
      creditedCount: number;
      evaluationCount: number;
      lastActivityAt: string | null;
    }>;
    history: Array<{
      id: string;
      sourceType: 'MEMBERSHIP' | 'ACCESS_PASS';
      sourceName: string | null;
      purchaseAmountGbp: number;
      commissionAmountGbp: number;
      commissionCredits: number;
      status: string;
      referredUserId: string;
      referredName: string | null;
      referredEmail: string | null;
      configVersion: number | null;
      createdAt: string;
    }>;
    config: {
      version: number;
      rewardType: 'PERCENTAGE' | 'FIXED';
      percentage: number | null;
      fixedAmountGbp: number | null;
      commissionFrequency: 'ONE_TIME' | 'RECURRING';
      eligibleRoles: string[];
    } | null;
  };
}

/**
 * Read-only view of the affiliate's Central Hub MCOM wallet.
 *
 * Central is the single source of truth for money. 247GBS never stores a second
 * balance for delegated-task earnings; it proxies this server-to-server call so
 * the earnings screen always reflects the ledger.
 */
@Injectable()
export class McomWalletService {
  private readonly logger = new Logger(McomWalletService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
  ) {}

  /**
   * Central settlement references look like
   * `affiliate-task:<centralTaskId>:settle`. The affiliate's local task stores
   * that id as `externalTaskId`, so we can attach a direct “View task” link.
   */
  private centralTaskIdFromReference(reference?: string | null): string | null {
    if (!reference) return null;
    const match = /^affiliate-task:([^:]+)(?::|$)/.exec(reference);
    return match ? match[1] : null;
  }

  async getForUser(localUserId: string, page = 1, limit = 20): Promise<McomWalletSnapshot> {
    const user = await this.usersRepo.findOne({ where: { id: localUserId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.mcomUserId) {
      throw new NotFoundException(
        'This account is not linked to Central Hub yet. Sign in with MCOM Central to see your MCOM wallet.',
      );
    }

    const baseUrl = (
      this.config.get<string>('MCOM_CENTRAL_URL') || 'http://localhost:3010/api/v1'
    ).replace(/\/+$/, '');
    const apiKey =
      this.config.get<string>('INTERNAL_API_KEY') ||
      this.config.get<string>('MCOM_API_KEY') ||
      this.config.get<string>('MCOM_SOLUTION_API_KEY') ||
      '';

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Central Hub wallet is not configured (missing INTERNAL_API_KEY).',
      );
    }

    try {
      const { data } = await firstValueFrom(
        this.http.get(
          `${baseUrl}/affiliate/wallets/${encodeURIComponent(user.mcomUserId)}`,
          {
            headers: { 'x-api-key': apiKey },
            params: {
              page: Math.max(1, Number(page) || 1),
              limit: Math.min(50, Math.max(1, Number(limit) || 20)),
            },
            timeout: 15000,
          },
        ),
      );
      const payload = data?.data ?? data;
      if (!payload?.wallet) {
        throw new ServiceUnavailableException('Unexpected wallet response from Central Hub.');
      }

      const snapshot = payload as McomWalletSnapshot;
      const transactions = snapshot.transactions?.data ?? [];
      if (transactions.length) {
        const externalIds = Array.from(
          new Set(
            transactions
              .map((transaction) => this.centralTaskIdFromReference(transaction.reference))
              .filter((value): value is string => Boolean(value)),
          ),
        );

        if (externalIds.length) {
          const tasks = await this.tasksRepo.find({
            where: { externalTaskId: In(externalIds) },
            select: ['id', 'externalTaskId', 'title'],
          });
          const byExternalId = new Map(
            tasks.map((task) => [task.externalTaskId, task] as const),
          );

          snapshot.transactions.data = transactions.map((transaction) => {
            const externalId = this.centralTaskIdFromReference(transaction.reference);
            const task = externalId ? byExternalId.get(externalId) : undefined;
            return {
              ...transaction,
              taskId: task?.id ?? null,
              taskTitle: task?.title ?? null,
            };
          });
        }
      }

      return snapshot;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof ServiceUnavailableException) {
        throw error;
      }
      const message =
        error?.response?.data?.message || error?.message || 'Central Hub wallet is unavailable';
      this.logger.warn(`MCOM wallet lookup failed for ${user.mcomUserId}: ${message}`);
      throw new ServiceUnavailableException(`Could not load your MCOM wallet: ${message}`);
    }
  }
}
