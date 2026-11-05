import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { User } from '../users/entities/user.entity';

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
  ) {}

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
      return payload as McomWalletSnapshot;
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
