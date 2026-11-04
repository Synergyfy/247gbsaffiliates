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
  category?: string | { name: string };
  requiredSkills?: string[];
  assignedAgentId?: string | null;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  taskType?: string | null;
  originSystem?: string;
  assignedAgent?: { id: string; email: string; firstName?: string | null; lastName?: string | null } | null;
  // ── Central Hub delegated task fields ────────────────────────────────────
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
    queryFn: async () => {
      const { enabled: _enabled, ...params } = filters;
      const response = await apiClient.get('/tasks', { params });
      const data = response.data?.data ?? response.data;
      if (Array.isArray(data)) return data as Task[];
      if (data && Array.isArray(data.items)) return data.items as Task[];
      if (data && Array.isArray(data.data)) return data.data as Task[];
      return [] as Task[];
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
    const response = await apiClient.get(`/tasks/${taskId}`);
    return unwrapTask(response.data);
  },
});
