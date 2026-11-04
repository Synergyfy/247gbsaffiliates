import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface Task {
  id: string;
  title: string;
  description: string;
  executionUrl?: string | null;
  budget: number;
  currency: string;
  status: string;
  type: string;
  priority?: string;
  estimatedTime?: string;
  category?: string | { name: string };
  requiredSkills?: string[];
  assignedAgentId?: string | null;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  taskType?: string | null;
  originSystem?: string;
  assignedAgent?: { id: string; email: string; firstName?: string | null; lastName?: string | null } | null;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  assignedAgentId?: string;
  enabled?: boolean;
}

export const useTasks = (filters: TaskFilters = {}) => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tasks', filters],
    enabled: filters.enabled ?? true,
    queryFn: async () => {
      const { enabled: _enabled, ...params } = filters;
      const response = await apiClient.get('/tasks', { params });
      const data = response.data?.data ?? response.data;
      if (Array.isArray(data)) return data as Task[];
      if (data && Array.isArray(data.items)) return data.items as Task[];
      if (data && Array.isArray(data.data)) return data.data as Task[];
      return [] as Task[];
    },
  });

  const acceptTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });

  const declineTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/decline`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });

  const assignTaskMutation = useMutation({
    mutationFn: async ({ taskId, agentId }: { taskId: string; agentId: string }) => {
      const response = await apiClient.post(`/tasks/${taskId}/assign`, { agentId });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const response = await apiClient.post('/tasks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    isError,
    error,
    refetch,
    acceptTask: acceptTaskMutation.mutateAsync,
    isAccepting: acceptTaskMutation.isPending,
    createTask: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    declineTask: declineTaskMutation.mutateAsync,
    isDeclining: declineTaskMutation.isPending,
    updateTaskStatus: updateTaskStatusMutation.mutateAsync,
    isUpdatingStatus: updateTaskStatusMutation.isPending,
    assignTask: assignTaskMutation.mutateAsync,
    isAssigning: assignTaskMutation.isPending,
  };
};

export const useTask = (taskId: string, enabled = true) => useQuery({
  queryKey: ['task', taskId],
  enabled: Boolean(taskId) && enabled,
  queryFn: async () => {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return (response.data?.data ?? response.data) as Task;
  },
});
