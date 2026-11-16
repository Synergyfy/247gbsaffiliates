'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  useAppointments,
  Appointment,
  AppointmentStatus,
  useUpdateAppointment,
} from '@/hooks/useAppointments';
import { useConsultantBusinesses } from '@/hooks/useConsultantBusinesses';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';
import { BookAppointmentModal } from '@/components/consultant/BookAppointmentModal';
import { AppointmentDetailsModal } from '@/components/consultant/AppointmentDetailsModal';
import { ConvertSessionToTaskModal } from '@/components/consultant/ConvertSessionToTaskModal';

type FilterTab = 'ALL' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [appointmentToConvert, setAppointmentToConvert] = useState<Appointment | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const { data: businesses = [] } = useConsultantBusinesses();
  const { appointments, isLoading, isError, error, refetch } = useAppointments({ limit: 100 });
  const updateAppointment = useUpdateAppointment();

  // Map business UUID to readable name
  const businessMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of businesses) {
      map.set(b.id, b.name);
    }
    return map;
  }, [businesses]);

  const getBusinessName = (clientBusinessId: string) => {
    return businessMap.get(clientBusinessId) || `Business (${clientBusinessId.slice(0, 8)}…)`;
  };

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // Tab filter
      if (activeTab === 'UPCOMING') {
        const isUpcomingStatus =
          appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.RESCHEDULED;
        if (!isUpcomingStatus) return false;
      } else if (activeTab === 'IN_PROGRESS') {
        if (appt.status !== AppointmentStatus.IN_PROGRESS) return false;
      } else if (activeTab === 'COMPLETED') {
        if (appt.status !== AppointmentStatus.COMPLETED) return false;
      } else if (activeTab === 'CANCELLED') {
        if (appt.status !== AppointmentStatus.CANCELLED) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const bName = getBusinessName(appt.clientBusinessId).toLowerCase();
        const titleMatch = appt.title.toLowerCase().includes(term);
        const notesMatch = appt.notes?.toLowerCase().includes(term) ?? false;
        const businessMatch = bName.includes(term);
        if (!titleMatch && !notesMatch && !businessMatch) return false;
      }

      return true;
    });
  }, [appointments, activeTab, searchTerm, businessMap]);

  // Tab counts
  const counts = useMemo(() => {
    let upcoming = 0;
    let inProgress = 0;
    let completed = 0;
    let cancelled = 0;
    for (const appt of appointments) {
      if (appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.RESCHEDULED) {
        upcoming += 1;
      } else if (appt.status === AppointmentStatus.IN_PROGRESS) {
        inProgress += 1;
      } else if (appt.status === AppointmentStatus.COMPLETED) {
        completed += 1;
      } else if (appt.status === AppointmentStatus.CANCELLED) {
        cancelled += 1;
      }
    }
    return {
      all: appointments.length,
      upcoming,
      inProgress,
      completed,
      cancelled,
    };
  }, [appointments]);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Scheduled
          </span>
        );
      case AppointmentStatus.IN_PROGRESS:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            In Progress
          </span>
        );
      case AppointmentStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-xs">check</span>
            Completed
          </span>
        );
      case AppointmentStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      case AppointmentStatus.RESCHEDULED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="material-symbols-outlined text-xs">update</span>
            Rescheduled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const handleStartSession = async (e: React.MouseEvent, appt: Appointment) => {
    e.stopPropagation();
    try {
      await updateAppointment.mutateAsync({
        id: appt.id,
        status: AppointmentStatus.IN_PROGRESS,
      });
      setActionSuccessNotice(`Session "${appt.title}" marked as In Progress.`);
    } catch {
      // Ignored
    }
  };

  const handleCompleteSession = async (e: React.MouseEvent, appt: Appointment) => {
    e.stopPropagation();
    try {
      await updateAppointment.mutateAsync({
        id: appt.id,
        status: AppointmentStatus.COMPLETED,
      });
      setActionSuccessNotice(`Session "${appt.title}" marked as Completed.`);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4 px-3 py-4 sm:px-5 lg:px-7">
      {/* Page Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">Consultant Workspace</p>
          <h1 className="mt-0.5 text-xl font-semibold text-slate-950 sm:text-2xl">Consultancy Sessions</h1>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Coordinate advisory appointments with Central Hub businesses and convert strategic findings into billable tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 self-start sm:self-auto rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          <span>Schedule New Session</span>
        </button>
      </header>

      {/* Success Notice Banner */}
      {actionSuccessNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-base">check_circle</span>
            <p className="font-medium">{actionSuccessNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'UPCOMING'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Upcoming ({counts.upcoming})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            In Progress ({counts.inProgress})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'COMPLETED'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Completed ({counts.completed})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'CANCELLED'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Cancelled ({counts.cancelled})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-56 sm:max-w-xs">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Search sessions or businesses…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 transition-all placeholder-slate-400"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-20 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : isError ? (
        <RequestErrorState
          area="Consultant sessions"
          label="Consultancy sessions"
          error={error}
          onRetry={() => void refetch()}
          supportHref="/dashboard/consultant/messages"
        />
      ) : filteredAppointments.length > 0 ? (
        <section className="space-y-3">
          {filteredAppointments.map((appt) => {
            const scheduledDate = new Date(appt.scheduledAt);
            const isCancelled = appt.status === AppointmentStatus.CANCELLED;
            const isCompleted = appt.status === AppointmentStatus.COMPLETED;
            const isConverted = Boolean(appt.convertedTaskId);
            const bName = getBusinessName(appt.clientBusinessId);

            return (
              <div
                key={appt.id}
                onClick={() => {
                  setSelectedAppointment(appt);
                  setIsDetailsModalOpen(true);
                }}
                className="group relative rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
              >
                {/* Left: Date pill + Info */}
                <div className="flex items-start gap-3 min-w-0">
                  {/* Calendar Date Badge */}
                  <div className="shrink-0 rounded-xl bg-slate-100/80 p-2 sm:p-2.5 text-center min-w-[54px] sm:min-w-[62px]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      {scheduledDate.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="block text-lg font-extrabold text-slate-900 leading-tight">
                      {scheduledDate.getDate()}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium">
                      {scheduledDate.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                  </div>

                  {/* Main Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-slate-950 group-hover:text-blue-700 transition-colors truncate">
                        {appt.title}
                      </h2>
                      {getStatusBadge(appt.status)}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <span className="material-symbols-outlined text-sm text-slate-400">storefront</span>
                        {bName}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                        {scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({appt.durationMinutes} mins)
                      </span>
                    </div>

                    {appt.notes && (
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-1 max-w-2xl">{appt.notes}</p>
                    )}

                    {/* Converted Task Link */}
                    {isConverted && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        <span className="material-symbols-outlined text-sm">task_alt</span>
                        <span>Converted to Task</span>
                        <Link
                          href={`/dashboard/consultant/tasks/${appt.convertedTaskId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="underline hover:text-blue-900 ml-1"
                        >
                          Open Task →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div
                  className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 shrink-0 w-full md:w-auto border-t border-slate-100 pt-2.5 md:border-0 md:pt-0 self-end md:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Meeting Link Button */}
                  {appt.meetingUrl && !isCancelled && (
                    <a
                      href={appt.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">videocam</span>
                      <span>Join</span>
                    </a>
                  )}

                  {/* Start Session Quick Action */}
                  {appt.status === AppointmentStatus.SCHEDULED && (
                    <button
                      type="button"
                      onClick={(e) => handleStartSession(e, appt)}
                      disabled={updateAppointment.isPending}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors shadow-2xs"
                    >
                      Start
                    </button>
                  )}

                  {/* Complete Session Quick Action */}
                  {appt.status === AppointmentStatus.IN_PROGRESS && (
                    <button
                      type="button"
                      onClick={(e) => handleCompleteSession(e, appt)}
                      disabled={updateAppointment.isPending}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                    >
                      Complete
                    </button>
                  )}

                  {/* Convert to Task CTA */}
                  {!isCancelled && !isConverted && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppointmentToConvert(appt);
                        setIsConvertModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">assignment_add</span>
                      <span className="hidden sm:inline">Convert to Task</span>
                      <span className="sm:hidden">Convert</span>
                    </button>
                  )}

                  {/* Details / More Chevron */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setIsDetailsModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                    aria-label="View appointment details"
                  >
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        /* Empty State */
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center sm:p-14">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              calendar_today
            </span>
          </div>
          {appointments.length === 0 ? (
            <>
              <h2 className="text-base font-bold text-slate-900">No consultancy sessions scheduled yet</h2>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 leading-relaxed">
                When you schedule advisory sessions with Central Hub client businesses, your calendar and deliverables will appear here.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">calendar_month</span>
                  <span>Schedule Your First Session</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-base font-bold text-slate-900">No matching sessions found</h2>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                Try selecting another status tab or clearing your search term.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ALL');
                    setSearchTerm('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={() => {
          setActionSuccessNotice('Appointment scheduled successfully.');
          refetch();
        }}
      />

      {/* Details & Reschedule Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedAppointment(null);
        }}
        onConvertToTask={(appt) => {
          setIsDetailsModalOpen(false);
          setSelectedAppointment(null);
          setAppointmentToConvert(appt);
          setIsConvertModalOpen(true);
        }}
      />

      {/* Convert to Task Modal */}
      <ConvertSessionToTaskModal
        appointment={appointmentToConvert}
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
          setAppointmentToConvert(null);
        }}
        onSuccess={(createdTaskId) => {
          setActionSuccessNotice(`Session converted into task #${createdTaskId.slice(0, 8)} successfully.`);
          refetch();
        }}
      />
    </div>
  );
}
