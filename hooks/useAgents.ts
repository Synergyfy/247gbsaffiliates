import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface Agent {
  id: string;
  name: string;
}

export const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get<Agent[]>('/users/agents');
      return response.data;
    },
  });
};
