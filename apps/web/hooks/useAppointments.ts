'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

// ── Enums & Interfaces matching Backend Appointments API ──────────────────

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export interface Appointment {
  id: string;
  consultantId: string;
  clientBusinessId: string;
  title: string;
  notes?: string | null;
  scheduledAt: string; // ISO-8601 string
  durationMinutes: number;
  meetingUrl?: string | null;
  status: AppointmentStatus;
  convertedTaskId?: string | null;
  convertedAt?: string | null;
  convertedByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  consultant?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  convertedTask?: {
    id: string;
    title: string;
    status: string;
    budget: number;
    currency: string;
  } | null;
}

export interface AppointmentPaginationMeta {
  total: number;
  page: number;
  lastPage: number;
}

export interface PaginatedAppointmentsResponse {
  items: Appointment[];
  meta: AppointmentPaginationMeta;
}

export interface FindAppointmentsQuery {
  page?: number;
  limit?: number;
  status?: AppointmentStatus | string;
  from?: string; // ISO string
  to?: string;   // ISO string
  consultantId?: string;
  clientBusinessId?: string;
  enabled?: boolean;
}

export interface CreateAppointmentInput {
  consultantId?: string;
  clientBusinessId: string;
  title: string;
  notes?: string;
  scheduledAt: string; // ISO string
  durationMinutes?: number;
  meetingUrl?: string;
}

export interface UpdateAppointmentInput {
  title?: string;
  notes?: string;
  scheduledAt?: string; // ISO string
  durationMinutes?: number;
  meetingUrl?: string;
  status?: AppointmentStatus;
}

export interface ConvertAppointmentToTaskInput {
  title?: string;
  description?: string;
  budget: number;
  assignedAgentId?: string;
  dueDate?: string; // ISO string
  requiredSkills?: string[];
  centralProjectId?: string;
}

export interface ConvertedAppointmentResult {
  appointment: Appointment;
  task: {
    id: string;
    title: string;
    description: string;
    budget: number;
    currency: string;
    status: string;
    [key: string]: unknown;
  };
}

// ── Error Normalization ──────────────────────────────────────────────────

export interface AppointmentError extends Error {
  status?: number;
  code?: string;
  conflictingAppointmentId?: string;
  taskId?: string;
  payload?: unknown;
}

export const normalizeAppointmentError = (error: unknown): AppointmentError => {
  const source = error && typeof error === 'object' ? (error as Record<string, unknown>) : {};
  const response =
    source.response && typeof source.response === 'object'
      ? (source.response as Record<string, unknown>)
      : {};
  const payload =
    response.data && typeof response.data === 'object'
      ? (response.data as Record<string, unknown>)
      : {};
  const raw = payload.message;
  const sourceMessage = typeof source.message === 'string' ? source.message : undefined;
  const message = Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === 'string').join(', ')
    : typeof raw === 'string'
      ? raw
      : sourceMessage || 'The appointment request failed.';

  const normalized = new Error(message) as AppointmentError;
  normalized.status = typeof response.status === 'number' ? response.status : undefined;
  normalized.code = typeof payload.code === 'string' ? payload.code : undefined;
  normalized.conflictingAppointmentId =
    typeof payload.conflictingAppointmentId === 'string'
      ? payload.conflictingAppointmentId
      : undefined;
  normalized.taskId = typeof payload.taskId === 'string' ? payload.taskId : undefined;
  normalized.payload = payload;
  return normalized;
};

// ── Availability & Slot Calculation ──────────────────────────────────────

export interface ConsultantAvailabilityConfig {
  /** Earliest start of working window in 24-hr format "HH:mm", e.g. "09:00" */
  startHour: string;
  /** Latest end of working window in 24-hr format "HH:mm", e.g. "17:00" */
  endHour: string;
  /** Days of week available (0 = Sunday, 1 = Monday, ..., 6 = Saturday) */
  availableDays?: number[];
  /** Step between candidate slot starts in minutes (default: 30) */
  slotIntervalMinutes?: number;
  /** Optional timezone label */
  timeZone?: string;
}

export interface TimeSlot {
  /** Exact start timestamp */
  start: Date;
  /** Exact end timestamp (start + durationMinutes) */
  end: Date;
  /** ISO string for API payload */
  startTime: string;
  /** ISO string for API payload */
  endTime: string;
  /** Formatted human-readable label, e.g. "10:00 - 11:00" */
  label: string;
  /** Whether the slot is free to book */
  isAvailable: boolean;
  /** Specific reason if unavailable */
  unavailableReason?: 'PAST_SLOT' | 'CONFLICT' | 'DAY_OFF';
  /** ID of conflicting appointment if blocked */
  conflictingAppointmentId?: string;
}

