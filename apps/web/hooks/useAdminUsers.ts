import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { User, UserRole } from '@/types/auth';

export interface AdminAffiliate extends User {
  name: string;
  status: string;
  verificationStatus: string;
  verificationNotes?: string | null;
  verificationReviewedAt?: string | null;
  role: UserRole;
  isOnboarded: boolean;
  isQuizPassed: boolean;
  firstName?: string;
  lastName?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
  qualificationStatus: 'qualified' | 'incomplete';
  learningStatus: string;
  learningCompletedCount: number;
  learningResourceCount: number;
}

export interface AdminUserFilters {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  verificationStatus?: string;
  isOnboarded?: boolean;
  isQuizPassed?: boolean;
  qualification?: 'qualified' | 'incomplete';
}

export const useAdminUsers = (filters: AdminUserFilters = {}) => {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users', { params: filters });
      const data = response.data?.data ?? response.data;
      if (Array.isArray(data)) return { items: data as AdminAffiliate[], meta: undefined };
      return {
        items: Array.isArray(data?.items) ? data.items as AdminAffiliate[] : [],
        meta: data?.meta as { total: number; page: number; lastPage: number } | undefined,
      };
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return {
    users: usersQuery.data?.items,
    meta: usersQuery.data?.meta,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
};

export const useAdminAffiliate = (id: string) => useQuery({
  queryKey: ['admin-affiliate', id],
  enabled: Boolean(id),
  queryFn: async () => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return (response.data?.data ?? response.data) as AdminAffiliate & {
      profile: Record<string, unknown>;
      assessmentAttempts: Array<{ id: string; score: number; maxScore: number; percentage: number; band: string; answers: unknown[]; createdAt: string }>;
      learningCompletedCount: number;
      learningResourceCount: number;
    };
  },
});
