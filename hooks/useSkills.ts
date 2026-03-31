import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Skill } from '@/types/onboarding';

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await apiClient.get('/skills');
      return response.data as Skill[];
    },
  });
};
