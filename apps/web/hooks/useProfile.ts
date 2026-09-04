import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  const updateProfile = useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const response = await apiClient.patch('/users/me', data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
  });

  return {
    user,
    updateProfile: updateProfile.mutateAsync,
    isUpdating: updateProfile.isPending,
  };
};
