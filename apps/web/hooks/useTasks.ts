import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface TaskAttachment {
  url: string;
  fileName?: string;
  mimeType?: string;
  kind?: string;
}

export interface TaskReviewEntry {
  round: number;
  decision: 'APPROVED' | 'CHANGES_REQUESTED';
  notes?: string | null;
  reviewedAt: string;
  acknowledgedAt?: string | null;
}

export interface TaskSubmission {
  notes?: string;
  links?: string[];
  attachments?: TaskAttachment[];
  [key: string]: unknown;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  executionUrl?: string | null;
  budget: number;
  currency: string;
  status: string;
  type: string;
  priority?: string;
  estimatedTime?: string;
  requiredSkills?: string[];
  assignedAgentId?: string | null;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  taskType?: string | null;
  originSystem?: string;
  assignedAgent?: { id: string; email: string; firstName?: string | null; lastName?: string | null } | null;
  // ── Central Hub delegated task fields ────────────────────────────────────
  category?: 'internal' | 'external' | string | null;
  projectId?: string | null;
  projectName?: string | null;
  deliverables?: string[] | null;
  materials?: string | null;
  prerequisiteExternalTaskId?: string | null;
  compensationModel?: string | null;
  compensationAmount?: number | null;
  compensationCurrency?: string | null;
  billableToBusiness?: boolean;
  businessChargeAmount?: number | null;
  businessChargeCurrency?: string | null;
  chargeApprovalRequired?: boolean;
  chargeApprovedAt?: string | null;
  paymentStatus?: string | null;
  acceptedAt?: string | null;
  requiresBusinessApproval?: boolean;
  businessApprovedAt?: string | null;
  amReviewedAt?: string | null;
  amReviewNotes?: string | null;
  externalTaskId?: string | null;
  originRequesterId?: string | null;
  centralBusinessId?: string | null;
  centralBusinessName?: string | null;
  platforms?: string[] | null;
  assigneeEmail?: string | null;
  submissionData?: TaskSubmission | null;
  reviewHistory?: TaskReviewEntry[] | null;
  reviewNotes?: string | null;
  revisionCount?: number;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  completedAt?: string | null;
  lastCentralSyncAt?: string | null;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  assignedAgentId?: string;
  enabled?: boolean;
}

export interface SubmitTaskInput {
  taskId: string;
  notes?: string;
  links?: string[];
  attachments?: TaskAttachment[];
  submissionData?: Record<string, unknown>;
}

/**
 * Surface the backend's human-readable message instead of Axios' generic
 * "Request failed with status code 403". Keeps status/code for callers that
 * want to tailor the UI (e.g. verification pending vs onboarding incomplete).
 */
export const normalizeTaskError = (error: any): Error => {
  const payload = error?.response?.data;
  const raw = payload?.message;
  const message = Array.isArray(raw) ? raw.join(', ') : raw || error?.message || 'The request failed.';
  const normalized = new Error(message) as Error & {
    status?: number;
    code?: string;
    payload?: any;
  };
  normalized.status = error?.response?.status;
  normalized.code = payload?.code;
  normalized.payload = payload;
  return normalized;
};

const unwrapTask = (payload: any): Task => (payload?.data ?? payload) as Task;
const unwrapAttachment = (payload: any): TaskAttachment =>
  (payload?.data ?? payload) as TaskAttachment;

export const useTasks = (filters: TaskFilters = {}) => {
  const queryClient = useQueryClient();

  const invalidateTaskQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['task'] });
  };

  const { data: tasks, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tasks', filters],
    enabled: filters.enabled ?? true,
    // 4xx responses (e.g. verification/onboarding required) are actionable —
    // do not hammer the API with retries. Transient 5xx errors still retry.
    retry: (failureCount, queryError) => {
      const status = (queryError as { status?: number })?.status;
      return status && status < 500 ? false : failureCount < 2;
    },
    queryFn: async () => {
      try {
        const { enabled: _enabled, ...params } = filters;
        const response = await apiClient.get('/tasks', { params });
        const data = response.data?.data ?? response.data;
        if (Array.isArray(data)) return data as Task[];
        if (data && Array.isArray(data.items)) return data.items as Task[];
        if (data && Array.isArray(data.data)) return data.data as Task[];
        return [] as Task[];
      } catch (error) {
        throw normalizeTaskError(error);
      }
    },
  });

  const acceptTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/accept`);
      return unwrapTask(response.data);
    },
    onSuccess: invalidateTaskQueries,
  });

  const declineTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/decline`);
      return unwrapTask(response.data);
    },
    onSuccess: invalidateTaskQueries,
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
      return unwrapTask(response.data);
    },
    onSuccess: invalidateTaskQueries,
  });

  /** Submit deliverables for manual review (notes, links, uploads). */
  const submitTaskMutation = useMutation({
    mutationFn: async ({ taskId, notes, links, attachments, submissionData }: SubmitTaskInput) => {
      const response = await apiClient.post(`/tasks/${taskId}/submit`, {
        ...(submissionData ? { submissionData } : {}),
        ...(notes ? { notes } : {}),
        ...(links?.length ? { links } : {}),
        ...(attachments?.length ? { attachments } : {}),
      });
      return unwrapTask(response.data);
    },
    onSuccess: invalidateTaskQueries,
  });

  /** Confirm review notes were seen and move the task back to accepted. */
  const acknowledgeReviewMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/acknowledge-review`);
      return unwrapTask(response.data);
    },
    onSuccess: invalidateTaskQueries,
  });

  const assignTaskMutation = useMutation({
    mutationFn: async ({ taskId, agentId }: { taskId: string; agentId: string }) => {
      const response = await apiClient.post(`/tasks/${taskId}/assign`, { agentId });
      return unwrapTask(response.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const response = await apiClient.post('/tasks', data);
      return unwrapTask(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  /**
   * Upload one photo/PDF/document for a submission. Returns the attachment
   * object to include in the `attachments` array when submitting.
   */
  const uploadTaskAttachment = async (taskId: string, file: File): Promise<TaskAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapAttachment(response.data);
  };

  return {
    tasks,
    isLoading,
    isError,
    error,
    refetch,
    acceptTask: acceptTaskMutation.mutateAsync,
    isAccepting: acceptTaskMutation.isPending,
    createTask: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    declineTask: declineTaskMutation.mutateAsync,
    isDeclining: declineTaskMutation.isPending,
    updateTaskStatus: updateTaskStatusMutation.mutateAsync,
    isUpdatingStatus: updateTaskStatusMutation.isPending,
    assignTask: assignTaskMutation.mutateAsync,
    isAssigning: assignTaskMutation.isPending,
    submitTask: submitTaskMutation.mutateAsync,
    isSubmitting: submitTaskMutation.isPending,
    acknowledgeReview: acknowledgeReviewMutation.mutateAsync,
    isAcknowledgingReview: acknowledgeReviewMutation.isPending,
    uploadTaskAttachment,
  };
};

export const useTask = (taskId: string, enabled = true) => useQuery({
  queryKey: ['task', taskId],
  enabled: Boolean(taskId) && enabled,
  queryFn: async () => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}`);
      return unwrapTask(response.data);
    } catch (error) {
      throw normalizeTaskError(error);
    }
  },
});

