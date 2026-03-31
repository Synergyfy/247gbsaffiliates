import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

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
  currency: string;
}

export const useWallet = () => {
  const queryClient = useQueryClient();
  const { data: wallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await apiClient.get('/wallet');
      return response.data as Wallet;
    },
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      const response = await apiClient.get('/wallet/transactions');
      const data = response.data;
      if (Array.isArray(data)) return data as Transaction[];
      if (data && Array.isArray(data.data)) return data.data as Transaction[];
      if (data && Array.isArray(data.transactions)) return data.transactions as Transaction[];
      return [] as Transaction[];
    },
  });

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
    wallet,
    transactions,
    isLoading: isLoadingWallet || isLoadingTransactions,
    requestWithdrawal: requestWithdrawal.mutateAsync,
    isWithdrawing: requestWithdrawal.isPending,
  };
};
