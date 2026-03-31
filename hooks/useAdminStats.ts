import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface AdminStats {
  totalUsers: number;
  activeTasks: number;
  totalRevenue: number;
  recentUsers: {
    id: string;
    name: string;
    role: string;
    status: string;
    email: string;
    createdAt: string;
  }[];
  systemAlerts: {
    severity: string;
    message: string;
  }[];
}

export const useAdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data as AdminStats;
    },
  });

  return { stats, isLoading };
};