// ─── Account Manager: tasks across managed businesses ────────────────────────

export interface ManagedTask extends Task {
  dueAt?: string | null;
  business?: {
    id: string;
    businessName?: string | null;
    email?: string | null;
  } | null;
  project?: { id: string; title: string; status?: string } | null;
  prerequisiteTask?: { id: string; title: string; status: string } | null;
  reviews?: Array<{
    id: string;
    round: number;
    decision: 'APPROVED' | 'CHANGES_REQUESTED';
    notes?: string | null;
    stage?: string | null;
    reviewedAt: string;
  }> | null;
  events?: Array<{
    id: string;
    type: string;
    message?: string | null;
    actorRole?: string | null;
    createdAt: string;
  }> | null;
}

const unwrapManagedTasks = (payload: any): ManagedTask[] => {
  const data = payload?.data ?? payload;
  const rows: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
        ? data.items
        : [];
  return rows.map((row) => ({
    ...row,
    // Central stores agreed deliverables as free text; the affiliate UI works
    // with a list. Normalise both shapes here.
    deliverables: Array.isArray(row.deliverables)
      ? row.deliverables
      : typeof row.deliverables === 'string' && row.deliverables.trim()
        ? row.deliverables.split(/\r?\n|,/).map((item: string) => item.trim()).filter(Boolean)
        : [],
    status: typeof row.status === 'string' ? row.status.toUpperCase() : row.status,
  })) as ManagedTask[];
};

export interface ManagedServiceRequest {
  id: string;
  title: string;
  description: string;
  desiredOutcome?: string | null;
  urgency?: string;
  status: string;
  clarificationNote?: string | null;
  estimatedCost?: number | null;
  currency?: string;
  business?: { id: string; businessName?: string | null; email?: string | null } | null;
  project?: { id: string; title: string; status: string } | null;
  createdAt?: string;
}

export const useManagedRequests = (filters: { status?: string; search?: string; limit?: number } = {}, enabled = true) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['managed-requests', filters],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get('/account-manager/managed-requests', { params: filters });
      const data = response.data?.data ?? response.data;
      return (Array.isArray(data) ? data : data?.data ?? []) as ManagedServiceRequest[];
    },
  });

  const clarify = useMutation({
    mutationFn: async ({ requestId, note }: { requestId: string; note: string }) => {
      const response = await apiClient.post(`/account-manager/managed-requests/${requestId}/clarify`, { note });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['managed-requests'] }),
  });

  const quote = useMutation({
    mutationFn: async ({
      requestId,
      estimatedCost,
      currency,
      notes,
    }: {
      requestId: string;
      estimatedCost: number;
      currency?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post(
        `/account-manager/managed-requests/${requestId}/quote`,
        { estimatedCost, currency, notes },
      );
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['managed-requests'] }),
  });

  const convert = useMutation({
    mutationFn: async ({
      requestId,
      project,
    }: {
      requestId: string;
      project: { title: string; description: string; objective?: string; dueAt?: string };
    }) => {
      const response = await apiClient.post(
        `/account-manager/managed-requests/${requestId}/convert`,
        project,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-requests'] });
      queryClient.invalidateQueries({ queryKey: ['managed-tasks'] });
    },
  });

  return {
    ...query,
    clarify: clarify.mutateAsync,
    isClarifying: clarify.isPending,
    quote: quote.mutateAsync,
    isQuoting: quote.isPending,
    convert: convert.mutateAsync,
    isConverting: convert.isPending,
  };
};

export const useManagedTasks = (filters: { status?: string; search?: string; limit?: number } = {}, enabled = true) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['managed-tasks', filters],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get('/account-manager/managed-tasks', { params: filters });
      return unwrapManagedTasks(response.data);
    },
  });

  const reviewTask = useMutation({
    mutationFn: async ({
      taskId,
      decision,
      notes,
    }: {
      taskId: string;
      decision: 'APPROVED' | 'CHANGES_REQUESTED';
      notes?: string;
    }) => {
      const response = await apiClient.post(`/account-manager/managed-tasks/${taskId}/review`, {
        decision,
        ...(notes ? { notes } : {}),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    ...query,
    reviewTask: reviewTask.mutateAsync,
    isReviewing: reviewTask.isPending,
  };
};
