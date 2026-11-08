import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

export interface AdminStats {
  totalUsers: number;
  totalAffiliates: number;
  pendingAffiliateVerification: number;
  verifiedAffiliates: number;
  qualifiedAffiliates: number;
  passedAssessments: number;
  failedAssessments: number;
  attemptsByBand: Record<string, number>;
  assignedTasks: number;
  completedTasks: number;
  tasksByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
  recentUsers: {
    id: string;
    name: string;
    role: string;
    status: string;
    verificationStatus: string;
    email: string;
    createdAt: string;
  }[];
}

export const useAdminStats = () => {
  const { data: stats, isLoading, isError, error, refetch } = stabilizeErrorRetry(
    useQuery({
      queryKey: ['admin-stats'],
      queryFn: async () => {
        const response = await apiClient.get('/admin/dashboard/stats');
        return (response.data?.data ?? response.data) as AdminStats;
      },
    }),
  );

  return { stats, isLoading, isError, error, refetch };
};
