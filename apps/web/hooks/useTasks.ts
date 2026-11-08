import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

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
export const normalizeTaskError = (error: unknown): Error => {
  const source = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const response = source.response && typeof source.response === 'object'
    ? source.response as Record<string, unknown>
    : {};
  const payload = response.data && typeof response.data === 'object'
    ? response.data as Record<string, unknown>
    : {};
  const raw = payload.message;
  const sourceMessage = typeof source.message === 'string' ? source.message : undefined;
  const message = Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === 'string').join(', ')
    : typeof raw === 'string' ? raw : sourceMessage || 'The request failed.';
  const normalized = new Error(message) as Error & {
    status?: number;
    code?: string;
    payload?: unknown;
  };
  normalized.status = typeof response.status === 'number' ? response.status : undefined;
  normalized.code = typeof payload.code === 'string' ? payload.code : undefined;
  normalized.payload = payload;
  return normalized;
};

const unwrapTask = (payload: unknown): Task => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return ((payload as { data?: unknown }).data ?? payload) as Task;
  }
  return payload as Task;
};

const unwrapTaskList = (payload: unknown): Task[] => {
  let current: unknown = payload;
  for (let depth = 0; depth < 3; depth += 1) {
    if (Array.isArray(current)) return current as Task[];
    if (!current || typeof current !== 'object') break;
    const value = current as Record<string, unknown>;
    if (value.success === false) throw new Error('The task service reported the request as unavailable.');
    if (Array.isArray(value.items)) return value.items as Task[];
    if (Array.isArray(value.data)) return value.data as Task[];
    if (value.data && typeof value.data === 'object') { current = value.data; continue; }
    break;
  }
  throw new Error('The task service returned an unsupported response.');
};
const unwrapAttachment = (payload: unknown): TaskAttachment => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return ((payload as { data?: unknown }).data ?? payload) as TaskAttachment;
  }
  return payload as TaskAttachment;
};

