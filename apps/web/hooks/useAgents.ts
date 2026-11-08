import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

export interface Agent {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  profileImage?: string | null;
  skills?: string[];
  isOnboarded?: boolean;
  isQuizPassed?: boolean;
}

export const useAgents = () => {
  return stabilizeErrorRetry(
    useQuery({
      queryKey: ['agents'],
      queryFn: async () => {
        const response = await apiClient.get<Agent[] | { data?: Agent[] }>('/users/agents');
        const payload = response.data as Agent[] | { success?: boolean; message?: string; data?: Agent[] | { data?: Agent[] } } | undefined;
        if (payload && !Array.isArray(payload) && payload.success === false) throw new Error(payload.message || 'Agent directory is unavailable.');
        const outerData = payload && !Array.isArray(payload) ? payload.data : undefined;
        const rows = Array.isArray(payload) ? payload : Array.isArray(outerData) ? outerData : Array.isArray(outerData?.data) ? outerData.data : [];
        return rows.map((agent) => ({
          ...agent,
          name: agent.name || [agent.firstName, agent.lastName].filter(Boolean).join(' ') || 'Name not provided',
        }));
      },
    }),
  );
};
