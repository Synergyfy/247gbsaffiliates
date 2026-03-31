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

export const useTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await apiClient.get('/tasks');
      const data = response.data;
      if (Array.isArray(data)) return data as Task[];
      if (data && Array.isArray(data.data)) return data.data as Task[];
      if (data && Array.isArray(data.tasks)) return data.tasks as Task[];
      if (data && Array.isArray(data.items)) return data.items as Task[];
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