export interface CalculateAvailableSlotsParams {
  date: Date | string;
  appointments: Appointment[];
  durationMinutes: number;
  availability: ConsultantAvailabilityConfig;
  now?: Date;
  excludeAppointmentId?: string;
}

/**
 * Calculates candidate appointment slots for a given date based on explicit
 * consultant availability rules and existing bookings.
 *
 * Rules:
 * - Uses exact millisecond epoch comparison matching the backend's overlap algorithm:
 *   Overlap exists if (appointment.start < slot.end) AND (appointment.end > slot.start).
 * - Excludes past slots (slot.start <= now).
 * - Excludes non-working days specified in `availableDays`.
 * - Safely treats CANCELLED appointments as non-blocking.
 * - Handles slots and appointments spanning across midnight.
 */
export function calculateAvailableSlots(params: CalculateAvailableSlotsParams): TimeSlot[] {
  const {
    date: rawDate,
    appointments,
    durationMinutes,
    availability,
    now = new Date(),
    excludeAppointmentId,
  } = params;

  if (!durationMinutes || durationMinutes <= 0) return [];

  const targetDate = typeof rawDate === 'string' ? new Date(rawDate) : new Date(rawDate.getTime());
  if (Number.isNaN(targetDate.getTime())) return [];

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();
  const dayOfWeek = targetDate.getDay();

  const availableDays = availability.availableDays ?? [1, 2, 3, 4, 5];
  if (!availableDays.includes(dayOfWeek)) {
    return [];
  }

  const [startH, startM] = (availability.startHour || '09:00').split(':').map((v) => Number(v) || 0);
  const [endH, endM] = (availability.endHour || '17:00').split(':').map((v) => Number(v) || 0);
  const intervalMinutes = Math.max(5, availability.slotIntervalMinutes ?? 30);

  const windowStart = new Date(year, month, day, startH, startM, 0, 0);
  let windowEnd = new Date(year, month, day, endH, endM, 0, 0);

  // If endHour is less than or equal to startHour, the consultant works overnight across midnight
  if (windowEnd.getTime() <= windowStart.getTime()) {
    windowEnd = new Date(windowEnd.getTime() + 24 * 60 * 60 * 1000);
  }

  // Active appointments (ignoring cancelled and optionally ignoring current appointment being rescheduled)
  const activeAppointments = appointments.filter((appt) => {
    if (appt.status === AppointmentStatus.CANCELLED || String(appt.status).toUpperCase() === 'CANCELLED') {
      return false;
    }
    if (excludeAppointmentId && appt.id === excludeAppointmentId) {
      return false;
    }
    return true;
  });

  const slots: TimeSlot[] = [];
  let currentStart = new Date(windowStart.getTime());

  while (currentStart.getTime() + durationMinutes * 60_000 <= windowEnd.getTime()) {
    const slotStart = new Date(currentStart.getTime());
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);

    const isPast = slotStart.getTime() <= now.getTime();

    // Overlap condition matching backend:
    // appointment.scheduledAt < slotEnd && (appointment.scheduledAt + duration) > slotStart
    let conflictingAppt: Appointment | undefined;
    if (!isPast) {
      conflictingAppt = activeAppointments.find((appt) => {
        const apptStart = new Date(appt.scheduledAt).getTime();
        const apptEnd = apptStart + (appt.durationMinutes || 60) * 60_000;
        return apptStart < slotEnd.getTime() && apptEnd > slotStart.getTime();
      });
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const startLabel = `${pad(slotStart.getHours())}:${pad(slotStart.getMinutes())}`;
    const endLabel = `${pad(slotEnd.getHours())}:${pad(slotEnd.getMinutes())}`;

    slots.push({
      start: slotStart,
      end: slotEnd,
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      label: `${startLabel} - ${endLabel}`,
      isAvailable: !isPast && !conflictingAppt,
      unavailableReason: isPast ? 'PAST_SLOT' : conflictingAppt ? 'CONFLICT' : undefined,
      conflictingAppointmentId: conflictingAppt?.id,
    });

    currentStart = new Date(currentStart.getTime() + intervalMinutes * 60_000);
  }

  return slots;
}

// ── Payload Helpers ──────────────────────────────────────────────────────

const unwrapAppointment = (payload: unknown): Appointment => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return ((payload as { data?: unknown }).data ?? payload) as Appointment;
  }
  return payload as Appointment;
};

