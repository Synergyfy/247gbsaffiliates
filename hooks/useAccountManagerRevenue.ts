import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface RevenueData {
  totalGeneratedRevenue: number;
  pendingPayouts: number;
  lastMonthRevenueTrend: string;
  recentTransactions: {
    id: string;
    title: string;
    amount: number;
    date: string;
    type: string;
  }[];
}

export const useAccountManagerRevenue = () => {
  return useQuery({
    queryKey: ['am-revenue'],
    queryFn: async () => {
      const response = await apiClient.get<RevenueData>('/account-manager/dashboard/revenue');
      return response.data;
    },
  });
};
