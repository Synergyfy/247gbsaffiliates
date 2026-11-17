'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Appointment,
  AppointmentStatus,
  useUpdateAppointment,
  useAppointments,
  calculateAvailableSlots,
  TimeSlot,
  AppointmentError,
} from '@/hooks/useAppointments';
import { useConsultantBusinesses } from '@/hooks/useConsultantBusinesses';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConvertToTask?: (appointment: Appointment) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConvertToTask,
}) => {
  const { data: businesses = [] } = useConsultantBusinesses();
  const updateAppointment = useUpdateAppointment();

  // Mode: 'view' | 'reschedule' | 'edit'
  const [mode, setMode] = useState<'view' | 'reschedule' | 'edit'>('view');

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editMeetingUrl, setEditMeetingUrl] = useState('');

  // Reschedule fields
  const [rescheduleDateStr, setRescheduleDateStr] = useState('');
  const [rescheduleDuration, setRescheduleDuration] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [notesExpanded, setNotesExpanded] = useState(false);

  // Initialize form state when entering edit or reschedule mode
  React.useEffect(() => {
    if (appointment && isOpen) {
      setEditTitle(appointment.title);
      setEditNotes(appointment.notes || '');
      setEditMeetingUrl(appointment.meetingUrl || '');
      setRescheduleDuration(appointment.durationMinutes || 60);

      const d = new Date(appointment.scheduledAt);
      const pad = (n: number) => String(n).padStart(2, '0');
      const ymd = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      setRescheduleDateStr(ymd);

      setSelectedSlot(null);
      setConflictError(null);
      setGeneralError(null);
      setNotesExpanded(false);
      setMode('view');
    }
  }, [appointment, isOpen]);

  // Find business name
  const businessName = useMemo(() => {
    if (!appointment) return '';
    const found = businesses.find((b) => b.id === appointment.clientBusinessId);
    return found ? found.name : `Business (${appointment.clientBusinessId.slice(0, 8)}…)`;
  }, [appointment, businesses]);

  // Fetch appointments for candidate reschedule day
  const { fromIso, toIso } = useMemo(() => {
    if (!rescheduleDateStr) return { fromIso: '', toIso: '' };
    const dateObj = new Date(`${rescheduleDateStr}T00:00:00`);
    const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
    const end = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999);
    return {
      fromIso: start.toISOString(),
      toIso: end.toISOString(),
    };
  }, [rescheduleDateStr]);

  const { appointments: candidateDayAppointments = [] } = useAppointments({
    from: fromIso,
    to: toIso,
    limit: 100,
    enabled: isOpen && mode === 'reschedule',
  });

  // Calculate slots for rescheduling (excluding current appointment id)
  const availableSlots = useMemo(() => {
    if (!rescheduleDateStr || !appointment) return [];
    const dateObj = new Date(`${rescheduleDateStr}T00:00:00`);
    return calculateAvailableSlots({
      date: dateObj,
      appointments: candidateDayAppointments,
      durationMinutes: rescheduleDuration,
      excludeAppointmentId: appointment.id,
      availability: {
        startHour: '08:00',
        endHour: '20:00',
        slotIntervalMinutes: 30,
        availableDays: [0, 1, 2, 3, 4, 5, 6],
      },
    });
  }, [rescheduleDateStr, candidateDayAppointments, rescheduleDuration, appointment]);

  if (!isOpen || !appointment) return null;

  const isCancelled = appointment.status === AppointmentStatus.CANCELLED;
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const isConverted = Boolean(appointment.convertedTaskId);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Scheduled</span>;
      case AppointmentStatus.IN_PROGRESS:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">In Progress</span>;
      case AppointmentStatus.COMPLETED:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case AppointmentStatus.CANCELLED:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Cancelled</span>;
      case AppointmentStatus.RESCHEDULED:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Rescheduled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const handleStatusChange = async (nextStatus: AppointmentStatus) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        status: nextStatus,
      });
      onClose();
    } catch (err) {
      const apptErr = err as AppointmentError;
      setGeneralError(apptErr.message || 'Failed to update status.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setGeneralError('Title cannot be empty');
      return;
    }
    setGeneralError(null);
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        title: editTitle.trim(),
        notes: editNotes.trim() || undefined,
        meetingUrl: editMeetingUrl.trim() || undefined,
      });
      setMode('view');
    } catch (err) {
      const apptErr = err as AppointmentError;
      setGeneralError(apptErr.message || 'Failed to save changes.');
    }
  };

  const handleSaveReschedule = async () => {
    if (!selectedSlot) {
      setGeneralError('Please select a new time slot.');
      return;
    }
    setConflictError(null);
    setGeneralError(null);
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        scheduledAt: selectedSlot.startTime,
        durationMinutes: rescheduleDuration,
        status: AppointmentStatus.RESCHEDULED,
      });
      setMode('view');
      onClose();
    } catch (err) {
      const apptErr = err as AppointmentError;
      if (apptErr.code === 'APPOINTMENT_SLOT_UNAVAILABLE' || apptErr.status === 409) {
        setConflictError(apptErr.message || 'This time slot is no longer available. Please select another slot.');
        setSelectedSlot(null);
      } else {
        setGeneralError(apptErr.message || 'Failed to reschedule appointment.');
      }
    }
  };

  const scheduledDate = new Date(appointment.scheduledAt);

  const isLongNotes = Boolean(
    appointment.notes &&
      (appointment.notes.length > 75 || appointment.notes.includes('\n'))
  );

  const getCollapsedNotes = (text: string) => {
    const firstLine = text.split('\n')[0];
    if (firstLine.length <= 75) {
      return firstLine;
    }
    const cut = text.slice(0, 75);
    const lastSpace = cut.lastIndexOf(' ');
    return lastSpace > 45 ? cut.slice(0, lastSpace) : cut;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Mobile Bottom Sheet */}
      <div
        className="relative w-full max-w-xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh] transition-transform duration-200 ease-out"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Pull Handle */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden shrink-0">
          <div className="h-1 w-9 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 sm:py-3.5 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 text-xl">
              {mode === 'reschedule' ? 'schedule' : mode === 'edit' ? 'edit' : 'event'}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {mode === 'reschedule' ? 'Reschedule Session' : mode === 'edit' ? 'Edit Session Details' : 'Session Details'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto px-4 py-2.5 sm:px-5 sm:py-3.5 space-y-2 text-xs sm:text-sm min-h-0 flex-1">
          {/* General Error Banner */}
          {generalError && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-900 flex items-start gap-2">
              <span className="material-symbols-outlined text-red-700 text-base shrink-0 mt-0.5">error</span>
              <p className="text-xs">{generalError}</p>
            </div>
          )}

          {/* VIEW MODE */}
          {mode === 'view' && (
            <>
              {/* Title & Status */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold leading-snug text-slate-950 sm:text-lg">
                    {appointment.title}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <span className="material-symbols-outlined !text-sm text-slate-400">
                      storefront
                    </span>
                    <span className="truncate">{businessName}</span>
                  </div>
                </div>
                <div className="shrink-0">{getStatusBadge(appointment.status)}</div>
              </div>

              {/* Schedule Info & Meeting Channel (Compact 2-column grid with tight divider) */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Scheduled Time
                  </span>
                  <p className="mt-0.5 text-xs font-semibold text-slate-900 leading-tight">
                    {scheduledDate.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {scheduledDate.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    ({appointment.durationMinutes}m)
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Meeting Channel
                  </span>
                  {appointment.meetingUrl ? (
                    <div className="mt-0.5">
                      <a
                        href={appointment.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                      >
                        <span className="material-symbols-outlined !text-sm">videocam</span>
                        <span>Open Meeting</span>
                        <span className="material-symbols-outlined !text-xs">open_in_new</span>
                      </a>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-[11px] italic text-slate-400">No meeting link</p>
                  )}
                </div>
              </div>

              {/* Advisory Notes & Agenda (Flat layout with subtle divider, collapsed strictly to 2 lines with inline ...read more) */}
              <div className="border-t border-slate-100 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Advisory Notes & Agenda
                </span>
                <div className="mt-0.5 text-xs leading-relaxed text-slate-700">
                  {appointment.notes ? (
                    <p>
                      {notesExpanded ? (
                        <>
                          <span className="whitespace-pre-wrap">{appointment.notes}</span>{' '}
                          <button
                            type="button"
                            onClick={() => setNotesExpanded(false)}
                            className="inline font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                          >
                            (show less)
                          </button>
                        </>
                      ) : (
                        <>
                          <span>
                            {isLongNotes
                              ? `${getCollapsedNotes(appointment.notes)}… `
                              : appointment.notes}
                          </span>
                          {isLongNotes && (
                            <button
                              type="button"
                              onClick={() => setNotesExpanded(true)}
                              className="inline font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                            >
                              read more
                            </button>
                          )}
                        </>
                      )}
                    </p>
                  ) : (
                    <span className="italic text-slate-400">
                      No notes recorded for this session.
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* EDIT MODE */}
          {mode === 'edit' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Meeting Link</label>
                <input
                  type="url"
                  value={editMeetingUrl}
                  onChange={(e) => setEditMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Advisory Notes</label>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {/* RESCHEDULE MODE */}
          {mode === 'reschedule' && (
            <div className="space-y-3">
              {conflictError && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900 text-xs">
                  <p className="font-semibold text-amber-950">Slot Collision Conflict</p>
                  <p className="mt-0.5">{conflictError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">New Date</label>
                  <input
                    type="date"
                    value={rescheduleDateStr}
                    onChange={(e) => {
                      setRescheduleDateStr(e.target.value);
                      setSelectedSlot(null);
                      setConflictError(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Duration</label>
                  <select
                    value={rescheduleDuration}
                    onChange={(e) => {
                      setRescheduleDuration(Number(e.target.value));
                      setSelectedSlot(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                    <option value={120}>120 mins</option>
                  </select>
                </div>
              </div>

              {/* Slot Grid */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Choose New Slot</label>
                  {selectedSlot && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {selectedSlot.label}
                    </span>
                  )}
                </div>

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
                        }}
                        className={`px-2 py-2 text-xs font-medium rounded-lg text-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : slot.isAvailable
                            ? 'bg-white text-slate-800 hover:bg-blue-50 border border-slate-200'
                            : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed line-through'
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Bottom Actions Footer */}
        <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-5 sm:py-3.5 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-3.5 shrink-0">
          {/* VIEW MODE FOOTER */}
          {mode === 'view' && (
            <div className="space-y-2.5">
              {/* Secondary Actions Toolbar (Reschedule, Edit, Cancel) */}
              {(!isCancelled || !isCompleted) && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {!isCancelled && !isCompleted && (
                      <button
                        type="button"
                        onClick={() => setMode('reschedule')}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined !text-sm text-slate-500">schedule</span>
                        <span>Reschedule</span>
                      </button>
                    )}
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => setMode('edit')}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined !text-sm text-slate-500">edit</span>
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {!isCancelled && !isCompleted && !isConverted && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            'Are you sure you want to cancel this appointment? This will free the slot.',
                          )
                        ) {
                          handleStatusChange(AppointmentStatus.CANCELLED);
                        }
                      }}
                      disabled={updateAppointment.isPending}
                      className="inline-flex h-9 items-center rounded-lg px-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-1 border-t border-slate-100">
                {appointment.status === AppointmentStatus.SCHEDULED && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(AppointmentStatus.IN_PROGRESS)}
                    disabled={updateAppointment.isPending}
                    className="inline-flex h-11 sm:h-9 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-amber-600 active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined !text-base">play_arrow</span>
                    <span>Start Session</span>
                  </button>
                )}

                {appointment.status === AppointmentStatus.IN_PROGRESS && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(AppointmentStatus.COMPLETED)}
                    disabled={updateAppointment.isPending}
                    className="inline-flex h-11 sm:h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-emerald-700 active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined !text-base">check_circle</span>
                    <span>Complete Session</span>
                  </button>
                )}

                {isConverted ? (
                  <Link
                    href={`/dashboard/consultant/tasks/${appointment.convertedTaskId}`}
                    className="inline-flex h-11 sm:h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-[0.99]"
                  >
                    <span>Open Task</span>
                    <span className="material-symbols-outlined !text-sm leading-none">arrow_forward</span>
                  </Link>
                ) : (
                  !isCancelled &&
                  onConvertToTask && (
                    <button
                      type="button"
                      onClick={() => onConvertToTask(appointment)}
                      className="inline-flex h-11 sm:h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-700 active:scale-[0.99]"
                    >
                      <span>Convert to Task</span>
                      <span className="material-symbols-outlined !text-sm leading-none">arrow_forward</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* EDIT MODE FOOTER */}
          {mode === 'edit' && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="h-10 sm:h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={updateAppointment.isPending}
                className="h-10 sm:h-9 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {updateAppointment.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* RESCHEDULE MODE FOOTER */}
          {mode === 'reschedule' && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="h-10 sm:h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                disabled={updateAppointment.isPending || !selectedSlot}
                className="h-10 sm:h-9 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {updateAppointment.isPending ? 'Rescheduling…' : 'Confirm Reschedule'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

