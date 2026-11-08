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

export interface ManagedAgent extends Agent {
  mcomUserId?: string | null;
  status?: string | null;
  verificationStatus?: string | null;
  assessmentScore?: number | null;
  latestAssessmentBand?: string | null;
  completedTasksCount?: number;
  activeTasksCount?: number;
  totalTasksCount?: number;
  city?: string | null;
  region?: string | null;
}

interface AgentListResponse<T> {
  success?: boolean;
  message?: string;
  data?: T[] | { data?: T[] };
  items?: T[];
}

const unwrapAgents = <T extends Agent>(payload: T[] | AgentListResponse<T> | undefined): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.success === false) throw new Error(payload.message || 'Agent directory is unavailable.');
  if (Array.isArray(payload.items)) return payload.items;
  const outerData = payload.data;
  if (Array.isArray(outerData)) return outerData;
  if (outerData && Array.isArray(outerData.data)) return outerData.data;
  return [];
};

export const useAgents = () => {
  return stabilizeErrorRetry(
    useQuery({
      queryKey: ['agents'],
      queryFn: async () => {
        const response = await apiClient.get<Agent[] | AgentListResponse<Agent>>('/users/agents');
        return unwrapAgents(response.data).map((agent) => ({
          ...agent,
          name: agent.name || [agent.firstName, agent.lastName].filter(Boolean).join(' ') || 'Name not provided',
        }));
      },
    }),
  );
};

/** Manager-scoped roster with verification, assessment and task stats. */
export const useManagedAgents = () => {
  return stabilizeErrorRetry(
    useQuery({
      queryKey: ['managed-agents'],
      queryFn: async () => {
        const response = await apiClient.get<AgentListResponse<ManagedAgent>>('/account-manager/agents');
        return unwrapAgents(response.data).map((agent) => ({
          ...agent,
          name: agent.name || [agent.firstName, agent.lastName].filter(Boolean).join(' ') || 'Name not provided',
        }));
      },
    }),
  );};
