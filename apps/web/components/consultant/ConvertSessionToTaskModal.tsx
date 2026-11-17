'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Appointment, useConvertAppointmentToTask, AppointmentError } from '@/hooks/useAppointments';
import { useAgents } from '@/hooks/useAgents';

const convertSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .max(10000, 'Description cannot exceed 10000 characters')
    .optional(),
  budget: z.coerce.number().min(5, 'Minimum budget is €5.00 EUR'),
  assignedAgentId: z.string().optional(),
  dueDate: z.string().optional(),
  centralProjectId: z.string().optional(),
});

type FormInputValues = z.input<typeof convertSchema>;
type FormValues = z.output<typeof convertSchema>;

interface ConvertSessionToTaskModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdTaskId: string) => void;
}

export const ConvertSessionToTaskModal: React.FC<ConvertSessionToTaskModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { data: agents = [] } = useAgents();
  const convertMutation = useConvertAppointmentToTask();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInputValues, unknown, FormValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: 50,
      assignedAgentId: '',
      dueDate: '',
      centralProjectId: '',
    },
  });

  useEffect(() => {
    if (appointment && isOpen) {
      setErrorMessage(null);
      setValue('title', `Action Items: ${appointment.title}`.slice(0, 200));
      setValue(
        'description',
        appointment.notes ||
          `Agreed actions and deliverables resulting from the consultancy session "${appointment.title}".`,
      );
      setValue('budget', 50);
      setValue('assignedAgentId', '');
      setValue('dueDate', '');
      setValue('centralProjectId', '');
    }
  }, [appointment, isOpen, setValue]);

  if (!isOpen || !appointment) return null;

  const handleFormSubmit = async (values: FormValues) => {
    setErrorMessage(null);
    try {
      const result = await convertMutation.mutateAsync({
        id: appointment.id,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        budget: values.budget,
        assignedAgentId: values.assignedAgentId || undefined,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        centralProjectId: values.centralProjectId?.trim() || undefined,
      });

      reset();
      onSuccess?.(result.task.id);
      onClose();
    } catch (err) {
      const apptErr = err as AppointmentError;
      setErrorMessage(apptErr.message || 'Failed to convert session into a task.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-5 overflow-hidden">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[92vh] transition-transform duration-200 ease-out" role="dialog" aria-modal="true">
        {/* Mobile Pull Handle */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden shrink-0">
          <div className="h-1 w-9 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 sm:py-4 bg-slate-50/60 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Advisory Deliverable</span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">Convert Session to Task</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm min-h-0 flex-1">
          {errorMessage && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-900 flex items-start gap-2">
              <span className="material-symbols-outlined text-red-700 text-base shrink-0 mt-0.5">error</span>
              <p className="text-xs leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900">
            <p className="font-semibold text-blue-950">Converting Session</p>
            <p className="mt-0.5 text-blue-800">
              This will create a billable deliverable task in the 247GBS task pipeline linked to client business{' '}
              <span className="font-mono font-semibold">{appointment.clientBusinessId.slice(0, 8)}…</span>.
            </p>
          </div>

          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Implement Digital Marketing Roadmap"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                errors.title ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
              }`}
              {...register('title')}
            />
            {errors.title && <p className="text-[11px] text-red-600 font-medium">{errors.title.message}</p>}
          </div>

          {/* Task Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Task Deliverable Brief <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Detailed deliverables, milestone criteria and submission requirements agreed during the session…"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                errors.description ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
              }`}
              {...register('description')}
            />
            {errors.description && <p className="text-[11px] text-red-600 font-medium">{errors.description.message}</p>}
          </div>

          {/* Budget & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Fixed Budget (EUR €) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
                <input
                  type="number"
                  step="0.01"
                  min="5"
                  placeholder="50.00"
                  className={`w-full rounded-xl border pl-8 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all ${
                    errors.budget ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
                  }`}
                  {...register('budget')}
                />
              </div>
              {errors.budget && <p className="text-[11px] text-red-600 font-medium">{errors.budget.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Due Date</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 transition-all"
                {...register('dueDate')}
              />
            </div>
          </div>

          {/* Assigned Agent */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Assign Field Agent <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 transition-all appearance-none"
                {...register('assignedAgentId')}
              >
                <option value="">Leave unassigned (Open Task Queue)</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} {agent.skills?.length ? `· ${agent.skills.slice(0, 2).join(', ')}` : ''}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                expand_more
              </span>
            </div>
            <p className="text-[10px] text-slate-500">You can assign this deliverable immediately or leave it open for agents to claim.</p>
          </div>

          {/* Central Project ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Central Hub Project ID <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. project-uuid-from-central-hub"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 transition-all"
              {...register('centralProjectId')}
            />
            <p className="text-[10px] text-slate-500">Associate this task with an existing project in Central Hub Solutions.</p>
          </div>

          </div>

          {/* Pinned Footer Actions */}
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:justify-end border-t border-slate-100 bg-white px-4 py-3 sm:px-5 sm:py-3.5 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-3.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={convertMutation.isPending}
              className="h-11 sm:h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={convertMutation.isPending}
              className="h-11 sm:h-9 px-5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              {convertMutation.isPending ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  <span>Converting…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                  <span>Create Billable Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

