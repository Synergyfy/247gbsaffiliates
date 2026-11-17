'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

export interface ClientBusinessOption {
  id: string; // centralBusinessId (UUID)
  name: string;
  source?: 'assigned' | 'prospect' | 'custom';
  accountManagerName?: string | null;
}

interface AssignmentsPayload {
  success?: boolean;
  data?: {
    assignments?: Array<{
      centralBusinessId: string;
      businessName?: string | null;
      accountManagerName?: string | null;
      acquiredByAffiliateName?: string | null;
    }>;
    total?: number;
  };
}

interface ProspectsPayload {
  success?: boolean;
  data?: Array<{
    id?: string;
    centralBusinessId?: string | null;
    businessName?: string | null;
    contactName?: string | null;
  }>;
}

export function useConsultantBusinesses() {
  return stabilizeErrorRetry(
    useQuery({
      queryKey: ['consultant-client-businesses'],
      queryFn: async (): Promise<ClientBusinessOption[]> => {
        const businessMap = new Map<string, ClientBusinessOption>();

        // 1. Fetch businesses from assigned active work
        try {
          const res = await apiClient.get<AssignmentsPayload>('/business-acquisition/assignments');
          const assignments = res.data?.data?.assignments ?? [];
          for (const item of assignments) {
            if (item.centralBusinessId && !businessMap.has(item.centralBusinessId)) {
              businessMap.set(item.centralBusinessId, {
                id: item.centralBusinessId,
                name: item.businessName?.trim() || `Business (${item.centralBusinessId.slice(0, 8)}…)`,
                source: 'assigned',
                accountManagerName: item.accountManagerName ?? null,
              });
            }
          }
        } catch {
          // Gracefully continue if assignments endpoint is temporarily unreachable
        }

        // 2. Fetch businesses from prospect relationships
        try {
          const res = await apiClient.get<ProspectsPayload>('/business-acquisition/prospects');
          const prospects = Array.isArray(res.data?.data) ? res.data?.data : [];
          for (const item of prospects) {
            if (item.centralBusinessId && !businessMap.has(item.centralBusinessId)) {
              businessMap.set(item.centralBusinessId, {
                id: item.centralBusinessId,
                name: item.businessName?.trim() || item.contactName?.trim() || `Prospect (${item.centralBusinessId.slice(0, 8)}…)`,
                source: 'prospect',
              });
            }
          }
        } catch {
          // Gracefully continue
        }

        // 3. Also resolve client business names from tasks (open pool & assigned)
        try {
          const res = await apiClient.get('/tasks', { params: { limit: 100 } });
          const payload = res.data;
          const raw =
            Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.items)
                ? payload.items
                : Array.isArray(payload?.data)
                  ? payload.data
                  : Array.isArray(payload?.data?.items)
                    ? payload.data.items
                    : [];
          for (const task of raw) {
            if (task?.centralBusinessId && task?.centralBusinessName) {
              const existing = businessMap.get(task.centralBusinessId);
              if (
                !existing ||
                existing.name.startsWith('Business (') ||
                existing.name.startsWith('Prospect (')
              ) {
                businessMap.set(task.centralBusinessId, {
                  id: task.centralBusinessId,
                  name: String(task.centralBusinessName).trim(),
                  source: existing?.source ?? 'assigned',
                  accountManagerName: existing?.accountManagerName ?? null,
                });
              }
            }
          }
        } catch {
          // Gracefully continue
        }

        return Array.from(businessMap.values());
      },
    }),
  );
}