const unwrapAppointmentList = (payload: unknown): PaginatedAppointmentsResponse => {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    // Direct backend return { items: [...], meta: { total, page, lastPage } }
    if (Array.isArray(record.items) && record.meta && typeof record.meta === 'object') {
      return record as unknown as PaginatedAppointmentsResponse;
    }
    // Nested data wrapper { data: { items: [...], meta: ... } }
    if (record.data && typeof record.data === 'object') {
      const inner = record.data as Record<string, unknown>;
      if (Array.isArray(inner.items) && inner.meta) {
        return inner as unknown as PaginatedAppointmentsResponse;
      }
    }
    // Raw array fallback
    if (Array.isArray(payload)) {
      return {
        items: payload as Appointment[],
        meta: { total: (payload as Appointment[]).length, page: 1, lastPage: 1 },
      };
    }
  }
  return { items: [], meta: { total: 0, page: 1, lastPage: 1 } };
};

// ── TanStack Query Hooks ─────────────────────────────────────────────────

/**
 * Fetch a paginated list of appointments with optional status and date filters.
 */
export function useAppointments(query: FindAppointmentsQuery = {}) {
  const { enabled = true, page = 1, limit = 20, status, from, to, consultantId, clientBusinessId } = query;

  const queryKey = ['appointments', { page, limit, status, from, to, consultantId, clientBusinessId }];

  const queryResult = stabilizeErrorRetry(
    useQuery({
      queryKey,
      queryFn: async () => {
        try {
          const params = new URLSearchParams();
          if (page) params.set('page', String(page));
          if (limit) params.set('limit', String(limit));
          if (status) params.set('status', status);
          if (from) params.set('from', from);
          if (to) params.set('to', to);
          if (consultantId) params.set('consultantId', consultantId);
          if (clientBusinessId) params.set('clientBusinessId', clientBusinessId);

          const response = await apiClient.get<PaginatedAppointmentsResponse>(
            `/appointments?${params.toString()}`,
          );
          return unwrapAppointmentList(response.data);
        } catch (error) {
          throw normalizeAppointmentError(error);
        }
      },
      enabled,
    }),
  );

  return {
    appointments: queryResult.data?.items ?? [],
    meta: queryResult.data?.meta ?? { total: 0, page: 1, lastPage: 1 },
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error as AppointmentError | null,
    refetch: queryResult.refetch,
  };
}

/**
 * Fetch a single appointment by its UUID.
 */
export function useAppointment(id?: string | null, options: { enabled?: boolean } = {}) {
  const isEnabled = Boolean(id) && (options.enabled ?? true);
  const queryKey = ['appointments', 'detail', id];

  const queryResult = stabilizeErrorRetry(
    useQuery({
      queryKey,
      queryFn: async () => {
        if (!id) throw new Error('Appointment ID is required');
        try {
          const response = await apiClient.get<Appointment>(`/appointments/${id}`);
          return unwrapAppointment(response.data);
        } catch (error) {
          throw normalizeAppointmentError(error);
        }
      },
      enabled: isEnabled,
    }),
  );

  return {
    appointment: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error as AppointmentError | null,
    refetch: queryResult.refetch,
  };
}

/**
 * Mutation to schedule a new appointment.
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput): Promise<Appointment> => {
      try {
        const response = await apiClient.post<Appointment>('/appointments', input);
        return unwrapAppointment(response.data);
      } catch (error) {
        throw normalizeAppointmentError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Mutation to update an existing appointment (reschedule, edit notes, update status).
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateAppointmentInput & { id: string }): Promise<Appointment> => {
      try {
        const response = await apiClient.patch<Appointment>(`/appointments/${id}`, input);
        return unwrapAppointment(response.data);
      } catch (error) {
        throw normalizeAppointmentError(error);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['appointments', 'detail', data.id] });
      }
    },
  });
}

/**
 * Mutation to convert a consultancy session into a billable task.
 * Invalidates both appointments and task caches upon completion.
 */
export function useConvertAppointmentToTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: ConvertAppointmentToTaskInput & { id: string }): Promise<ConvertedAppointmentResult> => {
      try {
        const response = await apiClient.post<ConvertedAppointmentResult>(
          `/appointments/${id}/convert-to-task`,
          input,
        );
        const data = response.data as unknown as Record<string, unknown>;
        const appointment = (data?.appointment ?? data) as Appointment;
        const task = (data?.task ?? {}) as ConvertedAppointmentResult['task'];
        return { appointment, task };
      } catch (error) {
        throw normalizeAppointmentError(error);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      if (data?.appointment?.id) {
        queryClient.invalidateQueries({ queryKey: ['appointments', 'detail', data.appointment.id] });
      }
      // Invalidate task queries so newly converted task immediately shows in task lists
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['managed-tasks'] });
    },
  });
}

