import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { LearningResource } from '@/types/onboarding';

export const useLearningResources = (role: string) => {
  return useQuery({
    queryKey: ['learning-resources', role],
    queryFn: async (): Promise<LearningResource[]> => {
      const response = await apiClient.get('/learning', {
        params: { role },
      });
      return response.data;
    },
    enabled: !!role,
  });
};