export const useTasks = (filters: TaskFilters = {}) => {
  const queryClient = useQueryClient();

  const invalidateTaskQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['task'] });
  };

  const tasksQuery = useQuery({
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
        const params = { ...filters };
        delete params.enabled;
        const response = await apiClient.get('/tasks', { params });
        return unwrapTaskList(response.data);
      } catch (error) {
        throw normalizeTaskError(error);
      }
    },
  });
  const tasks = tasksQuery.data;
  const hasFailedPreviously = tasksQuery.errorUpdateCount > 0 && tasks === undefined;
  const isLoading = tasksQuery.isLoading && !hasFailedPreviously;
  const isError = tasksQuery.isError || (tasksQuery.isFetching && hasFailedPreviously);
  const error = tasksQuery.error ?? tasksQuery.failureReason;
  const refetch = tasksQuery.refetch;

  const acceptTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.post(`/tasks/${taskId}/accept`);
      return unwrapTask(response.data);
    },
    onSuccess: invalidateTaskQueries,
  });

  const declineTaskMutation = useMutation({
    mutationFn: async ({ taskId, reason }: { taskId: string; reason: string }) => {
      const response = await apiClient.post(`/tasks/${taskId}/decline`, { reason });
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
      try {
        const response = await apiClient.post(`/tasks/${taskId}/assign`, { agentId });
        return unwrapTask(response.data);
      } catch (error) {
        throw normalizeTaskError(error);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      try {
        const response = await apiClient.post('/tasks', data);
        return unwrapTask(response.data);
      } catch (error) {
        throw normalizeTaskError(error);
      }
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

export const useTask = (taskId: string, enabled = true) =>
  stabilizeErrorRetry(
    useQuery({
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
    }),
  );

// ─── Account Manager: tasks across managed businesses ────────────────────────

export interface ManagedTask extends Task {
  assigneeUserId?: string | null;
  assignedAgentEmail?: string | null;
  assignedAgentName?: string | null;
  assignee?: { id?: string; email?: string; name?: string; firstName?: string | null; lastName?: string | null } | null;
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

export interface ManagedProject {
  id: string;
  title: string;
  description?: string | null;
  objective?: string | null;
  status: string;
  createdAt?: string | null;
  dueAt?: string | null;
  closedAt?: string | null;
  outcomeSummary?: string | null;
  followUpNotes?: string | null;
  business?: { id: string; businessName?: string | null; email?: string | null } | null;
  request?: { id: string; title?: string | null } | null;
  tasks?: ManagedTask[] | null;
}

export interface DirectoryAffiliate {
  id: string;
  mcomUserId?: string | null;
  centralUserId?: string | null;
  name: string;
  email: string;
  role: string;
  skills?: string[];
  postcode?: string | null;
  city?: string | null;
  region?: string | null;
  hourlyRate?: number | null;
  currency?: string | null;
  isOnboarded?: boolean;
  isQuizPassed?: boolean;
  verificationStatus?: string | null;
  assessmentScore?: number | null;
  completedTasksCount?: number;
  activeTasksCount?: number;
  onTimeRate?: number | null;
  averageResponseTimeHours?: number | null;
}

const unwrapManagedList = <T,>(payload: unknown, label: string): T[] => {
  let current: unknown = payload;
  for (let depth = 0; depth < 3; depth += 1) {
    if (Array.isArray(current)) return current as T[];
    if (!current || typeof current !== 'object') break;
    const record = current as Record<string, unknown>;
    if (record.success === false) throw new Error(`The ${label} service reported the request as unavailable.`);
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.projects)) return record.projects as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (record.data && typeof record.data === 'object') {
      current = record.data;
      continue;
    }
    break;
  }
  throw new Error(`The ${label} service returned an unsupported response.`);
};

const unwrapManagedRecord = <T,>(payload: unknown): T => {
  let current = payload;
  for (let depth = 0; depth < 3; depth += 1) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) break;
    const record = current as Record<string, unknown>;
    if (record.success === false) throw new Error('The Account Manager service reported the request as unavailable.');
    if (record.data && typeof record.data === 'object') {
      current = record.data;
      continue;
    }
    if (typeof record.id === 'string') return current as T;
    if (record.project && typeof record.project === 'object') return record.project as T;
    if (record.task && typeof record.task === 'object') return record.task as T;
    return current as T;
  }
  throw new Error('The Account Manager service returned an unsupported response.');
};

/**
 * Qualified agents and consultants the signed-in Account Manager can actually
 * delegate to. Unlike the public directory, every item has a live Central Hub
 * (`mcomUserId`) link and a current workload count.
 */
export const useDelegatableAgents = (enabled = true) =>
  useQuery({
    queryKey: ['delegatable-agents'],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get('/account-manager/agents', {
        params: { scope: 'delegatable' },
      });
      return unwrapManagedList<DirectoryAffiliate>(response.data, 'delegatable agents');
    },
  });

/** Public directory of real, eligible 247GBS affiliates. */
export const useAffiliateDirectory = (filters: { limit?: number; search?: string; role?: string } = {}, enabled = true) =>
  stabilizeErrorRetry(
    useQuery({
      queryKey: ['affiliate-directory', filters],
      enabled,
      queryFn: async () => {
        const response = await apiClient.get('/users/directory', { params: filters });
        const list = unwrapManagedList<DirectoryAffiliate>(response.data, 'affiliate directory');
        return list.filter((affiliate) => {
          if (
            affiliate.verificationStatus &&
            affiliate.verificationStatus.toLowerCase() !== 'verified'
          ) {
            return false;
          }
          if (affiliate.isOnboarded === false) {
            return false;
          }
          if (affiliate.role?.toLowerCase() === 'agent') {
            if (affiliate.isQuizPassed === false) return false;
            if (Array.isArray(affiliate.skills) && affiliate.skills.length === 0) return false;
          }
          return true;
        });
      },
    }),
  );

const normalizeManagedTaskRecord = (row: Record<string, unknown>): ManagedTask => {
  const rawDeliverables = row.deliverables;
  const deliverables = Array.isArray(rawDeliverables)
    ? rawDeliverables.filter((item): item is string => typeof item === 'string')
    : typeof rawDeliverables === 'string' && rawDeliverables.trim()
      ? rawDeliverables.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)
      : [];
  return {
    ...row,
    // Central stores agreed deliverables as free text; the affiliate UI works
    // with a list. Normalise both shapes here.
    deliverables,
    status: typeof row.status === 'string' ? row.status.toUpperCase() : row.status,
  } as ManagedTask;
};

const unwrapManagedTasks = (payload: unknown): ManagedTask[] => {
  const rows = unwrapManagedList<Record<string, unknown>>(payload, 'managed task');
  return rows.map(normalizeManagedTaskRecord);
};

