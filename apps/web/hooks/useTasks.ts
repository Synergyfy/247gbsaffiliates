import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  status: string;
  type: string;
  priority?: string;
  estimatedTime?: string;
  category?: string | { name: string };
  requiredSkills?: string[];
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  assignedAgentId?: string;
}

export const useTasks = (filters: TaskFilters = {}) => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const response = await apiClient.get('/tasks', { params: filters });
      const data = response.data;
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
    },
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
    acceptTask: acceptTaskMutation.mutateAsync,
    isAccepting: acceptTaskMutation.isPending,
    createTask: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
  };
};
