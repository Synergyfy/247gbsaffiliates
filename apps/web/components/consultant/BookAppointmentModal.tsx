'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useCreateAppointment,
  useAppointments,
  calculateAvailableSlots,
  TimeSlot,
  AppointmentError,
} from '@/hooks/useAppointments';
import { useConsultantBusinesses } from '@/hooks/useConsultantBusinesses';

const appointmentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  clientBusinessId: z
    .string()
    .uuid('Must be a valid business UUID from Central Hub')
    .min(1, 'Please select or enter a client business'),
  notes: z
    .string()
    .max(5000, 'Notes cannot exceed 5000 characters')
    .optional(),
  durationMinutes: z.coerce.number().min(15).max(480).default(60),
  meetingUrl: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
      message: 'Meeting URL must start with http:// or https://',
    }),
});

type FormInputValues = z.input<typeof appointmentSchema>;
type FormValues = z.output<typeof appointmentSchema>;

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { data: businesses = [], isLoading: isLoadingBusinesses } = useConsultantBusinesses();
  const createAppointment = useCreateAppointment();

  // Selected date for slot calculation (defaults to today's date formatted YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isCustomBusiness, setIsCustomBusiness] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInputValues, unknown, FormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      clientBusinessId: '',
      notes: '',
      durationMinutes: 60,
      meetingUrl: '',
    },
  });

  const rawDuration = watch('durationMinutes');
  const durationMinutes: number = typeof rawDuration === 'number' ? rawDuration : Number(rawDuration) || 60;

  // Compute UTC day boundary for query
  const { fromIso, toIso } = useMemo(() => {
    const dateObj = new Date(`${selectedDateStr}T00:00:00`);
    const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
    const end = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999);
    return {
      fromIso: start.toISOString(),
      toIso: end.toISOString(),
    };
  }, [selectedDateStr]);

  // Fetch consultant's appointments around the selected day to find collisions
  const { appointments = [] } = useAppointments({
    from: fromIso,
    to: toIso,
    limit: 100,
    enabled: isOpen,
  });

  // Calculate slots dynamically
  const availableSlots = useMemo(() => {
    if (!selectedDateStr) return [];
    const dateObj = new Date(`${selectedDateStr}T00:00:00`);
    return calculateAvailableSlots({
      date: dateObj,
      appointments,
      durationMinutes,
      availability: {
        startHour: '08:00',
        endHour: '20:00',
        slotIntervalMinutes: 30,
        availableDays: [0, 1, 2, 3, 4, 5, 6], // Flexible across all 7 days
      },
    });
  }, [selectedDateStr, appointments, durationMinutes]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setConflictError(null);
      setGeneralError(null);
      setSelectedSlot(null);
      setSelectedDateStr(todayStr);
      // Auto-select first business if available
      if (businesses.length > 0 && !isCustomBusiness) {
        setValue('clientBusinessId', businesses[0].id, { shouldValidate: true });
      }
    }
  }, [isOpen, todayStr, businesses, isCustomBusiness, setValue]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: FormValues) => {
    if (!selectedSlot) {
      setGeneralError('Please select an available time slot for this session.');
      return;
    }

    setConflictError(null);
    setGeneralError(null);

    try {
      await createAppointment.mutateAsync({
        clientBusinessId: values.clientBusinessId,
        title: values.title.trim(),
        notes: values.notes?.trim() || undefined,
        scheduledAt: selectedSlot.startTime,
        durationMinutes: values.durationMinutes,
        meetingUrl: values.meetingUrl?.trim() || undefined,
      });

      reset();
      setSelectedSlot(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      const apptErr = err as AppointmentError;
      if (apptErr.code === 'APPOINTMENT_SLOT_UNAVAILABLE' || apptErr.status === 409) {
        // Retain form inputs! Alert conflict inline
        setConflictError(
          apptErr.message || 'This time slot was just booked by another session. Please pick an alternative slot below.',
        );
        setSelectedSlot(null);
      } else {
        setGeneralError(apptErr.message || 'Failed to book appointment. Please check your inputs.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/60 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Advisory Session</span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">Schedule Client Appointment</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {/* Conflict Banner */}
          {conflictError && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 sm:p-4 text-amber-900 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-amber-700 text-lg shrink-0 mt-0.5">warning</span>
              <div className="text-xs">
                <p className="font-semibold text-amber-950">Slot Collision Conflict</p>
                <p className="mt-0.5 leading-relaxed">{conflictError}</p>
                <p className="mt-1 font-medium text-amber-800">Your form entries were saved. Please select another open time slot below.</p>
              </div>
            </div>
          )}

          {/* General Error Banner */}
          {generalError && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3 sm:p-4 text-red-900 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-700 text-lg shrink-0 mt-0.5">error</span>
              <p className="text-xs leading-relaxed">{generalError}</p>
            </div>
          )}

          {/* Client Business Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Client Business <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomBusiness(!isCustomBusiness);
                  setValue('clientBusinessId', '', { shouldValidate: true });
                }}
                className="text-[11px] font-semibold text-blue-700 hover:underline"
              >
                {isCustomBusiness ? '← Select from known businesses' : '+ Enter business ID manually'}
              </button>
            </div>

            {isCustomBusiness ? (
              <div>
                <input
                  type="text"
                  placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all ${
                    errors.clientBusinessId ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
                  }`}
                  {...register('clientBusinessId')}
                />
                <p className="text-[10px] text-slate-500 mt-1">Enter the 36-character Central Hub Business UUID.</p>
              </div>
            ) : (
              <div className="relative">
                <select
                  disabled={isLoadingBusinesses}
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition-all appearance-none ${
                    errors.clientBusinessId ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
                  }`}
                  {...register('clientBusinessId')}
                >
                  <option value="">{isLoadingBusinesses ? 'Loading client businesses…' : 'Select client business…'}</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.accountManagerName ? `(AM: ${b.accountManagerName})` : ''}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  expand_more
                </span>
              </div>
            )}
            {errors.clientBusinessId && (
              <p className="text-[11px] text-red-600 font-medium">{errors.clientBusinessId.message}</p>
            )}
          </div>

          {/* Session Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Session Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Operational Readiness Review & Roadmap Planning"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all ${
                errors.title ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
              }`}
              {...register('title')}
            />
            {errors.title && <p className="text-[11px] text-red-600 font-medium">{errors.title.message}</p>}
          </div>

          {/* Date & Duration Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Session Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={selectedDateStr}
                onChange={(e) => {
                  setSelectedDateStr(e.target.value);
                  setSelectedSlot(null);
                  setConflictError(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Duration <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 transition-all appearance-none"
                  {...register('durationMinutes')}
                  onChange={(e) => {
                    register('durationMinutes').onChange(e);
                    setSelectedSlot(null);
                    setConflictError(null);
                  }}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes (1 hour)</option>
                  <option value={90}>90 minutes (1.5 hours)</option>
                  <option value={120}>120 minutes (2 hours)</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Available Slots Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Choose Time Slot <span className="text-red-500">*</span>
              </label>
              {selectedSlot && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Selected: {selectedSlot.label}
                </span>
              )}
            </div>

            {availableSlots.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center border border-dashed rounded-xl">
                No slots available on this day. Please pick another date.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setConflictError(null);
                        setGeneralError(null);
                      }}
                      className={`px-2.5 py-2 text-xs font-medium rounded-lg text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow-xs ring-2 ring-blue-600/30'
                          : slot.isAvailable
                          ? 'bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed line-through'
                      }`}
                    >
                      <div>{slot.label}</div>
                      {!slot.isAvailable && (
                        <div className="text-[9px] no-underline font-normal text-slate-400">
                          {slot.unavailableReason === 'PAST_SLOT' ? 'Past' : 'Booked'}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meeting URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Meeting Link <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://meet.google.com/abc-defg-hij"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all ${
                errors.meetingUrl ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
              }`}
              {...register('meetingUrl')}
            />
            {errors.meetingUrl && <p className="text-[11px] text-red-600 font-medium">{errors.meetingUrl.message}</p>}
          </div>

          {/* Advisory Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Session Agenda & Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Outline objectives, agreed deliverables or review questions for the client…"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all ${
                errors.notes ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'
              }`}
              {...register('notes')}
            />
            {errors.notes && <p className="text-[11px] text-red-600 font-medium">{errors.notes.message}</p>}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={createAppointment.isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAppointment.isPending || !selectedSlot}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1.5"
            >
              {createAppointment.isPending ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  <span>Scheduling…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  <span>Confirm Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
