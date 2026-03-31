import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { User } from '@/types/auth';

export const useAdminUsers = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users');
      const data = response.data;
      if (Array.isArray(data)) return data as User[];
      if (data && Array.isArray(data.data)) return data.data as User[];
      if (data && Array.isArray(data.users)) return data.users as User[];
      if (data && Array.isArray(data.items)) return data.items as User[];
      return [] as User[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return {
    users,
    isLoading,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
};
