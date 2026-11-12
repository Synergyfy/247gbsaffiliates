'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import {
  DirectoryAffiliate,
  ManagedProject,
  ManagedServiceRequest,
  ManagedTask,
  Task,
  useDelegatableAgents,
  useManagedProjects,
  useManagedRequests,
  useManagedTask,
  useManagedTasks,
  useTasks,
} from '@/hooks/useTasks';
import { getActionFailureMessage, reportRequestFailure } from '@/lib/requestErrors';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';

const getErrorMessage = (err: unknown, fallback: string): string => {
  reportRequestFailure('AccountManagerWorkspace action', err);
  return getActionFailureMessage(err, fallback);
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

function formatRelativeTime(dateString?: string | null) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

const statusStyles: Record<string, string> = {
  OPEN: 'bg-sky-50 text-sky-800 border-sky-200',
  PENDING: 'bg-slate-100 text-slate-700 border-slate-200',
  ASSIGNED: 'bg-blue-50 text-blue-800 border-blue-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  SUBMITTED: 'bg-amber-50 text-amber-800 border-amber-200',
  PENDING_BUSINESS_APPROVAL: 'bg-violet-50 text-violet-800 border-violet-200',
  REVISION_REQUESTED: 'bg-orange-50 text-orange-800 border-orange-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CLOSED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  ACTIVE: 'bg-blue-50 text-blue-800 border-blue-200',
  PLANNING: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  DECLINED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
};

function label(status?: string | null) {
  return (status || '').replaceAll('_', ' ').toLowerCase();
}

const ASSIGNABLE_TASK_STATUSES = new Set([
  'OPEN',
  'PENDING',
  'UNASSIGNED',
  'ASSIGNED',
  'DECLINED',
  'REVISION_REQUESTED',
]);

function getAssigneeDisplay(task: ManagedTask): string | null {
  if (task.assignedAgentName && task.assignedAgentEmail) {
    return `${task.assignedAgentName} (${task.assignedAgentEmail})`;
  }
  if (task.assignedAgentName) return task.assignedAgentName;
  if (task.assignee) {
    const fullName = [task.assignee.firstName, task.assignee.lastName].filter(Boolean).join(' ').trim();
    const displayName = task.assignee.name || fullName;
    if (displayName && task.assignee.email) return `${displayName} (${task.assignee.email})`;
    if (displayName) return displayName;
    if (task.assignee.email) return task.assignee.email;
  }
  if (task.assignedAgentEmail) return task.assignedAgentEmail;
  if (task.assigneeUserId) return `Affiliate ID: ${task.assigneeUserId}`;
  return null;
}

function Submission({ task }: { task: ManagedTask }) {
  const submission = task.submissionData;
  if (!submission) {
    return <p className="text-xs text-slate-500">No submission has been provided yet.</p>;
  }
  return (
    <div className="space-y-2 text-xs text-slate-700">
      {submission.notes ? <p className="whitespace-pre-wrap leading-5">{submission.notes}</p> : null}
      {submission.links?.length ? (
        <ul className="space-y-1">
          {submission.links.map((link) => (
            <li key={link}>
              <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                {link}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {submission.attachments?.length ? (
        <div className="flex flex-wrap gap-2">
          {submission.attachments.map((attachment) => (
            <a
              key={attachment.url}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-blue-700 hover:bg-blue-50"
            >
              <span className="material-symbols-outlined text-sm">description</span>
              {attachment.fileName || 'Attachment'}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FieldHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const hintRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (hintRef.current && !hintRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <span ref={hintRef} className="relative ml-1 inline-flex items-center align-middle">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        aria-label={text}
        className={`inline-flex size-3.5 items-center justify-center rounded-full border text-[9px] font-bold leading-none transition-colors focus:outline-none ${
          open
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-700'
        }`}
      >
        ?
      </button>
      {open ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-44 -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-1.5 text-left text-[10px] font-normal normal-case tracking-normal leading-snug text-white shadow-md"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

function AffiliateAssigneePicker({
  affiliates,
  isLoadingAffiliates,
  isErrorAffiliates,
  onRefetchAffiliates,
  requiredSkills,
  selectedAssigneeId,
  onSelectAssigneeId,
  emptyOptionLabel = 'Leave unassigned for now',
}: {
  affiliates: DirectoryAffiliate[];
  isLoadingAffiliates: boolean;
  isErrorAffiliates: boolean;
  onRefetchAffiliates: () => void;
  requiredSkills?: string[];
  selectedAssigneeId: string;
  onSelectAssigneeId: (assigneeId: string, affiliate: DirectoryAffiliate | null) => void;
  emptyOptionLabel?: string;
}) {
  const [roleFilter, setRoleFilter] = useState<'all' | 'agent' | 'consultant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const requiredSkillsLower = useMemo(
    () => new Set((requiredSkills ?? []).map((skill) => skill.toLowerCase())),
    [requiredSkills],
  );

  const filteredAffiliates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return affiliates
      .filter((affiliate) => {
        const normalizedRole = (affiliate.role || '').toLowerCase().replace('-', '_');
        if (roleFilter !== 'all' && normalizedRole !== roleFilter) return false;
        if (!query) return true;
        const haystack = [
          affiliate.name,
          affiliate.email,
          affiliate.role,
          affiliate.city,
          affiliate.region,
          affiliate.postcode,
          ...(affiliate.skills ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        if (requiredSkillsLower.size === 0) return a.name.localeCompare(b.name);
        const aMatches = (a.skills ?? []).filter((s) => requiredSkillsLower.has(s.toLowerCase())).length;
        const bMatches = (b.skills ?? []).filter((s) => requiredSkillsLower.has(s.toLowerCase())).length;
        if (bMatches !== aMatches) return bMatches - aMatches;
        return a.name.localeCompare(b.name);
      });
  }, [affiliates, roleFilter, searchQuery, requiredSkillsLower]);

  const selectedAffiliate = useMemo(
    () =>
      affiliates.find(
        (affiliate) =>
          (affiliate.mcomUserId || affiliate.centralUserId || affiliate.id) === selectedAssigneeId,
      ) ?? null,
    [affiliates, selectedAssigneeId],
  );

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Header row: Label on left, compact Role filter pills on right */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-700">
          Eligible affiliates ({filteredAffiliates.length})
          <FieldHint text="Click to browse all verified affiliates, or type a name, skill, city, or email to narrow down" />
        </span>

        <div className="inline-flex items-center rounded-md border border-slate-200 bg-white p-0.5 text-[10px] font-semibold">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'agent', label: 'Agents' },
              { id: 'consultant', label: 'Consultants' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setRoleFilter(tab.id);
                setIsOpen(true);
              }}
              className={`rounded px-2 py-0.5 transition-colors ${
                roleFilter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoadingAffiliates ? (
        <p className="text-xs text-slate-500">Loading verified affiliates from directory…</p>
      ) : isErrorAffiliates ? (
        <RequestErrorState
          area="Affiliate directory"
          label="Affiliate directory"
          error={null}
          onRetry={onRefetchAffiliates}
          supportHref="/dashboard/account-manager/messages"
        />
      ) : (
        <div className="relative">
          {/* Merged Search + Select Combobox Trigger */}
          <div className="relative flex items-center">
            <span
              className="material-symbols-outlined pointer-events-none absolute left-2.5 !text-sm text-slate-400"
              aria-hidden="true"
            >
              search
            </span>
            <input
              type="text"
              value={
                isOpen
                  ? searchQuery
                  : selectedAffiliate
                    ? `${selectedAffiliate.name} (${(selectedAffiliate.role || 'agent').replace('_', ' ').toUpperCase()}${selectedAffiliate.city ? ` · ${selectedAffiliate.city}` : ''})`
                    : searchQuery
              }
              onFocus={() => setIsOpen(true)}
              onClick={() => setIsOpen(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsOpen(true);
              }}
              placeholder="Click to browse or type name, skill, city, email…"
              aria-expanded={isOpen}
              aria-label="Search or select eligible affiliate"
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-14 pl-8 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
            <div className="absolute right-1.5 flex items-center gap-0.5">
              {(selectedAssigneeId || searchQuery) && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSearchQuery('');
                    onSelectAssigneeId('', null);
                    setIsOpen(false);
                  }}
                  aria-label="Clear selected affiliate"
                  className="inline-flex size-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined !text-sm leading-none">close</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close affiliate list' : 'Open affiliate list'}
                className="inline-flex size-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined !text-base leading-none">
                  {isOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>
          </div>

          {/* Dropdown List — opens on focus/click and filters live as user types */}
          {isOpen && (
            <div
              role="listbox"
              className="custom-scrollbar mt-1 max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-lg"
            >
              <button
                type="button"
                role="option"
                aria-selected={!selectedAssigneeId}
                onClick={() => {
                  onSelectAssigneeId('', null);
                  setSearchQuery('');
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${
                  !selectedAssigneeId ? 'bg-slate-50 font-semibold text-slate-800' : 'text-slate-500'
                }`}
              >
                <span>{emptyOptionLabel}</span>
                {!selectedAssigneeId && (
                  <span className="material-symbols-outlined !text-sm text-blue-600">check</span>
                )}
              </button>

              {filteredAffiliates.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-slate-500">
                  No matching affiliates found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredAffiliates.map((affiliate) => {
                  const assigneeId = affiliate.mcomUserId || affiliate.centralUserId || affiliate.id;
                  const isSelected = assigneeId === selectedAssigneeId;
                  const roleLabel = (affiliate.role || 'agent').replace('_', ' ').toUpperCase();
                  const matchingSkillCount = (affiliate.skills ?? []).filter((s) =>
                    requiredSkillsLower.has(s.toLowerCase()),
                  ).length;

                  return (
                    <button
                      key={affiliate.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelectAssigneeId(assigneeId, affiliate);
                        setSearchQuery('');
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-start justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-blue-50/50 ${
                        isSelected ? 'bg-blue-50/80' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-xs font-bold text-slate-900">
                            {affiliate.name}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-700">
                            {roleLabel}
                          </span>
                          {affiliate.city ? (
                            <span className="text-[11px] text-slate-500">· {affiliate.city}</span>
                          ) : null}
                          {matchingSkillCount > 0 ? (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                              {matchingSkillCount} skill match
                            </span>
                          ) : null}
                          {affiliate.activeTasksCount != null ? (
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">
                              {affiliate.activeTasksCount} active
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {affiliate.email}
                          {affiliate.skills?.length
                            ? ` · ${affiliate.skills.slice(0, 3).join(', ')}`
                            : ''}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="material-symbols-outlined shrink-0 !text-sm text-blue-600">
                          check
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {selectedAffiliate && !isOpen ? (
        <div className="rounded-lg border border-blue-100 bg-white px-2.5 py-2 text-[11px] text-slate-600">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-900">
              {selectedAffiliate.name} ·{' '}
              <span className="uppercase text-blue-700">{selectedAffiliate.role}</span>
            </span>
            {selectedAffiliate.hourlyRate != null ? (
              <span className="font-semibold text-slate-700">
                {selectedAffiliate.currency || 'GBP'} {selectedAffiliate.hourlyRate}/hr
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-slate-500">
            {selectedAffiliate.email}
            {selectedAffiliate.city ? ` · ${selectedAffiliate.city}` : ''}
            {selectedAffiliate.postcode ? ` (${selectedAffiliate.postcode})` : ''}
          </p>
          {selectedAffiliate.skills?.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {selectedAffiliate.skills.map((skill) => (
                <span
                  key={skill}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    requiredSkillsLower.has(skill.toLowerCase())
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TaskDelegationPanel({
  task,
  affiliates,
  isLoadingAffiliates,
  isErrorAffiliates,
  onRefetchAffiliates,
}: {
  task: ManagedTask;
  affiliates: DirectoryAffiliate[];
  isLoadingAffiliates: boolean;
  isErrorAffiliates: boolean;
  onRefetchAffiliates: () => void;
}) {
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<DirectoryAffiliate | null>(null);
  const [assignmentNote, setAssignmentNote] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const { assignTask, isAssigningTask } = useManagedTasks({}, false);

  const currentAssignee = getAssigneeDisplay(task);
  const canDelegate =
    !task.status ||
    ASSIGNABLE_TASK_STATUSES.has(task.status.toUpperCase()) ||
    (!task.assigneeUserId && !task.assignedAgentEmail);

  const handleAssign = async () => {
    const targetId = selectedAssigneeId.trim();
    if (!targetId || isAssigningTask) return;
    setAssignError('');
    setAssignSuccess('');
    try {
      await assignTask({
        taskId: task.id,
        assigneeUserId: targetId,
        note: assignmentNote.trim() || undefined,
      });
      const targetLabel = selectedAffiliate
        ? `${selectedAffiliate.name}${selectedAffiliate.email ? ` (${selectedAffiliate.email})` : ''}`
        : targetId;
      setAssignSuccess(`Task delegated to ${targetLabel}.`);
      setAssignmentNote('');
    } catch (err: unknown) {
      setAssignError(
        getErrorMessage(err, 'Could not assign the task to the selected affiliate. Please try again.'),
      );
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Task delegation & assignment
          </p>
          <p className="mt-0.5 text-xs text-slate-700">
            <span className="font-semibold text-slate-900">Current assignee:</span>{' '}
            {currentAssignee ? (
              <span className="font-semibold text-blue-800">{currentAssignee}</span>
            ) : (
              <span className="italic text-amber-800">Unassigned — ready for delegation</span>
            )}
          </p>
        </div>
        {task.requiredSkills?.length ? (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-semibold text-slate-500">Required skills:</span>
            {task.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="rounded bg-blue-100/80 px-1.5 py-0.5 text-[10px] font-bold text-blue-900"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {canDelegate ? (
        <div className="mt-3 space-y-2.5 border-t border-slate-200/80 pt-3">
          <AffiliateAssigneePicker
            affiliates={affiliates}
            isLoadingAffiliates={isLoadingAffiliates}
            isErrorAffiliates={isErrorAffiliates}
            onRefetchAffiliates={onRefetchAffiliates}
            requiredSkills={task.requiredSkills}
            selectedAssigneeId={selectedAssigneeId}
            onSelectAssigneeId={(nextId, match) => {
              setSelectedAssigneeId(nextId);
              setSelectedAffiliate(match);
            }}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex-1 text-[11px] font-semibold text-slate-700">
              Assignment instructions / handover note
              <input
                type="text"
                value={assignmentNote}
                onChange={(event) => setAssignmentNote(event.target.value)}
                maxLength={1000}
                placeholder="Brief context or SLA expectations for the assignee…"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-800"
              />
            </label>
            <button
              type="button"
              onClick={() => void handleAssign()}
              disabled={isAssigningTask || !selectedAssigneeId}
              className="min-h-9 shrink-0 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {isAssigningTask
                ? 'Assigning…'
                : currentAssignee
                  ? 'Reassign affiliate'
                  : 'Assign affiliate'}
            </button>
          </div>

          {assignError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
              {assignError}
            </p>
          ) : null}
          {assignSuccess ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
              {assignSuccess}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-slate-500">
          This task is currently <strong>{label(task.status)}</strong> and locked from reassignment.
        </p>
      )}
    </div>
  );
}

function TaskRow({
  task,
  affiliates,
  isLoadingAffiliates,
  isErrorAffiliates,
  onRefetchAffiliates,
}: {
  task: ManagedTask;
  affiliates: DirectoryAffiliate[];
  isLoadingAffiliates: boolean;
  isErrorAffiliates: boolean;
  onRefetchAffiliates: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { reviewTask, isReviewing } = useManagedTasks({}, false);
  const { data: detailedTask, isLoading: isLoadingDetail } = useManagedTask(task.id, open);

  const effectiveTask = detailedTask ?? task;
  const assigneeDisplay = getAssigneeDisplay(effectiveTask);

  const decide = async (decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    setError('');
    setMessage('');
    try {
      await reviewTask({ taskId: task.id, decision, notes: notes.trim() || undefined });
      setMessage(
        decision === 'APPROVED'
          ? effectiveTask.requiresBusinessApproval
            ? 'Forwarded to the business owner for approval.'
            : 'Approved and completed. Payment has been recorded where applicable.'
          : 'Changes requested — the affiliate will be notified.',
      );
      setNotes('');
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, 'The review could not be recorded. Please try again.'),
      );
    }
  };

  const canReview = effectiveTask.status === 'SUBMITTED';

  return (
    <article className="group rounded-xl border border-slate-200/90 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 hover:shadow-sm sm:p-3.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-2 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">{effectiveTask.title}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyles[effectiveTask.status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              {label(effectiveTask.status)}
            </span>
            {assigneeDisplay ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                Assignee: {assigneeDisplay}
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                Unassigned
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{effectiveTask.business?.businessName || 'Business'}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            {effectiveTask.project?.title ? `${effectiveTask.project.title} · ` : ''}
            Due {formatDate(effectiveTask.dueAt)}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors group-hover:bg-slate-100 group-hover:text-slate-700"
        >
          <span className="material-symbols-outlined !text-base leading-none">
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3.5 border-t border-slate-100 pt-3">
          {isLoadingDetail ? (
            <p className="text-[11px] text-slate-400">Syncing latest task details…</p>
          ) : null}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Task scope</p>
            <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">{effectiveTask.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-600">
              <span className="rounded bg-indigo-50 px-2 py-1 capitalize text-indigo-800">{effectiveTask.category || 'external'}</span>
              {(effectiveTask.platforms ?? []).map((platform) => (
                <span key={platform} className="rounded bg-blue-50 px-2 py-1 capitalize text-blue-800">{platform}</span>
              ))}
              {effectiveTask.compensationPence != null && effectiveTask.compensationPence > 0 ? (
                <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-800">
                  Compensation: {effectiveTask.compensationCurrency || 'GBP'}{' '}
                  {(effectiveTask.compensationPence / 100).toFixed(2)}
                  {effectiveTask.paymentStatus ? ` (${label(effectiveTask.paymentStatus)})` : ''}
                </span>
              ) : null}
              {effectiveTask.businessChargePence != null && effectiveTask.businessChargePence > 0 ? (
                <span className="rounded bg-sky-50 px-2 py-1 text-sky-800">
                  Business charge: {effectiveTask.businessChargeCurrency || effectiveTask.compensationCurrency || 'GBP'}{' '}
                  {(effectiveTask.businessChargePence / 100).toFixed(2)}
                  {effectiveTask.chargeApprovedAt ? ' (approved)' : effectiveTask.chargeApprovalRequired ? ' (awaiting approval)' : ''}
                </span>
              ) : null}
            </div>
          </div>

          {effectiveTask.prerequisiteTask ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Prerequisite task:</span>{' '}
              {effectiveTask.prerequisiteTask.title}{' '}
              <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                {label(effectiveTask.prerequisiteTask.status)}
              </span>
            </div>
          ) : null}

          {effectiveTask.deliverables?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deliverables</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
                {effectiveTask.deliverables.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : null}

          <TaskDelegationPanel
            task={effectiveTask}
            affiliates={affiliates}
            isLoadingAffiliates={isLoadingAffiliates}
            isErrorAffiliates={isErrorAffiliates}
            onRefetchAffiliates={onRefetchAffiliates}
          />

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Submission</p>
            <div className="mt-1 rounded-lg bg-slate-50 p-3">
              <Submission task={effectiveTask} />
            </div>
          </div>

          {effectiveTask.reviews?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Review history</p>
              <ul className="mt-1 space-y-1.5">
                {effectiveTask.reviews.map((review) => (
                  <li key={review.id} className="rounded-lg border border-slate-100 bg-white p-2 text-xs">
                    <span className="font-semibold text-slate-800">
                      {review.stage || 'REVIEW'} · round {review.round} · {label(review.decision)}
                    </span>
                    {review.notes ? <p className="mt-0.5 text-slate-600">{review.notes}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {effectiveTask.events?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audit trail</p>
              <ul className="mt-1 space-y-1">
                {effectiveTask.events.slice(0, 6).map((evt) => (
                  <li key={evt.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-100 bg-slate-50/70 px-2.5 py-1 text-[11px] text-slate-600">
                    <span>
                      <strong className="font-semibold text-slate-800">{label(evt.type)}</strong>
                      {evt.actorRole ? ` (${label(evt.actorRole)})` : ''}
                      {evt.message ? ` · ${evt.message}` : ''}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(evt.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {canReview && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Review notes <span className="font-normal text-slate-500">(required when requesting changes)</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  maxLength={5000}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="What should the affiliate know before this goes to the business?"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void decide('APPROVED')}
                  disabled={isReviewing}
                  className="min-h-10 rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isReviewing ? 'Saving…' : 'Approve & forward'}
                </button>
                <button
                  type="button"
                  onClick={() => void decide('CHANGES_REQUESTED')}
                  disabled={isReviewing || !notes.trim()}
                  className="min-h-10 rounded-lg border border-orange-300 bg-orange-50 px-4 text-xs font-bold text-orange-900 hover:bg-orange-100 disabled:opacity-50"
                >
                  Request changes
                </button>
              </div>
            </div>
          )}

          {effectiveTask.status === 'PENDING_BUSINESS_APPROVAL' && (
            <p className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
              Checked by you and now waiting for the business owner to approve the outcome.
            </p>
          )}

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">{error}</p> : null}
          {message ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">{message}</p> : null}
        </div>
      )}
    </article>
  );
}

function ProjectRow({
  project,
  projectTasks,
  isErrorTasks,
  tasksError,
  onRetryTasks,
  affiliates,
  isLoadingAffiliates,
  isErrorAffiliates,
  onRefetchAffiliates,
  autoOpen = false,
  onAutoOpenHandled,
}: {
  project: ManagedProject;
  projectTasks: ManagedTask[];
  isErrorTasks: boolean;
  tasksError: unknown;
  onRetryTasks: () => void;
  affiliates: DirectoryAffiliate[];
  isLoadingAffiliates: boolean;
  isErrorAffiliates: boolean;
  onRefetchAffiliates: () => void;
  autoOpen?: boolean;
  onAutoOpenHandled?: () => void;
}) {
  const [open, setOpen] = useState(autoOpen);
  const [collapsed, setCollapsed] = useState(true);
  const [scopeExpanded, setScopeExpanded] = useState(false);

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
      onAutoOpenHandled?.();
    }
  }, [autoOpen, onAutoOpenHandled]);
  const [objectiveExpanded, setObjectiveExpanded] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showOptionalTaskFields, setShowOptionalTaskFields] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState<'EXTERNAL' | 'INTERNAL'>('EXTERNAL');
  const [taskRequiredSkills, setTaskRequiredSkills] = useState('');
  const [taskDeliverables, setTaskDeliverables] = useState('');
  const [taskMaterials, setTaskMaterials] = useState('');
  const [taskDueAt, setTaskDueAt] = useState(
    project.dueAt ? project.dueAt.slice(0, 10) : '',
  );
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskSelectedAffiliate, setTaskSelectedAffiliate] = useState<DirectoryAffiliate | null>(null);
  const [taskPrerequisiteId, setTaskPrerequisiteId] = useState('');
  const [taskRequiresApproval, setTaskRequiresApproval] = useState(true);
  const [taskCreateError, setTaskCreateError] = useState('');
  const [taskCreateSuccess, setTaskCreateSuccess] = useState('');
  const [localCreatedTasks, setLocalCreatedTasks] = useState<ManagedTask[]>([]);

  const [outcomeSummary, setOutcomeSummary] = useState(project.outcomeSummary || '');
  const [followUpNotes, setFollowUpNotes] = useState(project.followUpNotes || '');
  const [closeError, setCloseError] = useState('');
  const [closeFeedback, setCloseFeedback] = useState('');
  const {
    createProjectTask,
    isCreatingProjectTask,
    closeProject,
    isClosingProject,
  } = useManagedProjects({}, false);

  const normalizedStatus = (project.status || 'ACTIVE').toUpperCase();
  const isClosed = ['COMPLETED', 'CLOSED', 'CANCELLED'].includes(normalizedStatus);

  const parsedRequiredSkills = useMemo(
    () =>
      taskRequiredSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
    [taskRequiredSkills],
  );

  const mergedTasks = useMemo(() => {
    const byId = new Map<string, ManagedTask>();
    for (const item of project.tasks ?? []) {
      if (item?.id) byId.set(item.id, item);
    }
    for (const item of projectTasks) {
      if (item?.id) byId.set(item.id, item);
    }
    for (const item of localCreatedTasks) {
      if (item?.id && item.id !== project.id && !byId.has(item.id)) byId.set(item.id, item);
    }
    return Array.from(byId.values());
  }, [project.id, project.tasks, projectTasks, localCreatedTasks]);

  const completedTasksCount = mergedTasks.filter(
    (t) => (t.status || '').toUpperCase() === 'COMPLETED',
  ).length;
  const unassignedTasksCount = mergedTasks.filter((t) => !getAssigneeDisplay(t)).length;

  const handleCreateProjectTask = async () => {
    const trimmedTitle = taskTitle.trim();
    const trimmedDescription = taskDescription.trim();
    if (trimmedTitle.length < 3) {
      setTaskCreateError('Task title must be at least 3 characters.');
      return;
    }
    if (trimmedDescription.length < 5) {
      setTaskCreateError('Task description must be at least 5 characters.');
      return;
    }
    if (isCreatingProjectTask) return;

    setTaskCreateError('');
    setTaskCreateSuccess('');
    try {
      const created = await createProjectTask({
        projectId: project.id,
        title: trimmedTitle,
        description: trimmedDescription,
        category: taskCategory,
        requiredSkills: parsedRequiredSkills.length ? parsedRequiredSkills : undefined,
        deliverables: taskDeliverables.trim() || undefined,
        materials: taskMaterials.trim() || undefined,
        dueAt: taskDueAt ? new Date(taskDueAt).toISOString() : undefined,
        assigneeUserId: taskAssigneeId.trim() || undefined,
        prerequisiteTaskId: taskPrerequisiteId || undefined,
        requiresBusinessApproval: taskRequiresApproval,
      });

      if (created?.id) {
        setLocalCreatedTasks((prev) => [...prev.filter((item) => item.id !== created.id), created]);
      }

      const assignedLabel = taskSelectedAffiliate
        ? ` and assigned to ${taskSelectedAffiliate.name}`
        : '';
      setTaskCreateSuccess(`Task "${trimmedTitle}" created under "${project.title}"${assignedLabel}.`);
      setTaskTitle('');
      setTaskDescription('');
      setTaskRequiredSkills('');
      setTaskDeliverables('');
      setTaskMaterials('');
      setTaskAssigneeId('');
      setTaskSelectedAffiliate(null);
      setTaskPrerequisiteId('');
      setShowOptionalTaskFields(false);
      setShowCreateTask(false);
    } catch (err: unknown) {
      setTaskCreateError(
        getErrorMessage(err, 'Could not create task for this project. Please try again.'),
      );
    }
  };

  const handleCloseProject = async () => {
    const trimmedOutcome = outcomeSummary.trim();
    if (!trimmedOutcome || isClosingProject) return;
    setCloseError('');
    setCloseFeedback('');
    try {
      await closeProject({
        projectId: project.id,
        outcomeSummary: trimmedOutcome,
        followUpNotes: followUpNotes.trim() || undefined,
      });
      setCloseFeedback('Project closed and outcome summary recorded for the business.');
    } catch (err: unknown) {
      setCloseError(
        getErrorMessage(err, 'Could not close this project. Ensure all tasks are resolved first.'),
      );
    }
  };



  return (
    <article className="group rounded-xl border border-slate-200/90 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 hover:shadow-sm sm:p-3.5">
      <div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          className="flex w-full items-start justify-between gap-2 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">{project.title}</h3>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${
                  normalizedStatus === 'CANCELLED'
                    ? 'text-slate-500'
                    : isClosed
                      ? 'text-emerald-700'
                      : 'text-blue-700'
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    normalizedStatus === 'CANCELLED'
                      ? 'bg-slate-400'
                      : isClosed
                        ? 'bg-emerald-600'
                        : 'bg-blue-600'
                  }`}
                  aria-hidden="true"
                />
                {label(normalizedStatus)}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {completedTasksCount}/{mergedTasks.length} tasks completed
              </span>
              {unassignedTasksCount > 0 ? (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  {unassignedTasksCount} unassigned
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {project.business?.businessName || 'Business'}
              </span>
              {project.request?.title ? (
                <>
                  <span className="mx-1.5 text-slate-300">·</span>
                  <span>From request: {project.request.title}</span>
                </>
              ) : null}
              <span className="mx-1.5 text-slate-300">·</span>
              Due {formatDate(project.dueAt)}
            </p>
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
          <>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              {project.description}
            </p>

            {project.objective ? (
              <p className="mt-1.5 rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-xs text-slate-600">
                <strong className="font-semibold text-slate-800">Agreed Outcome:</strong>{' '}
                {project.objective}
              </p>
            ) : null}

            <div className="mt-2 flex items-center justify-end border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex min-h-8 w-full items-center justify-center gap-1 rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-800 sm:w-auto"
              >
                <span>Manage project</span>
                <span className="material-symbols-outlined !text-sm leading-none">arrow_forward</span>
              </button>
            </div>
          </>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-0 sm:p-6 backdrop-blur-xs">
          <div className="relative flex h-full h-[100dvh] sm:h-auto sm:max-h-[92vh] w-full sm:max-w-4xl flex-col overflow-hidden rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 bg-white shadow-2xl">
            {/* Compact Header */}
            <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-200 bg-white px-3.5 py-2.5 sm:px-6 sm:py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                    Manage Project
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${
                      normalizedStatus === 'CANCELLED'
                        ? 'text-slate-500'
                        : isClosed
                          ? 'text-emerald-700'
                          : 'text-blue-700'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        normalizedStatus === 'CANCELLED'
                          ? 'bg-slate-400'
                          : isClosed
                            ? 'bg-emerald-600'
                            : 'bg-blue-600'
                      }`}
                      aria-hidden="true"
                    />
                    {label(normalizedStatus)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {completedTasksCount}/{mergedTasks.length} completed
                  </span>
                  {unassignedTasksCount > 0 ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      {unassignedTasksCount} unassigned
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-0.5 truncate text-sm font-bold text-slate-950 sm:mt-1 sm:text-lg">
                  {project.title}
                </h2>
                <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">
                  <span className="font-semibold text-slate-700">
                    {project.business?.businessName || 'Business'}
                  </span>
                  <span className="mx-1.5">·</span>
                  <span>Due {formatDate(project.dueAt)}</span>
                  {project.request?.title ? (
                    <>
                      <span className="mx-1.5">·</span>
                      <span>From request: {project.request.title}</span>
                    </>
                  ) : null}
                </p>
              </div>

              {/* Clean frameless X button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 p-0.5 leading-none text-slate-400 transition-colors hover:text-slate-800 sm:p-1"
              >
                <span className="material-symbols-outlined !text-xl font-light sm:!text-2xl">close</span>
              </button>
            </div>

            {/* Scrollable Contents divided into 3 clear visual zones */}
            <div className="custom-scrollbar divide-y divide-slate-200 overflow-y-auto">
              {/* Zone 1: Project Context Brief (subtle tinted background so reference info recedes) */}
              <div className="divide-y divide-slate-200/80 bg-slate-50/70 px-3.5 sm:px-6">
                {/* Collapsible Project Scope */}
                <div className="py-2.5 sm:py-3.5">
                  <button
                    type="button"
                    onClick={() => setScopeExpanded((prev) => !prev)}
                    aria-expanded={scopeExpanded}
                    className="flex w-full items-center justify-between gap-2 text-left sm:pointer-events-none"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Project scope
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-700 sm:hidden">
                      <span>{scopeExpanded ? 'Less' : 'Read full scope'}</span>
                      <span className="material-symbols-outlined !text-sm leading-none">
                        {scopeExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </span>
                  </button>
                  <p
                    className={`mt-1 text-xs leading-relaxed text-slate-700 sm:mt-1.5 sm:whitespace-pre-wrap sm:text-sm ${
                      scopeExpanded ? 'whitespace-pre-wrap' : 'line-clamp-1 sm:line-clamp-none'
                    }`}
                  >
                    {project.description}
                  </p>
                </div>

                {/* Collapsible Agreed Objective & Timeline */}
                <div className="py-2.5 sm:py-3.5">
                  <button
                    type="button"
                    onClick={() => setObjectiveExpanded((prev) => !prev)}
                    aria-expanded={objectiveExpanded}
                    className="flex w-full items-center justify-between gap-2 text-left sm:pointer-events-none"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Agreed objective & timeline
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-700 sm:hidden">
                      <span>{objectiveExpanded ? 'Less' : 'Details'}</span>
                      <span className="material-symbols-outlined !text-sm leading-none">
                        {objectiveExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </span>
                  </button>
                  <p
                    className={`mt-1 text-xs leading-relaxed text-slate-700 sm:mt-1.5 sm:whitespace-pre-wrap sm:text-sm ${
                      objectiveExpanded ? 'whitespace-pre-wrap' : 'line-clamp-1 sm:line-clamp-none'
                    }`}
                  >
                    {project.objective || 'No specific objective text recorded.'}
                  </p>
                  <p
                    className={`pt-1 text-[11px] text-slate-500 sm:text-xs ${
                      objectiveExpanded ? 'block' : 'hidden sm:block'
                    }`}
                  >
                    Created {formatDate(project.createdAt)} · Due {formatDate(project.dueAt)}
                    {project.closedAt ? ` · Closed ${formatDate(project.closedAt)}` : ''}
                  </p>
                </div>
              </div>

              {/* Zone 2: Primary Workspace — Tasks & Delegation */}
              <div className="space-y-3 bg-white px-3.5 py-4 sm:space-y-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Project tasks & delegation ({mergedTasks.length})
                  </p>
                  {!isClosed ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateTask(true);
                        setTaskCreateError('');
                      }}
                      className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg bg-blue-700 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-blue-800 sm:px-3 sm:py-1.5"
                    >
                      <span className="material-symbols-outlined !text-sm leading-none">add</span>
                      <span>Create Task</span>
                    </button>
                  ) : null}
                </div>

                {taskCreateSuccess ? (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
                    {taskCreateSuccess}
                  </p>
                ) : null}

                {isErrorTasks ? (
                  <RequestErrorState
                    area="AccountManager project tasks"
                    label="Project tasks"
                    error={tasksError}
                    onRetry={onRetryTasks}
                  />
                ) : mergedTasks.length > 0 ? (
                  <div className="space-y-2.5">
                    {mergedTasks.map((projectTask) => (
                      <TaskRow
                        key={projectTask.id}
                        task={{
                          ...projectTask,
                          project: projectTask.project ?? {
                            id: project.id,
                            title: project.title,
                            status: project.status,
                          },
                          business: projectTask.business ?? project.business ?? null,
                        }}
                        affiliates={affiliates}
                        isLoadingAffiliates={isLoadingAffiliates}
                        isErrorAffiliates={isErrorAffiliates}
                        onRefetchAffiliates={onRefetchAffiliates}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center sm:py-8">
                    <span className="material-symbols-outlined text-3xl text-slate-300 sm:text-4xl" aria-hidden="true">
                      checklist
                    </span>
                    <p className="mt-1.5 text-xs font-semibold text-slate-700 sm:mt-2 sm:text-sm">
                      No tasks linked to this project yet
                    </p>
                  </div>
                )}
              </div>

              {/* Zone 3: Close Project */}
              <div className="bg-slate-50/40 px-3.5 py-4 sm:px-6 sm:py-5">
                {isClosed ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950">
                    <p className="font-bold">
                      Project closed {project.closedAt ? `on ${formatDate(project.closedAt)}` : ''}
                    </p>
                    {project.outcomeSummary ? (
                      <p className="mt-1.5 whitespace-pre-wrap">
                        <strong>Outcome summary:</strong> {project.outcomeSummary}
                      </p>
                    ) : null}
                    {project.followUpNotes ? (
                      <p className="mt-1.5 whitespace-pre-wrap text-emerald-800">
                        <strong>Follow-up notes:</strong> {project.followUpNotes}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Close project & deliver outcome summary
                    </p>
                    <label className="block text-xs font-semibold text-slate-700">
                      Outcome summary <span className="text-rose-600">*</span>
                      <FieldHint text="Required to close the project and shared with the business owner" />
                      <textarea
                        value={outcomeSummary}
                        onChange={(event) => setOutcomeSummary(event.target.value)}
                        rows={3}
                        maxLength={5000}
                        placeholder="Summarize the completed deliverables and business impact…"
                        className="mt-1.5 min-h-[80px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none custom-scrollbar"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-slate-700">
                      Follow-up notes / recommendations
                      <textarea
                        value={followUpNotes}
                        onChange={(event) => setFollowUpNotes(event.target.value)}
                        rows={2}
                        maxLength={5000}
                        placeholder="Recommended next steps or maintenance notes for the business…"
                        className="mt-1.5 min-h-[64px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none custom-scrollbar"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void handleCloseProject()}
                      disabled={isClosingProject || !outcomeSummary.trim()}
                      className="min-h-9 rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {isClosingProject ? 'Closing project…' : 'Close project'}
                    </button>
                    {closeError ? (
                      <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                        {closeError}
                      </p>
                    ) : null}
                    {closeFeedback ? (
                      <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                        {closeFeedback}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dedicated Create Task Popup — Bottom Sheet on Mobile, Centered Dialog on Desktop */}
          {showCreateTask && !isClosed && (
            <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-2xs sm:items-center sm:p-4">
              <div className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl">
                {/* Mobile drag handle */}
                <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-slate-300 sm:hidden" />

                {/* Pinned Header */}
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-3.5 py-2.5 sm:px-5 sm:py-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-950">Create Project Task</h3>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      For <span className="font-semibold text-slate-700">{project.title}</span>
                      {project.business?.businessName
                        ? ` · ${project.business.businessName}`
                        : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTask(false);
                      setTaskCreateError('');
                    }}
                    aria-label="Close create task dialog"
                    className="shrink-0 rounded-lg p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <span className="material-symbols-outlined !text-lg leading-none">close</span>
                  </button>
                </div>

                {/* Scrollable Form Body — Single outer gutter, zero nested cards */}
                <div className="custom-scrollbar divide-y divide-slate-200 overflow-y-auto">
                  {/* Section 1: Task Scope */}
                  <div className="space-y-3 px-3.5 py-3 sm:px-5 sm:py-3.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      Task title <span className="text-rose-600">*</span>
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={(event) => setTaskTitle(event.target.value)}
                        maxLength={180}
                        placeholder="e.g. Visit 10 retail shops in Wuse & collect customer feedback"
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </label>

                    <label className="block text-xs font-semibold text-slate-800">
                      Instructions & deliverables <span className="text-rose-600">*</span>
                      <textarea
                        value={taskDescription}
                        onChange={(event) => setTaskDescription(event.target.value)}
                        rows={2}
                        maxLength={5000}
                        placeholder="Describe what the agent or consultant needs to execute and submit…"
                        className="mt-1 min-h-[68px] w-full resize-y rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-normal leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none custom-scrollbar"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      <label className="block text-xs font-semibold text-slate-800">
                        Category
                        <select
                          value={taskCategory}
                          onChange={(event) =>
                            setTaskCategory(event.target.value as 'EXTERNAL' | 'INTERNAL')
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        >
                          <option value="EXTERNAL">External / field</option>
                          <option value="INTERNAL">Internal / platform</option>
                        </select>
                      </label>

                      <label className="block text-xs font-semibold text-slate-800">
                        Due date
                        <input
                          type="date"
                          value={taskDueAt}
                          onChange={(event) => setTaskDueAt(event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </label>

                      <label className="col-span-2 block text-xs font-semibold text-slate-800 sm:col-span-1">
                        Required skills
                        <FieldHint text="Separate multiple skills with commas (e.g. Field Sales, Survey)" />
                        <input
                          type="text"
                          value={taskRequiredSkills}
                          onChange={(event) => setTaskRequiredSkills(event.target.value)}
                          placeholder="Field Sales, Survey"
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-900 focus:border-blue-600 focus:outline-none"
                        />
                      </label>
                    </div>

                    {/* Progressive disclosure for optional deliverables/materials/prerequisite */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowOptionalTaskFields((prev) => !prev)}
                        aria-expanded={showOptionalTaskFields}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800"
                      >
                        <span className="material-symbols-outlined !text-sm leading-none">
                          {showOptionalTaskFields ? 'expand_less' : 'add'}
                        </span>
                        <span>
                          {showOptionalTaskFields
                            ? 'Hide deliverables & materials'
                            : 'Add deliverables, materials or prerequisite task'}
                        </span>
                      </button>

                      {showOptionalTaskFields && (
                        <div className="mt-2.5 space-y-2.5 border-t border-slate-100 pt-2.5">
                          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            <label className="block text-xs font-semibold text-slate-800">
                              Deliverables
                              <textarea
                                value={taskDeliverables}
                                onChange={(event) => setTaskDeliverables(event.target.value)}
                                rows={2}
                                maxLength={4000}
                                placeholder="e.g. Photo proof + completed feedback sheet"
                                className="mt-1 min-h-[56px] w-full resize-y rounded-lg border border-slate-200 bg-white p-2 text-xs font-normal text-slate-900 focus:border-blue-600 focus:outline-none custom-scrollbar"
                              />
                            </label>

                            <label className="block text-xs font-semibold text-slate-800">
                              Materials supplied
                              <textarea
                                value={taskMaterials}
                                onChange={(event) => setTaskMaterials(event.target.value)}
                                rows={2}
                                maxLength={4000}
                                placeholder="e.g. Product flyers, talking points & brand guide"
                                className="mt-1 min-h-[56px] w-full resize-y rounded-lg border border-slate-200 bg-white p-2 text-xs font-normal text-slate-900 focus:border-blue-600 focus:outline-none custom-scrollbar"
                              />
                            </label>
                          </div>

                          {mergedTasks.length > 0 ? (
                            <label className="block text-xs font-semibold text-slate-800">
                              Prerequisite task
                              <FieldHint text="Select a task that must be completed before this one can start" />
                              <select
                                value={taskPrerequisiteId}
                                onChange={(event) => setTaskPrerequisiteId(event.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                              >
                                <option value="">None — can start immediately</option>
                                {mergedTasks.map((existingTask) => (
                                  <option key={existingTask.id} value={existingTask.id}>
                                    {existingTask.title} ({label(existingTask.status)})
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 2: Agent / Consultant Assignment (Full-bleed section, no nested box) */}
                  <div className="space-y-2.5 bg-slate-50/60 px-3.5 py-3 sm:px-5 sm:py-3.5">
                    <h4 className="text-xs font-bold text-slate-900">
                      Assign to Agent or Consultant
                      <FieldHint text="Assign an eligible affiliate now, or leave unassigned to delegate later" />
                    </h4>
                    <p className="text-[11px] leading-4 text-slate-500">
                      Account Managers are not listed here because they coordinate the work.
                      Execution is assigned to an Agent or Consultant.
                    </p>

                    <AffiliateAssigneePicker
                      affiliates={affiliates}
                      isLoadingAffiliates={isLoadingAffiliates}
                      isErrorAffiliates={isErrorAffiliates}
                      onRefetchAffiliates={onRefetchAffiliates}
                      requiredSkills={parsedRequiredSkills}
                      selectedAssigneeId={taskAssigneeId}
                      onSelectAssigneeId={(nextId, match) => {
                        setTaskAssigneeId(nextId);
                        setTaskSelectedAffiliate(match);
                      }}
                      emptyOptionLabel="Leave unassigned for now (delegate later)…"
                    />

                    <label className="flex items-center gap-2 pt-0.5 text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={taskRequiresApproval}
                        onChange={(event) => setTaskRequiresApproval(event.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Business owner must approve the final delivered outcome</span>
                    </label>

                    {taskCreateError ? (
                      <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                        {taskCreateError}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Pinned Footer */}
                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white px-3.5 py-2.5 sm:px-5 sm:py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTask(false);
                      setTaskCreateError('');
                    }}
                    className="min-h-8 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCreateProjectTask()}
                    disabled={
                      isCreatingProjectTask ||
                      taskTitle.trim().length < 3 ||
                      taskDescription.trim().length < 5
                    }
                    className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
                  >
                    {isCreatingProjectTask
                      ? 'Creating task…'
                      : taskAssigneeId
                        ? 'Create & Assign Task'
                        : 'Create Task'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function RequestRow({
  request,
  onManageProject,
}: {
  request: ManagedServiceRequest;
  onManageProject: (projectId?: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showClarifyModal, setShowClarifyModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [note, setNote] = useState('');
  const [projectTitle, setProjectTitle] = useState(request.title);
  const [projectDescription, setProjectDescription] = useState(request.description);
  const [projectObjective, setProjectObjective] = useState(request.desiredOutcome || '');
  const [dueAt, setDueAt] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [quoteAmount, setQuoteAmount] = useState('');

  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const { clarify, isClarifying, quote, isQuoting, convert, isConverting } = useManagedRequests({}, false);

  const isHighPriority = request.urgency === 'HIGH' || request.urgency === 'URGENT';
  const relativeTime = formatRelativeTime(request.createdAt);

  const handleConvert = async () => {
    setError('');
    setFeedback('');
    try {
      await convert({
        requestId: request.id,
        project: {
          title: projectTitle.trim(),
          description: projectDescription.trim(),
          objective: projectObjective.trim() || undefined,
          dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
          requiresBusinessApproval: requiresApproval,
        },
      });
      setFeedback('Project created successfully. You can now delegate tasks to agents.');
      setShowConvertModal(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not convert request to project.'));
    }
  };

  const handleClarify = async () => {
    setError('');
    setFeedback('');
    if (!note.trim()) return;
    try {
      await clarify({ requestId: request.id, note: note.trim() });
      setFeedback('Clarification request sent to the business client.');
      setNote('');
      setShowClarifyModal(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not send clarification.'));
    }
  };

  const handleQuote = async () => {
    setError('');
    setFeedback('');
    const amount = Number(quoteAmount);
    if (!Number.isFinite(amount) || amount < 0) return;
    try {
      await quote({
        requestId: request.id,
        estimatedCostPence: Math.round(amount * 100),
        currency: request.currency || 'GBP',
      });
      setFeedback('Quote sent to the client for approval.');
      setQuoteAmount('');
      setShowQuoteModal(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not save quote.'));
    }
  };

  return (
    <>
      <article className="group rounded-xl border border-slate-200/90 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 hover:shadow-sm sm:p-3.5">
        <div>
          {/* Collapsible Header Row */}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-expanded={!collapsed}
            className="flex w-full items-start justify-between gap-2 text-left"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">{request.title}</h3>
                {request.project ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Project Active
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Yet to convert
                  </span>
                )}
                {request.status === 'QUOTED' ? (
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                    Quoted
                  </span>
                ) : null}
                {isHighPriority ? (
                  <span className="text-[10px] font-bold text-rose-700">High priority</span>
                ) : null}
              </div>

              {/* Client & Time */}
              <p className="mt-0.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {request.business?.businessName || 'Business Client'}
                </span>
                {relativeTime ? (
                  <>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="text-[11px] font-semibold leading-4 text-sky-700">
                      Submitted {relativeTime}
                    </span>
                  </>
                ) : null}
              </p>
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

          {/* Collapsible Body */}
          {!collapsed && (
            <>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {request.description}
              </p>

              {request.desiredOutcome ? (
                <div className="mt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowDetails((v) => !v)}
                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-700 hover:text-blue-800"
                  >
                    <span>Outcome targets</span>
                    <span className="material-symbols-outlined !text-sm leading-none">
                      {showDetails ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {showDetails && (
                    <div className="mt-1.5 rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-xs text-slate-600">
                      <strong className="font-semibold text-slate-800">Agreed Outcome:</strong>{' '}
                      {request.desiredOutcome}
                    </div>
                  )}
                </div>
              ) : null}

              {request.clarificationNote && (
                <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-xs text-amber-900">
                  <strong className="font-semibold">Clarification Sent:</strong>{' '}
                  {request.clarificationNote}
                </div>
              )}

              {request.estimatedCostPence != null ? (
                <div className="mt-1.5 rounded-lg border border-sky-200 bg-sky-50/80 p-2 text-xs text-sky-900">
                  <strong className="font-semibold">Quote sent:</strong>{' '}
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: request.currency || 'GBP',
                  }).format(request.estimatedCostPence / 100)}
                  {request.status === 'QUOTED' ? ' — awaiting business approval' : ''}
                </div>
              ) : null}

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 sm:flex sm:flex-wrap sm:justify-end">
                {request.project ? (
                  <button
                    type="button"
                    onClick={() => onManageProject(request.project?.id)}
                    className="col-span-2 inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:col-span-1"
                  >
                    <span>View Project</span>
                    <span className="material-symbols-outlined !text-sm leading-none">
                      arrow_forward
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowConvertModal(true)}
                      className="col-span-2 inline-flex min-h-8 items-center justify-center gap-1 rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-800 sm:col-span-1"
                    >
                      <span>Convert to Project</span>
                      <span className="material-symbols-outlined !text-sm leading-none">
                        arrow_forward
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowClarifyModal(true)}
                      className="inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined !text-sm leading-none">
                        chat_bubble
                      </span>
                      <span>Clarify</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQuoteModal(true)}
                      title="Provide Quote Estimate"
                      aria-label="Provide quote estimate"
                      className="inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined !text-sm leading-none">
                        payments
                      </span>
                      <span>Quote</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {feedback && (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            {feedback}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
            {error}
          </p>
        )}
      </article>

      {/* Convert to Project - Responsive Bottom Sheet (Mobile) & Modal (Desktop) */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-2xs sm:items-center sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-2xl">
            {/* Mobile drag handle */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 sm:hidden" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-950">Convert to Managed Project</h3>
                <p className="text-xs text-slate-500">Transform client brief into a trackable campaign.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800">Project Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Abuja Retail Expansion Campaign"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800">Project Scope & Deliverables</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe scope of work to be delegated to agents..."
                  className="mt-1 min-h-[110px] h-28 w-full resize-y rounded-lg border border-slate-200 pl-3 pr-2 py-2 text-xs font-medium leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none custom-scrollbar"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800">Agreed Outcome Target</label>
                <textarea
                  value={projectObjective}
                  onChange={(e) => setProjectObjective(e.target.value)}
                  rows={4}
                  placeholder="e.g. 10 stores visited, 30 leads gathered, photo proof provided"
                  className="mt-1 min-h-[110px] h-28 w-full resize-y rounded-lg border border-slate-200 pl-3 pr-2 py-2 text-xs font-medium leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none custom-scrollbar"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-800">Target Due Date</label>
                  <input
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 pt-2 text-xs font-medium text-slate-700 sm:pt-4">
                  <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Requires business sign-off</span>
                </label>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting || !projectTitle.trim() || !projectDescription.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {isConverting ? (
                  <>
                    <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating project…</span>
                  </>
                ) : (
                  <span>Create Project & Scope Tasks</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarify Modal / Bottom Sheet */}
      {showClarifyModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-2xs sm:items-center sm:p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 sm:hidden" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-950">Ask Client for Clarification</h3>
                <p className="text-xs text-slate-500">Direct message to {request.business?.businessName || 'the client'}.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowClarifyModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-800">What information is missing?</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="e.g. Please clarify which specific neighborhoods in Abuja you want agents to focus on..."
                className="mt-1 min-h-[96px] h-24 w-full resize-y rounded-lg border border-slate-200 pl-3 pr-2 py-2 text-xs font-medium leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none custom-scrollbar"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowClarifyModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClarify}
                disabled={isClarifying || !note.trim()}
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {isClarifying ? 'Sending…' : 'Send Clarification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal / Bottom Sheet */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-2xs sm:items-center sm:p-4">
          <div className="w-full max-w-sm rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 sm:hidden" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-950">Provide Estimated Quote</h3>
                <p className="text-xs text-slate-500">The client must approve the quote before work begins.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-800">Estimated Cost ({request.currency || 'GBP'})</label>
              <input
                type="number"
                min={0}
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="e.g. 250.00"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuote}
                disabled={isQuoting || !quoteAmount}
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {isQuoting ? 'Saving…' : 'Send Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DirectTaskCard({ task }: { task: Task }) {
  const [collapsed, setCollapsed] = useState(true);
  const assignedDate = formatDate(task.createdAt);
  const dueDate = formatDate(task.dueDate);
  const isRevision = task.status === 'revision_requested';
  const isAssigned = task.status === 'assigned';
  const isCentralTask = task.originSystem === 'MCOM_CENTRAL' || Boolean(task.externalTaskId);

  const directStatusTextColors: Record<string, string> = {
    OPEN: 'text-slate-600',
    ASSIGNED: 'text-blue-700',
    ACCEPTED: 'text-emerald-700',
    DECLINED: 'text-slate-500',
    SUBMITTED: 'text-amber-700',
    PENDING_BUSINESS_APPROVAL: 'text-violet-700',
    REVISION_REQUESTED: 'text-orange-700',
    APPROVED: 'text-teal-700',
    COMPLETED: 'text-emerald-700',
    CANCELLED: 'text-red-700',
  };

  return (
    <article className="group rounded-xl border border-slate-200/90 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 hover:shadow-sm sm:p-3.5">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        className="flex w-full items-start justify-between gap-2 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="text-sm font-bold leading-snug text-slate-900 sm:text-base">{task.title}</h3>
            <span
              className={`shrink-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider ${
                directStatusTextColors[task.status.toUpperCase()] || 'text-slate-600'
              }`}
            >
              {task.status.replaceAll('_', ' ')}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {task.centralBusinessName || task.projectName || 'Direct Assignment'}
            </span>
            <span className="mx-1.5 text-slate-300">·</span>
            Due {dueDate}
          </p>
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
        <>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
            {task.description || 'No additional description was provided.'}
          </p>

          {(isCentralTask || task.centralBusinessName || task.platforms?.length || task.category || task.projectName) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {isCentralTask && (
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  Central Hub
                </span>
              )}
              {task.centralBusinessName && (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  <span className="material-symbols-outlined !text-xs leading-none">storefront</span>
                  {task.centralBusinessName}
                </span>
              )}
              {(task.platforms ?? []).map((platform) => (
                <span key={platform} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-blue-800">
                  {platform}
                </span>
              ))}
              {task.category && (
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-indigo-800">
                  {task.category}
                </span>
              )}
              {task.projectName && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  <span className="material-symbols-outlined !text-xs leading-none">folder</span>
                  {task.projectName}
                </span>
              )}
            </div>
          )}

          {isRevision && (
            <p className="mt-2 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-2 text-xs leading-5 text-orange-900">
              <strong className="font-semibold">Changes requested.</strong>
              {task.reviewNotes ? ` ${task.reviewNotes}` : ' Open the task to review the feedback and resubmit.'}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {assignedDate !== '—' && (
              <span>
                <strong className="font-semibold text-slate-800">Created:</strong> {assignedDate}
              </span>
            )}
            {dueDate !== '—' && (
              <span>
                <strong className="font-semibold text-slate-800">Deadline:</strong> {dueDate}
              </span>
            )}
            {task.estimatedTime && (
              <span>
                <strong className="font-semibold text-slate-800">Estimate:</strong> {task.estimatedTime}
              </span>
            )}
            {task.budget != null && (
              <span>
                <strong className="font-semibold text-slate-800">Budget:</strong>{' '}
                {new Intl.NumberFormat(undefined, { style: 'currency', currency: task.currency || 'USD' }).format(
                  Number(task.budget),
                )}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[11px] text-slate-500">
              {task.requiredSkills?.length
                ? `${task.requiredSkills.length} listed requirement${task.requiredSkills.length === 1 ? '' : 's'}`
                : 'Review task instructions for requirements'}
            </span>
            <Link
              href={`/dashboard/account-manager/tasks/${task.id}`}
              className={`inline-flex h-8 items-center gap-1 rounded-lg px-3.5 text-xs font-bold text-white shadow-2xs transition-colors ${
                isRevision ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span>{isRevision ? 'Resubmit' : isAssigned ? 'Respond' : 'Open task'}</span>
              <span className="material-symbols-outlined !text-sm leading-none">arrow_forward</span>
            </Link>
          </div>
        </>
      )}
    </article>
  );
}

type TabType = 'requests' | 'projects' | 'reviews' | 'direct';

export default function AccountManagerReviewQueue() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [status, setStatus] = useState('SUBMITTED');
  const [projectStatus, setProjectStatus] = useState('');
  const [directSearch, setDirectSearch] = useState('');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'converted' | 'clarification'>('all');
  const [requestSort, setRequestSort] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [projectSort, setProjectSort] = useState<'newest' | 'oldest' | 'due_soon'>('newest');
  const [reviewSort, setReviewSort] = useState<'newest' | 'oldest' | 'due_soon'>('newest');
  const [directSort, setDirectSort] = useState<'newest' | 'oldest' | 'due_soon'>('newest');
  const [autoOpenProjectId, setAutoOpenProjectId] = useState<string | null>(null);
  const workflowRailRef = useRef<HTMLDivElement>(null);
  const quickActionsRailRef = useRef<HTMLDivElement>(null);
  const [activeQueueSlide, setActiveQueueSlide] = useState(0);
  const [activeQuickSlide, setActiveQuickSlide] = useState(0);

  const handleRailScroll = useCallback(
    (rail: HTMLDivElement | null, currentIndex: number, setIndex: (idx: number) => void) => {
      if (!rail || !rail.clientWidth || rail.children.length === 0) return;
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      if (maxScrollLeft <= 4) {
        if (currentIndex !== 0) setIndex(0);
        return;
      }
      if (rail.scrollLeft >= maxScrollLeft - 12) {
        const lastIdx = rail.children.length - 1;
        if (currentIndex !== lastIdx) setIndex(lastIdx);
        return;
      }
      const paddingLeft = parseFloat(window.getComputedStyle(rail).paddingLeft || '0');
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < rail.children.length; i += 1) {
        const child = rail.children[i] as HTMLElement;
        const distance = Math.abs(child.offsetLeft - paddingLeft - rail.scrollLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }
      if (closestIndex !== currentIndex) {
        setIndex(closestIndex);
      }
    },
    [],
  );

  const scrollToRailSlide = useCallback(
    (rail: HTMLDivElement | null, index: number, setIndex: (idx: number) => void) => {
      if (!rail || rail.children.length === 0) return;
      const clamped = Math.max(0, Math.min(rail.children.length - 1, index));
      setIndex(clamped);
      const child = rail.children[clamped] as HTMLElement | undefined;
      if (child) {
        const paddingLeft = parseFloat(window.getComputedStyle(rail).paddingLeft || '0');
        rail.scrollTo({
          left: Math.max(0, child.offsetLeft - paddingLeft),
          behavior: 'smooth',
        });
      }
    },
    [],
  );

  const { data: tasks, isLoading, isError, error, refetch } = useManagedTasks({ status: status || undefined, limit: 50 });
  const { data: allManagedTasks, isError: isErrorAllManagedTasks, error: allManagedTasksError, refetch: refetchAllManagedTasks } = useManagedTasks({ limit: 100 });
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = useManagedProjects({ limit: 50 });
  const {
    data: requests,
    isLoading: isLoadingRequests,
    isError: isErrorRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useManagedRequests({ limit: 25 });
  const {
    data: affiliates = [],
    isLoading: isLoadingAffiliates,
    isError: isErrorAffiliates,
    refetch: refetchAffiliates,
  } = useDelegatableAgents();

  const {
    tasks: directTasks,
    isLoading: isLoadingDirect,
    isError: isErrorDirect,
    error: directError,
    refetch: refetchDirect,
  } = useTasks({
    assignedAgentId: user?.id,
    search: directSearch.trim() || undefined,
    enabled: Boolean(user?.id),
    limit: 50,
  });

  const tasksByProjectId = useMemo(() => {
    const grouped = new Map<string, ManagedTask[]>();
    for (const item of allManagedTasks ?? []) {
      const pid = item.projectId || item.project?.id;
      if (!pid) continue;
      const existing = grouped.get(pid) ?? [];
      existing.push(item);
      grouped.set(pid, existing);
    }
    return grouped;
  }, [allManagedTasks]);

  const pendingReviewsCount = useMemo(() => {
    return allManagedTasks?.filter((t) => t.status === 'SUBMITTED').length ?? (tasks?.length ?? 0);
  }, [allManagedTasks, tasks]);

  const filteredAndSortedRequests = useMemo(() => {
    const list = [...(requests ?? [])].filter((item) => {
      if (requestFilter === 'pending') return !item.project;
      if (requestFilter === 'converted') return Boolean(item.project);
      if (requestFilter === 'clarification') return Boolean(item.clarificationNote);
      return true;
    });

    list.sort((a, b) => {
      if (requestSort === 'priority') {
        const aUrgent = a.urgency === 'URGENT' ? 2 : a.urgency === 'HIGH' ? 1 : 0;
        const bUrgent = b.urgency === 'URGENT' ? 2 : b.urgency === 'HIGH' ? 1 : 0;
        if (bUrgent !== aUrgent) return bUrgent - aUrgent;
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return requestSort === 'oldest' ? aTime - bTime : bTime - aTime;
    });

    return list;
  }, [requests, requestFilter, requestSort]);

  const sortedProjects = useMemo(() => {
    let list = [...(projects ?? [])];
    if (projectStatus) {
      list = list.filter((p) => String(p.status).toUpperCase() === projectStatus.toUpperCase());
    }
    list.sort((a, b) => {
      if (projectSort === 'due_soon') {
        const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
        const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;
        if (aDue !== bDue) return aDue - bDue;
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return projectSort === 'oldest' ? aTime - bTime : bTime - aTime;
    });
    return list;
  }, [projects, projectStatus, projectSort]);

  const sortedTasks = useMemo(() => {
    const list = [...(tasks ?? [])];
    list.sort((a, b) => {
      if (reviewSort === 'due_soon') {
        const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
        const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;
        if (aDue !== bDue) return aDue - bDue;
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return reviewSort === 'oldest' ? aTime - bTime : bTime - aTime;
    });
    return list;
  }, [tasks, reviewSort]);

  const sortedDirectTasks = useMemo(() => {
    const list = [...(directTasks ?? [])];
    list.sort((a, b) => {
      if (directSort === 'due_soon') {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        if (aDue !== bDue) return aDue - bDue;
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return directSort === 'oldest' ? aTime - bTime : bTime - aTime;
    });
    return list;
  }, [directTasks, directSort]);

  return (
    <div className="flex min-h-[calc(100dvh-9.5rem)] flex-col gap-4 sm:min-h-[calc(100dvh-6.5rem)] sm:gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Tasks & Operations</h1>
        <p className="max-w-3xl text-xs leading-5 text-slate-600 sm:text-sm">
          Coordinate client briefs, delegate campaign milestones, verify deliverable QA, and manage personal tasks.
        </p>
      </div>

      <div
        ref={workflowRailRef}
        onScroll={() =>
          handleRailScroll(workflowRailRef.current, activeQueueSlide, setActiveQueueSlide)
        }
        role="group"
        aria-label="Account Manager work queues"
        className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-0.5 py-0.5 touch-pan-x no-scrollbar sm:grid sm:grid-cols-4 sm:gap-2.5 sm:overflow-visible sm:px-0"
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('requests');
            scrollToRailSlide(workflowRailRef.current, 0, setActiveQueueSlide);
          }}
          aria-pressed={activeTab === 'requests'}
          className={`flex min-h-11 w-[196px] shrink-0 snap-start items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-12 sm:w-auto ${
            activeTab === 'requests'
              ? 'border-blue-600 bg-blue-50/70 font-bold text-slate-950 shadow-xs ring-1 ring-blue-600/15'
              : 'border-slate-200 bg-white font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/70'
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <span className="material-symbols-outlined !text-base leading-none">article</span>
            </span>
            <span className="truncate">Inbound Requests</span>
          </span>
          <span
            className={`shrink-0 tabular-nums text-xs ${
              activeTab === 'requests'
                ? 'font-bold text-blue-700'
                : 'font-medium text-slate-400'
            }`}
          >
            ({isLoadingRequests ? '…' : isErrorRequests ? '—' : requests?.length ?? 0})
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('projects');
            scrollToRailSlide(workflowRailRef.current, 1, setActiveQueueSlide);
          }}
          aria-pressed={activeTab === 'projects'}
          className={`flex min-h-11 w-[196px] shrink-0 snap-start items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:min-h-12 sm:w-auto ${
            activeTab === 'projects'
              ? 'border-emerald-600 bg-emerald-50/70 font-bold text-slate-950 shadow-xs ring-1 ring-emerald-600/15'
              : 'border-slate-200 bg-white font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/70'
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                activeTab === 'projects'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <span className="material-symbols-outlined !text-base leading-none">folder_managed</span>
            </span>
            <span className="truncate">Managed Projects</span>
          </span>
          <span
            className={`shrink-0 tabular-nums text-xs ${
              activeTab === 'projects'
                ? 'font-bold text-emerald-700'
                : 'font-medium text-slate-400'
            }`}
          >
            ({isLoadingProjects ? '…' : isErrorProjects ? '—' : projects?.length ?? 0})
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('reviews');
            scrollToRailSlide(workflowRailRef.current, 2, setActiveQueueSlide);
          }}
          aria-pressed={activeTab === 'reviews'}
          className={`flex min-h-11 w-[196px] shrink-0 snap-start items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:min-h-12 sm:w-auto ${
            activeTab === 'reviews'
              ? 'border-amber-600 bg-amber-50/70 font-bold text-slate-950 shadow-xs ring-1 ring-amber-600/15'
              : 'border-slate-200 bg-white font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/70'
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <span className="material-symbols-outlined !text-base leading-none">fact_check</span>
            </span>
            <span className="truncate">Deliverables QA</span>
          </span>
          <span
            className={`shrink-0 tabular-nums text-xs ${
              activeTab === 'reviews'
                ? 'font-bold text-amber-700'
                : 'font-medium text-slate-400'
            }`}
          >
            ({isLoading ? '…' : isError ? '—' : pendingReviewsCount})
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('direct');
            scrollToRailSlide(workflowRailRef.current, 3, setActiveQueueSlide);
          }}
          aria-pressed={activeTab === 'direct'}
          className={`flex min-h-11 w-[196px] shrink-0 snap-start items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:min-h-12 sm:w-auto ${
            activeTab === 'direct'
              ? 'border-indigo-600 bg-indigo-50/70 font-bold text-slate-950 shadow-xs ring-1 ring-indigo-600/15'
              : 'border-slate-200 bg-white font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/70'
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                activeTab === 'direct'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <span className="material-symbols-outlined !text-base leading-none">assignment_ind</span>
            </span>
            <span className="truncate">My Direct Tasks</span>
          </span>
          <span
            className={`shrink-0 tabular-nums text-xs ${
              activeTab === 'direct'
                ? 'font-bold text-indigo-700'
                : 'font-medium text-slate-400'
            }`}
          >
            ({isLoadingDirect ? '…' : isErrorDirect ? '—' : directTasks?.length ?? 0})
          </span>
        </button>
      </div>

      <div
        className="flex items-center justify-center gap-1.5 pt-0.5 sm:hidden"
        role="tablist"
        aria-label="Work queue slides"
      >
        {[
          { id: 'requests', label: 'Inbound Requests' },
          { id: 'projects', label: 'Managed Projects' },
          { id: 'reviews', label: 'Deliverables QA' },
          { id: 'direct', label: 'My Direct Tasks' },
        ].map((item, index) => {
          const isActive = index === activeQueueSlide;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              onClick={() => scrollToRailSlide(workflowRailRef.current, index, setActiveQueueSlide)}
              className={`h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                isActive ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          );
        })}
      </div>

      {/* 4. Active Tab Content Canvas */}
      {/* Tab 1: Inbound Business Service Requests */}
      {activeTab === 'requests' && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-950 sm:text-lg">Business Service Requests</h2>
              <p className="text-xs text-slate-500">
                Clarify what the business needs, then convert the request into a project and tasks.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={requestFilter}
                onChange={(event) =>
                  setRequestFilter(
                    event.target.value as 'all' | 'pending' | 'converted' | 'clarification',
                  )
                }
                aria-label="Filter service requests"
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="all">All requests</option>
                <option value="pending">Yet to convert</option>
                <option value="converted">Project active</option>
                <option value="clarification">Clarification sent</option>
              </select>
              <select
                value={requestSort}
                onChange={(event) =>
                  setRequestSort(event.target.value as 'newest' | 'oldest' | 'priority')
                }
                aria-label="Sort service requests"
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="priority">Sort: Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {isLoadingRequests && !isErrorRequests ? (
              <p className="py-5 text-center text-xs text-slate-500">Loading service requests…</p>
            ) : isErrorRequests ? (
              <RequestErrorState
                area="AccountManager service requests"
                label="Service requests"
                error={requestsError}
                onRetry={() => refetchRequests()}
              />
            ) : filteredAndSortedRequests.length ? (
              filteredAndSortedRequests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  onManageProject={(projectId) => {
                    setProjectStatus('');
                    setActiveTab('projects');
                    if (projectId) {
                      setAutoOpenProjectId(projectId);
                    }
                  }}
                />
              ))
            ) : (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">
                  article
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {requests?.length ? 'No matching service requests' : 'No service requests yet'}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 2: Managed Projects & Task Delegation */}
      {activeTab === 'projects' && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-950 sm:text-lg">Managed Projects & Task Delegation</h2>
              <p className="text-xs text-slate-500">
                Track projects converted from briefs and delegate tasks to verified affiliates.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={projectStatus}
                onChange={(event) => setProjectStatus(event.target.value)}
                aria-label="Filter managed projects"
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="">All project statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="AWAITING_BUSINESS_APPROVAL">Awaiting approval</option>
                <option value="ON_HOLD">On hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                value={projectSort}
                onChange={(event) =>
                  setProjectSort(event.target.value as 'newest' | 'oldest' | 'due_soon')
                }
                aria-label="Sort managed projects"
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="due_soon">Sort: Due soon</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {isLoadingProjects && !isErrorProjects ? (
              <p className="py-5 text-center text-xs text-slate-500">Loading managed projects…</p>
            ) : isErrorProjects ? (
              <RequestErrorState
                area="AccountManager managed projects"
                label="Managed projects"
                error={projectsError}
                onRetry={() => refetchProjects()}
              />
            ) : sortedProjects.length ? (
              sortedProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  projectTasks={tasksByProjectId.get(project.id) ?? []}
                  isErrorTasks={isErrorAllManagedTasks && !Array.isArray(project.tasks)}
                  tasksError={allManagedTasksError}
                  onRetryTasks={() => refetchAllManagedTasks()}
                  affiliates={affiliates}
                  isLoadingAffiliates={isLoadingAffiliates}
                  isErrorAffiliates={isErrorAffiliates}
                  onRefetchAffiliates={() => refetchAffiliates()}
                  autoOpen={autoOpenProjectId === project.id}
                  onAutoOpenHandled={() => setAutoOpenProjectId(null)}
                />
              ))
            ) : (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">
                  folder_managed
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-700">No managed projects found</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 3: Deliverables QA Check */}
      {activeTab === 'reviews' && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-950 sm:text-lg">Deliverables QA Check</h2>
              <p className="text-xs text-slate-500">
                Review work submitted by affiliates before forwarding to the business client.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter QA tasks"
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="SUBMITTED">Submitted for review</option>
                <option value="OPEN">Open / unassigned</option>
                <option value="ASSIGNED">Assigned to affiliate</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="PENDING_BUSINESS_APPROVAL">Awaiting business approval</option>
                <option value="REVISION_REQUESTED">Changes requested</option>
                <option value="DECLINED">Declined by affiliate</option>
                <option value="">All managed tasks</option>
              </select>
              <select
                value={reviewSort}
                onChange={(event) =>
                  setReviewSort(event.target.value as 'newest' | 'oldest' | 'due_soon')
                }
                aria-label="Sort QA tasks"
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="due_soon">Sort: Due soon</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {isLoading && !isError ? (
              <p className="py-5 text-center text-xs text-slate-500">Loading managed tasks…</p>
            ) : isError ? (
              <RequestErrorState
                area="AccountManager business task reviews"
                label="Business tasks needing review"
                error={error}
                onRetry={() => refetch()}
              />
            ) : sortedTasks.length ? (
              sortedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  affiliates={affiliates}
                  isLoadingAffiliates={isLoadingAffiliates}
                  isErrorAffiliates={isErrorAffiliates}
                  onRefetchAffiliates={() => void refetchAffiliates()}
                />
              ))
            ) : (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">
                  fact_check
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-700">No deliverables awaiting review</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 4: My Direct Tasks */}
      {activeTab === 'direct' && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-950 sm:text-lg">Tasks Assigned Directly to You</h2>
              <p className="text-xs text-slate-500">
                Tasks assigned specifically to your personal affiliate profile.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="search"
                value={directSearch}
                onChange={(e) => setDirectSearch(e.target.value)}
                placeholder="Search direct tasks…"
                className="h-7 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
              <select
                value={directSort}
                onChange={(event) =>
                  setDirectSort(event.target.value as 'newest' | 'oldest' | 'due_soon')
                }
                aria-label="Sort direct tasks"
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="due_soon">Sort: Due soon</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {isLoadingDirect && !isErrorDirect ? (
              <p className="py-5 text-center text-xs text-slate-500">Loading direct tasks…</p>
            ) : isErrorDirect ? (
              <RequestErrorState
                area="AccountManager direct tasks"
                label="Direct tasks"
                error={directError}
                onRetry={() => refetchDirect()}
              />
            ) : sortedDirectTasks.length ? (
              sortedDirectTasks.map((task) => <DirectTaskCard key={task.id} task={task} />)
            ) : (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">
                  assignment_turned_in
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-700">No direct tasks assigned</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section aria-label="Quick actions" className="mt-auto space-y-2 pt-4">
        <h2 className="text-xs font-semibold text-slate-800">Quick actions</h2>
        <div
          ref={quickActionsRailRef}
          onScroll={() =>
            handleRailScroll(quickActionsRailRef.current, activeQuickSlide, setActiveQuickSlide)
          }
          role="group"
          aria-label="Quick action links"
          className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-0.5 py-0.5 touch-pan-x no-scrollbar sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0"
        >
          <Link
            href="/dashboard/account-manager/campaigns"
            className="flex min-h-12 w-[180px] shrink-0 snap-start items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition-colors hover:border-blue-200 hover:bg-blue-50/40 sm:w-auto"
          >
            <span className="material-symbols-outlined !text-lg text-blue-700">campaign</span>
            <span>Create Campaign</span>
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className="flex min-h-12 w-[180px] shrink-0 snap-start items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-800 shadow-xs transition-colors hover:border-blue-200 hover:bg-blue-50/40 sm:w-auto"
          >
            <span className="material-symbols-outlined !text-lg text-blue-700">folder_managed</span>
            <span>Review Requests</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className="flex min-h-12 w-[180px] shrink-0 snap-start items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-800 shadow-xs transition-colors hover:border-blue-200 hover:bg-blue-50/40 sm:w-auto"
          >
            <span className="material-symbols-outlined !text-lg text-blue-700">assignment_ind</span>
            <span>Delegate a Task</span>
          </button>

          <Link
            href="/dashboard/account-manager/revenue"
            className="flex min-h-12 w-[180px] shrink-0 snap-start items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition-colors hover:border-blue-200 hover:bg-blue-50/40 sm:w-auto"
          >
            <span className="material-symbols-outlined !text-lg text-blue-700">monitoring</span>
            <span>View Reports</span>
          </Link>
        </div>
        <div
          className="flex items-center justify-center gap-1.5 pt-0.5 sm:hidden"
          role="tablist"
          aria-label="Quick action slides"
        >
          {[
            { id: 'create-campaign', label: 'Create Campaign' },
            { id: 'review-requests', label: 'Review Requests' },
            { id: 'delegate-task', label: 'Delegate a Task' },
            { id: 'view-reports', label: 'View Reports' },
          ].map((item, index) => {
            const isActive = index === activeQuickSlide;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                onClick={() =>
                  scrollToRailSlide(quickActionsRailRef.current, index, setActiveQuickSlide)
                }
                className={`h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                  isActive ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>
      </section>

    </div>
  );
}
