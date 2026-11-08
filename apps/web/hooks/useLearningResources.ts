import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

export interface LearningHubResource {
  id: string;
  title: string;
  description: string;
  targetRoles: string[];
  category: { id: string; name: string } | null;
  videoUrl: string | null;
  articleUrl: string | null;
  thumbnailUrl: string | null;
  priority: number;
  tags: string[] | null;
}

export type LearningProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface LearningProgressItem {
  resourceId: string;
  status: LearningProgressStatus;
  completedAt: string | null;
}

const unwrap = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const outer = (payload as { data?: unknown }).data;
    if (outer && typeof outer === 'object' && 'data' in outer) {
      return (outer as { data: T }).data;
    }
    return outer as T;
  }
  return payload as T;
};

export const useLearningResources = (role: string | null) =>
  stabilizeErrorRetry(
    useQuery({
      queryKey: ['learning-resources', role],
      queryFn: async (): Promise<LearningHubResource[]> => {
        const response = await apiClient.get('/learning', { params: { role } });
        return unwrap<LearningHubResource[]>(response.data);
      },
      enabled: Boolean(role),
    }),
  );

export const useLearningProgress = (enabled = true) =>
  stabilizeErrorRetry(
    useQuery({
      queryKey: ['learning-progress'],
      queryFn: async (): Promise<LearningProgressItem[]> => {
        const response = await apiClient.get('/learning/progress/me');
        return unwrap<LearningProgressItem[]>(response.data);
      },
      enabled,
    }),
  );

export const useUpdateLearningProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ resourceId, status }: { resourceId: string; status: Exclude<LearningProgressStatus, 'not_started'> }) => {
      const response = await apiClient.patch(`/learning/${resourceId}/progress`, { status });
      return unwrap<LearningProgressItem>(response.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning-progress'] }),
  });
};
