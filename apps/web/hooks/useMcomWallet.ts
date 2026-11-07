import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

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
  /** Local task id resolved from a Central affiliate-task settlement reference. */
  taskId?: string | null;
  taskTitle?: string | null;
}

export interface McomWalletHold {
  id: string;
  amount: number;
  reference: string | null;
  description: string | null;
  status: string;
  expiresAt: string;
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
  holds: McomWalletHold[];
  transactions: {
    success: boolean;
    data: McomWalletTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  referralEarnings?: McomReferralEarnings;
}

export interface McomReferralEarnings {
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
}

/**
 * The affiliate's Central Hub MCOM wallet. This is the account that receives
 * delegated-task payouts; the ledger is owned by Central, not by 247GBS.
 */
export const useMcomWallet = (page = 1, limit = 20) => {
  const query = useQuery({
    queryKey: ['mcom-wallet', page, limit],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/wallet/mcom', { params: { page, limit } });
        return (response.data?.data ?? response.data) as McomWalletSnapshot;
      } catch (error: any) {
        throw new Error(
          error?.response?.data?.message ||
            error?.message ||
            'Could not load your MCOM wallet.',
        );
      }
    },
    staleTime: 15_000,
    retry: 1,
  });

  return {
    wallet: query.data?.wallet,
    holds: query.data?.holds ?? [],
    transactions: query.data?.transactions?.data ?? [],
    totalTransactions: query.data?.transactions?.total ?? 0,
    totalPages: query.data?.transactions?.totalPages ?? 1,
    referralEarnings: query.data?.referralEarnings,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};