export interface CreateManagedProjectTaskInput {
  projectId: string;
  title: string;
  description: string;
  category?: 'INTERNAL' | 'EXTERNAL';
  requiredSkills?: string[];
  deliverables?: string;
  materials?: string;
  dueAt?: string;
  assigneeUserId?: string;
  requiresBusinessApproval?: boolean;
  compensationModel?: string;
  compensationAmount?: number;
  businessChargeAmount?: number;
  billableToBusiness?: boolean;
  prerequisiteTaskId?: string;
}

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
      project: {
        title: string;
        description: string;
        objective?: string;
        dueAt?: string;
        requiresBusinessApproval?: boolean;
      };
    }) => {
      const response = await apiClient.post(
        `/account-manager/managed-requests/${requestId}/convert`,
        project,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-requests'] });
      queryClient.invalidateQueries({ queryKey: ['managed-projects'] });
      queryClient.invalidateQueries({ queryKey: ['managed-tasks'] });
    },
  });

  return {
    ...stabilizeErrorRetry(query),
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

  const assignTask = useMutation({
    mutationFn: async ({
      taskId,
      assigneeUserId,
      note,
    }: {
      taskId: string;
      assigneeUserId: string;
      note?: string;
    }) => {
      const response = await apiClient.post(`/account-manager/managed-tasks/${encodeURIComponent(taskId)}/assign`, {
        assigneeUserId,
        ...(note ? { note } : {}),
      });
      return normalizeManagedTaskRecord(unwrapManagedRecord<Record<string, unknown>>(response.data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['managed-projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
      queryClient.invalidateQueries({ queryKey: ['managed-projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    ...stabilizeErrorRetry(query),
    assignTask: assignTask.mutateAsync,
    isAssigningTask: assignTask.isPending,
    reviewTask: reviewTask.mutateAsync,
    isReviewing: reviewTask.isPending,
  };
};

export const useManagedTask = (taskId: string, enabled = true) =>
  stabilizeErrorRetry(
    useQuery({
      queryKey: ['managed-task', taskId],
      enabled: Boolean(taskId) && enabled,
      queryFn: async () => {
        const response = await apiClient.get(`/account-manager/managed-tasks/${encodeURIComponent(taskId)}`);
        return normalizeManagedTaskRecord(unwrapManagedRecord<Record<string, unknown>>(response.data));
      },
    }),
  );

export const useManagedProjects = (
  filters: { status?: string; search?: string; limit?: number } = {},
  enabled = true,
) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['managed-projects', filters],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get('/account-manager/managed-projects', { params: filters });
      const projects = unwrapManagedList<ManagedProject>(response.data, 'managed projects');
      return projects.map((project) => ({
        ...project,
        tasks: Array.isArray(project.tasks)
          ? project.tasks.map((task) =>
              normalizeManagedTaskRecord(task as unknown as Record<string, unknown>),
            )
          : project.tasks,
      }));
    },
  });

  const createProjectTask = useMutation({
    mutationFn: async ({ projectId, ...body }: CreateManagedProjectTaskInput) => {
      const response = await apiClient.post(
        `/account-manager/managed-projects/${encodeURIComponent(projectId)}/tasks`,
        body,
      );
      return normalizeManagedTaskRecord(unwrapManagedRecord<Record<string, unknown>>(response.data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-projects'] });
      queryClient.invalidateQueries({ queryKey: ['managed-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const closeProject = useMutation({
    mutationFn: async ({
      projectId,
      outcomeSummary,
      followUpNotes,
    }: {
      projectId: string;
      outcomeSummary: string;
      followUpNotes?: string;
    }) => {
      const response = await apiClient.post(
        `/account-manager/managed-projects/${encodeURIComponent(projectId)}/close`,
        { outcomeSummary, ...(followUpNotes ? { followUpNotes } : {}) },
      );
      return unwrapManagedRecord<ManagedProject>(response.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['managed-projects'] }),
  });



  return {
    ...stabilizeErrorRetry(query),
    createProjectTask: createProjectTask.mutateAsync,
    isCreatingProjectTask: createProjectTask.isPending,
    closeProject: closeProject.mutateAsync,
    isClosingProject: closeProject.isPending,
  };
};
