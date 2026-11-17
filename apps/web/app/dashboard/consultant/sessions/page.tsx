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

const statusTextColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'text-blue-700',
  [AppointmentStatus.IN_PROGRESS]: 'text-amber-700',
  [AppointmentStatus.COMPLETED]: 'text-emerald-700',
  [AppointmentStatus.RESCHEDULED]: 'text-purple-700',
  [AppointmentStatus.CANCELLED]: 'text-slate-500',
};

const formatInlineDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Date TBD';
  const dayPart = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
  const timePart = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
  return `${dayPart} · ${timePart}`;
};

function SessionCard({
  appt,
  businessName,
  isUpdating,
  onOpenDetails,
  onStart,
  onComplete,
  onConvert,
}: {
  appt: Appointment;
  businessName: string;
  isUpdating: boolean;
  onOpenDetails: (appt: Appointment) => void;
  onStart: (appt: Appointment) => void;
  onComplete: (appt: Appointment) => void;
  onConvert: (appt: Appointment) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isCancelled = appt.status === AppointmentStatus.CANCELLED;
  const isInProgress = appt.status === AppointmentStatus.IN_PROGRESS;
  const isUpcoming =
    appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.RESCHEDULED;
  const isConverted = Boolean(appt.convertedTaskId);

  return (
    <article
      className={`group rounded-xl border bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all hover:border-slate-300 hover:shadow-xs sm:p-3 ${
        isInProgress
          ? 'border-amber-200/90'
          : isUpcoming
            ? 'border-blue-200/80'
            : 'border-slate-200/90'
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        className="flex w-full items-start justify-between gap-2 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h2 className="text-sm font-bold leading-snug text-slate-950">{appt.title}</h2>
            <span
              className={`shrink-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider ${
                statusTextColors[appt.status] || 'text-slate-600'
              }`}
            >
              {appt.status.replaceAll('_', ' ')}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <span className="material-symbols-outlined !text-xs leading-none text-slate-400">
                storefront
              </span>
              <span className="max-w-[160px] truncate sm:max-w-[260px]">{businessName}</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-slate-600">
              <span className="material-symbols-outlined !text-xs leading-none text-slate-400">
                schedule
              </span>
              {formatInlineDateTime(appt.scheduledAt)} ({appt.durationMinutes}m)
            </span>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors group-hover:bg-slate-100 group-hover:text-slate-700"
        >
          <span className="material-symbols-outlined !text-base leading-none">
            {collapsed ? 'expand_more' : 'expand_less'}
          </span>
        </span>
      </button>

      {!collapsed && (
        <div className="mt-2 border-t border-slate-100 pt-2">
          {appt.notes && (
            <p className="mb-2 line-clamp-2 text-xs leading-5 text-slate-600">{appt.notes}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {appt.meetingUrl && !isCancelled ? (
                <a
                  href={appt.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"
                >
                  <span className="material-symbols-outlined !text-sm leading-none">videocam</span>
                  <span>Join video session</span>
                </a>
              ) : (
                <span>
                  <strong className="font-semibold text-slate-700">Duration:</strong>{' '}
                  {appt.durationMinutes} mins
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenDetails(appt)}
                className="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Details
              </button>

              {isUpcoming && (
                <button
                  type="button"
                  onClick={() => onStart(appt)}
                  disabled={isUpdating}
                  className="inline-flex h-7 items-center rounded-lg bg-amber-500 px-2.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-amber-600 disabled:opacity-50"
                >
                  Start
                </button>
              )}

              {isInProgress && (
                <button
                  type="button"
                  onClick={() => onComplete(appt)}
                  disabled={isUpdating}
                  className="inline-flex h-7 items-center rounded-lg bg-emerald-600 px-2.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  Complete
                </button>
              )}

              {isConverted ? (
                <Link
                  href={`/dashboard/consultant/tasks/${appt.convertedTaskId}`}
                  className="inline-flex h-7 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-700"
                >
                  <span>Open Task</span>
                  <span className="material-symbols-outlined !text-xs leading-none">
                    arrow_forward
                  </span>
                </Link>
              ) : (
                !isCancelled && (
                  <button
                    type="button"
                    onClick={() => onConvert(appt)}
                    className="inline-flex h-7 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-700"
                  >
                    <span>Convert to Task</span>
                    <span className="material-symbols-outlined !text-xs leading-none">
                      arrow_forward
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'upcoming' | 'newest'>('upcoming');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [appointmentToConvert, setAppointmentToConvert] = useState<Appointment | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const { data: businesses = [] } = useConsultantBusinesses();
  const { appointments, isLoading, isError, error, refetch } = useAppointments({ limit: 100 });
  const updateAppointment = useUpdateAppointment();

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

  const filteredAppointments = useMemo(() => {
    const list = appointments.filter((appt) => {
      if (activeTab === 'UPCOMING') {
        const isUpcomingStatus =
          appt.status === AppointmentStatus.SCHEDULED ||
          appt.status === AppointmentStatus.RESCHEDULED;
        if (!isUpcomingStatus) return false;
      } else if (activeTab === 'IN_PROGRESS') {
        if (appt.status !== AppointmentStatus.IN_PROGRESS) return false;
      } else if (activeTab === 'COMPLETED') {
        if (appt.status !== AppointmentStatus.COMPLETED) return false;
      } else if (activeTab === 'CANCELLED') {
        if (appt.status !== AppointmentStatus.CANCELLED) return false;
      }

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

    return [...list].sort((a, b) => {
      const timeA = new Date(a.scheduledAt).getTime();
      const timeB = new Date(b.scheduledAt).getTime();
      return sortBy === 'upcoming' ? timeA - timeB : timeB - timeA;
    });
  }, [appointments, activeTab, searchTerm, sortBy, businessMap]);

  const counts = useMemo(() => {
    let upcoming = 0;
    let inProgress = 0;
    let completed = 0;
    let cancelled = 0;
    for (const appt of appointments) {
      if (
        appt.status === AppointmentStatus.SCHEDULED ||
        appt.status === AppointmentStatus.RESCHEDULED
      ) {
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
      ALL: appointments.length,
      UPCOMING: upcoming,
      IN_PROGRESS: inProgress,
      COMPLETED: completed,
      CANCELLED: cancelled,
    };
  }, [appointments]);

  const handleStartSession = async (appt: Appointment) => {
    try {
      await updateAppointment.mutateAsync({
        id: appt.id,
        status: AppointmentStatus.IN_PROGRESS,
      });
      setActionSuccessNotice(`Session "${appt.title}" marked as In Progress.`);
    } catch {
      // Handled by query state
    }
  };

  const handleCompleteSession = async (appt: Appointment) => {
    try {
      await updateAppointment.mutateAsync({
        id: appt.id,
        status: AppointmentStatus.COMPLETED,
      });
      setActionSuccessNotice(`Session "${appt.title}" marked as Completed.`);
    } catch {
      // Handled by query state
    }
  };

  const filterPills: Array<{ id: FilterTab; label: string; count: number; icon: string }> = [
    { id: 'ALL', label: 'All sessions', count: counts.ALL, icon: 'calendar_month' },
    { id: 'UPCOMING', label: 'Upcoming', count: counts.UPCOMING, icon: 'event_upcoming' },
    { id: 'IN_PROGRESS', label: 'In progress', count: counts.IN_PROGRESS, icon: 'pending_actions' },
    { id: 'COMPLETED', label: 'Completed', count: counts.COMPLETED, icon: 'task_alt' },
    { id: 'CANCELLED', label: 'Cancelled', count: counts.CANCELLED, icon: 'event_busy' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-3 pb-8">
      {/* Compact Header Row */}
      <header className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 shadow-2xs">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-slate-950 sm:text-lg">Consultancy Sessions</h1>
          <p className="text-xs text-slate-500">
            Coordinate advisory appointments with Central Hub businesses and convert findings into tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-700"
        >
          <span className="material-symbols-outlined !text-sm leading-none">add</span>
          <span>Schedule Session</span>
        </button>
      </header>

      {/* Success Notice Banner */}
      {actionSuccessNotice && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900"
        >
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined !text-sm text-emerald-700">
              check_circle
            </span>
            <p className="font-medium">{actionSuccessNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900"
            aria-label="Dismiss notice"
          >
            <span className="material-symbols-outlined !text-sm">close</span>
          </button>
        </div>
      )}

      {/* Status Filter Pills */}
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-0.5 py-0.5 touch-pan-x no-scrollbar sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {filterPills.map((pill) => {
          const active = activeTab === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActiveTab(pill.id)}
              className={`flex min-w-[130px] shrink-0 snap-start items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:min-w-0 sm:shrink ${
                active
                  ? 'border-blue-500/70 bg-blue-50/60 text-blue-900 shadow-2xs'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span
                  className={`material-symbols-outlined !text-base leading-none ${
                    active ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {pill.icon}
                </span>
                <span className="truncate">{pill.label}</span>
              </span>
              <span
                className={`tabular-nums text-[11px] ${
                  active ? 'font-bold text-blue-700' : 'text-slate-400'
                }`}
              >
                ({pill.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Compact Search & Sort Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-8 min-w-[200px] flex-1 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 shadow-2xs focus-within:border-blue-600">
          <span className="material-symbols-outlined !text-base text-slate-400">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search sessions or businesses"
            placeholder="Search sessions or client businesses…"
            className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'upcoming' | 'newest')}
          aria-label="Sort consultancy sessions"
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-blue-600 focus:outline-none"
        >
          <option value="upcoming">Sort: Soonest first</option>
          <option value="newest">Sort: Latest first</option>
        </select>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center px-4">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500" role="status">
            <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
            Loading consultancy sessions…
          </div>
        </div>
      ) : isError ? (
        <RequestErrorState
          area="Consultant sessions"
          label="Consultancy sessions"
          error={error}
          onRetry={() => void refetch()}
          supportHref="/dashboard/consultant/messages"
          compact={false}
        />
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-2">
          {filteredAppointments.map((appt) => (
            <SessionCard
              key={appt.id}
              appt={appt}
              businessName={getBusinessName(appt.clientBusinessId)}
              isUpdating={updateAppointment.isPending}
              onOpenDetails={(item) => {
                setSelectedAppointment(item);
                setIsDetailsModalOpen(true);
              }}
              onStart={(item) => void handleStartSession(item)}
              onComplete={(item) => void handleCompleteSession(item)}
              onConvert={(item) => {
                setAppointmentToConvert(item);
                setIsConvertModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <span className="material-symbols-outlined text-3xl text-slate-300" aria-hidden="true">
            calendar_today
          </span>
          {appointments.length === 0 ? (
            <>
              <h2 className="mt-1.5 text-sm font-semibold text-slate-800">
                No consultancy sessions scheduled yet
              </h2>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                When you schedule advisory sessions with Central Hub client businesses, they will appear here.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(true)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-700"
                >
                  <span className="material-symbols-outlined !text-sm leading-none">add</span>
                  <span>Schedule Your First Session</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-1.5 text-sm font-semibold text-slate-800">
                No matching sessions
              </h2>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                Try switching status filters or clearing your search query.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ALL');
                    setSearchTerm('');
                  }}
                  className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
          setActionSuccessNotice(
            `Session converted into task #${createdTaskId.slice(0, 8)} successfully.`,
          );
          refetch();
        }}
      />
    </div>
  );
}
