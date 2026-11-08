import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string;
  category?: string | { name: string };
  priority?: string;
}

export interface Wallet {
  id: string;
  balance: number;
  availableBalance?: number;
  currency: string;
  status?: string;
  holds?: unknown[];
}

export const useWallet = () => {
  const queryClient = useQueryClient();
  const walletQuery = stabilizeErrorRetry(
    useQuery({
      queryKey: ['wallet'],
      queryFn: async () => {
        const response = await apiClient.get('/wallet');
        return response.data as Wallet;
      },
    }),
  );

  const transactionsQuery = stabilizeErrorRetry(
    useQuery({
      queryKey: ['wallet-transactions'],
      queryFn: async () => {
        const response = await apiClient.get('/wallet/transactions');
        const data = response.data;
        if (Array.isArray(data)) return data as Transaction[];
        if (data && Array.isArray(data.data)) return data.data as Transaction[];
        if (data && Array.isArray(data.transactions)) return data.transactions as Transaction[];
        return [] as Transaction[];
      },
    }),
  );

  const requestWithdrawal = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiClient.post('/wallet/withdraw', { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  return {
    wallet: walletQuery.data,
    transactions: transactionsQuery.data,
    isLoading: walletQuery.isLoading || transactionsQuery.isLoading,
    isError: walletQuery.isError || transactionsQuery.isError,
    error: walletQuery.error || transactionsQuery.error,
    refetch: async () => {
      await Promise.all([walletQuery.refetch(), transactionsQuery.refetch()]);
    },
    requestWithdrawal: requestWithdrawal.mutateAsync,
    isWithdrawing: requestWithdrawal.isPending,
  };
};
