import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface AssignedBusiness {
  id: string;
  businessName: string;
  businessType?: string | null;
  email?: string | null;
  phone?: string | null;
  postcode?: string | null;
  address?: string | null;
  industry?: string | null;
  category?: string | null;
  subCategory?: string | null;
  membershipLevel?: string | null;
  membershipStatus?: string | null;
  membershipPlanName?: string | null;
  membershipExpiresAt?: string | null;
  accountManagerAssignedAt?: string | null;
  acquiredByAffiliateName?: string | null;
  acquiredByAffiliateRole?: string | null;
  acquisitionStatus?: string | null;
  acquisitionSource?: string | null;
  acquisitionAttributedAt?: string | null;
  createdAt?: string | null;
  city?: { name?: string | null; region?: string | null; country?: string | null } | null;
  localMall?: { id: string; name: string } | null;
}

interface AssignedBusinessesResponse {
  manager?: { userId: string; email: string; name: string } | null;
  businesses: AssignedBusiness[];
  total: number;
  error?: string;
}

export const useAssignedBusinesses = (enabled = true) =>
  useQuery({
    queryKey: ['account-manager-businesses'],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get<AssignedBusinessesResponse & { data?: AssignedBusinessesResponse }>(
        '/account-manager/businesses',
      );
      const data = response.data?.data ?? response.data;
      return {
        manager: data?.manager ?? null,
        businesses: Array.isArray(data?.businesses) ? data.businesses : [],
        total: Number(data?.total ?? 0),
        error: data?.error,
      } satisfies AssignedBusinessesResponse;
    },
  });
