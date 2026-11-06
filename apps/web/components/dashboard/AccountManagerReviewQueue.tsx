'use client';

import { useMemo, useState } from 'react';
import {
  DirectoryAffiliate,
  ManagedProject,
  ManagedServiceRequest,
  ManagedTask,
  useAffiliateDirectory,
  useManagedProjects,
  useManagedRequests,
  useManagedTask,
  useManagedTasks,
} from '@/hooks/useTasks';
import { getActionFailureMessage, reportRequestFailure } from '@/lib/requestErrors';
import { RequestErrorState, ResponsiveRetryAction } from '@/components/dashboard/RequestErrorState';

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
  const [roleFilter, setRoleFilter] = useState<'all' | 'agent' | 'consultant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const { assignTask, isAssigningTask } = useManagedTasks({}, false);

  const currentAssignee = getAssigneeDisplay(task);
  const canDelegate =
    !task.status ||
    ASSIGNABLE_TASK_STATUSES.has(task.status.toUpperCase()) ||
    (!task.assigneeUserId && !task.assignedAgentEmail);

  const requiredSkillsLower = useMemo(
    () => new Set((task.requiredSkills ?? []).map((skill) => skill.toLowerCase())),
    [task.requiredSkills],
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
      filteredAffiliates.find(
        (affiliate) => (affiliate.centralUserId || affiliate.id) === selectedAssigneeId,
      ) ?? null,
    [filteredAffiliates, selectedAssigneeId],
  );

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
        ? `${selectedAffiliate.name} (${selectedAffiliate.email})`
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
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block text-[11px] font-semibold text-slate-700">
              Filter by role
              <select
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value as 'all' | 'agent' | 'consultant');
                  setSelectedAssigneeId('');
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="all">All verified affiliates</option>
                <option value="agent">Verified Agents</option>
                <option value="consultant">Verified Consultants</option>
              </select>
            </label>

            <label className="block text-[11px] font-semibold text-slate-700 sm:col-span-2">
              Search directory (name, skill, location, email)
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Filter eligible affiliates…"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-800"
              />
            </label>
          </div>

          {isLoadingAffiliates ? (
            <p className="text-xs text-slate-500">Loading verified affiliates from directory…</p>
          ) : isErrorAffiliates ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
              Could not load the affiliate directory.{' '}
              <ResponsiveRetryAction onRetry={onRefetchAffiliates} label="Retry" className="ml-2 align-middle" />
            </div>
          ) : filteredAffiliates.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500">
              No eligible verified affiliates match the current filter.
            </p>
          ) : (
            <label className="block text-[11px] font-semibold text-slate-700">
              Select eligible affiliate ({filteredAffiliates.length} available)
              <select
                value={selectedAssigneeId}
                onChange={(event) => setSelectedAssigneeId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-900"
              >
                <option value="">Choose an agent or consultant…</option>
                {filteredAffiliates.map((affiliate) => {
                  const assigneeId = affiliate.centralUserId || affiliate.id;
                  const roleLabel = (affiliate.role || 'agent').replace('_', ' ').toUpperCase();
                  const skillPreview = affiliate.skills?.slice(0, 3).join(', ');
                  const matchingSkillCount = (affiliate.skills ?? []).filter((s) =>
                    requiredSkillsLower.has(s.toLowerCase()),
                  ).length;
                  const matchBadge =
                    matchingSkillCount > 0 ? ` ★ ${matchingSkillCount} skill match` : '';
                  const locationPart = affiliate.city ? ` · ${affiliate.city}` : '';
                  return (
                    <option key={affiliate.id} value={assigneeId}>
                      {affiliate.name} ({roleLabel}
                      {locationPart}) — {affiliate.email}
                      {skillPreview ? ` [${skillPreview}]` : ''}
                      {matchBadge}
                    </option>
                  );
                })}
              </select>
            </label>
          )}

          {selectedAffiliate ? (
            <div className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-[11px] text-slate-600">
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
                <div className="mt-1.5 flex flex-wrap gap-1">
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex-1 text-[11px] font-semibold text-slate-700">
              Assignment instructions / handover note (optional)
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
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-950">{effectiveTask.title}</h3>
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
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{effectiveTask.business?.businessName || 'Business'}</span>
            <span className="mx-1.5">·</span>
            {effectiveTask.project?.title ? `${effectiveTask.project.title} · ` : ''}
            Due {formatDate(effectiveTask.dueAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {open ? 'Hide' : canReview ? 'Review' : 'Manage & delegate'}
          <span className="material-symbols-outlined text-base">{open ? 'expand_less' : 'expand_more'}</span>
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
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
              {effectiveTask.compensationAmount != null && Number(effectiveTask.compensationAmount) > 0 ? (
                <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-800">
                  Compensation: {effectiveTask.compensationCurrency || 'GBP'} {effectiveTask.compensationAmount}
                  {effectiveTask.paymentStatus ? ` (${label(effectiveTask.paymentStatus)})` : ''}
                </span>
              ) : null}
              {effectiveTask.businessChargeAmount != null && Number(effectiveTask.businessChargeAmount) > 0 ? (
                <span className="rounded bg-sky-50 px-2 py-1 text-sky-800">
                  Business charge: {effectiveTask.businessChargeCurrency || effectiveTask.compensationCurrency || 'GBP'} {effectiveTask.businessChargeAmount}
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
}) {
  const [open, setOpen] = useState(false);
  const [outcomeSummary, setOutcomeSummary] = useState(project.outcomeSummary || '');
  const [followUpNotes, setFollowUpNotes] = useState(project.followUpNotes || '');
  const [closeError, setCloseError] = useState('');
  const [closeFeedback, setCloseFeedback] = useState('');
  const { closeProject, isClosingProject } = useManagedProjects({}, false);

  const normalizedStatus = (project.status || 'ACTIVE').toUpperCase();
  const isClosed = ['COMPLETED', 'CLOSED', 'CANCELLED'].includes(normalizedStatus);

  const mergedTasks = useMemo(() => {
    const byId = new Map<string, ManagedTask>();
    for (const item of project.tasks ?? []) {
      if (item?.id) byId.set(item.id, item);
    }
    for (const item of projectTasks) {
      if (item?.id) byId.set(item.id, item);
    }
    return Array.from(byId.values());
  }, [project.tasks, projectTasks]);

  const completedTasksCount = mergedTasks.filter(
    (t) => (t.status || '').toUpperCase() === 'COMPLETED',
  ).length;
  const unassignedTasksCount = mergedTasks.filter((t) => !getAssigneeDisplay(t)).length;

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
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-950">{project.title}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                statusStyles[normalizedStatus] || 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
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
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {project.business?.businessName || 'Business'}
            </span>
            {project.request?.title ? (
              <>
                <span className="mx-1.5">·</span>
                <span>From request: {project.request.title}</span>
              </>
            ) : null}
            <span className="mx-1.5">·</span>
            Due {formatDate(project.dueAt)}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">{project.description}</p>
          {project.objective ? (
            <p className="mt-1 text-[11px] text-slate-500">
              <strong>Objective:</strong> {project.objective}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {open ? 'Hide details' : `Manage project (${mergedTasks.length})`}
          <span className="material-symbols-outlined text-base">
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <div className="grid gap-3 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Project scope
              </p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">{project.description}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Agreed objective & timeline
              </p>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">
                {project.objective || 'No specific objective text recorded.'}
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                Created {formatDate(project.createdAt)} · Due {formatDate(project.dueAt)}
                {project.closedAt ? ` · Closed ${formatDate(project.closedAt)}` : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Project tasks & affiliate delegation ({mergedTasks.length})
              </p>
              <span className="text-[11px] text-slate-500">
                Expand a task below to delegate to a verified agent or consultant, or review submissions.
              </span>
            </div>

            {isErrorTasks ? (
              <RequestErrorState area="AccountManager project tasks" label="Project tasks" error={tasksError} onRetry={onRetryTasks} />
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
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-xs text-slate-500">
                No tasks are linked to this project yet.
              </p>
            )}
          </div>

          {isClosed ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-950">
              <p className="font-bold">Project closed {project.closedAt ? `on ${formatDate(project.closedAt)}` : ''}</p>
              {project.outcomeSummary ? (
                <p className="mt-1 whitespace-pre-wrap">
                  <strong>Outcome summary:</strong> {project.outcomeSummary}
                </p>
              ) : null}
              {project.followUpNotes ? (
                <p className="mt-1 whitespace-pre-wrap text-emerald-800">
                  <strong>Follow-up notes:</strong> {project.followUpNotes}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Close project & deliver outcome summary
              </p>
              <label className="block text-xs font-semibold text-slate-700">
                Outcome summary <span className="font-normal text-slate-500">(required to close project)</span>
                <textarea
                  value={outcomeSummary}
                  onChange={(event) => setOutcomeSummary(event.target.value)}
                  rows={2}
                  maxLength={5000}
                  placeholder="Summarize the completed deliverables and business impact…"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Follow-up notes / recommendations <span className="font-normal text-slate-500">(optional)</span>
                <textarea
                  value={followUpNotes}
                  onChange={(event) => setFollowUpNotes(event.target.value)}
                  rows={2}
                  maxLength={5000}
                  placeholder="Recommended next steps or maintenance notes for the business…"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleCloseProject()}
                disabled={isClosingProject || !outcomeSummary.trim()}
                className="min-h-9 rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {isClosingProject ? 'Closing project…' : 'Close project'}
              </button>
              {closeError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                  {closeError}
                </p>
              ) : null}
              {closeFeedback ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
                  {closeFeedback}
                </p>
              ) : null}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function RequestRow({ request }: { request: ManagedServiceRequest }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [projectTitle, setProjectTitle] = useState(request.title);
  const [projectDescription, setProjectDescription] = useState(request.description);
  const [projectObjective, setProjectObjective] = useState(request.desiredOutcome || '');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const { clarify, isClarifying, quote, isQuoting, convert, isConverting } = useManagedRequests({}, false);

  const canConvert = ['SUBMITTED', 'CLARIFICATION_REQUIRED', 'APPROVED'].includes(request.status);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-950">{request.title}</h3>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">
              {request.status.replaceAll('_', ' ').toLowerCase()}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{request.business?.businessName || 'Business'}</span>
            <span className="mx-1.5">·</span>
            {request.urgency || 'NORMAL'} urgency
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">{request.description}</p>
          {request.desiredOutcome ? (
            <p className="mt-1 text-[11px] text-slate-500"><strong>Desired outcome:</strong> {request.desiredOutcome}</p>
          ) : null}
          {request.clarificationNote ? (
            <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
              Clarification requested: {request.clarificationNote}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {open ? 'Hide' : 'Plan work'}
          <span className="material-symbols-outlined text-base">{open ? 'expand_less' : 'expand_more'}</span>
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {request.project ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Converted into project: <strong>{request.project.title}</strong>
            </p>
          ) : (
            <>
              <label className="block text-xs font-semibold text-slate-700">
                Ask the business for missing information
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"
                  placeholder="What do you need to confirm before planning?"
                />
              </label>
              <button
                type="button"
                onClick={async () => {
                  setError('');
                  setFeedback('');
                  if (!note.trim()) return;
                  try {
                    await clarify({ requestId: request.id, note: note.trim() });
                    setFeedback('Clarification request sent to the business.');
                    setNote('');
                  } catch (err: unknown) {
                    setError(getErrorMessage(err, 'Could not send the clarification.'));
                  }
                }}
                disabled={isClarifying || !note.trim()}
                className="min-h-9 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
              >
                {isClarifying ? 'Sending…' : 'Request clarification'}
              </button>

              <div className="flex flex-wrap items-end gap-2 rounded-lg bg-sky-50 p-3">
                <label className="text-[11px] font-bold text-sky-900">
                  Quote (Access Pass / Trial)
                  <input
                    type="number"
                    min={0}
                    value={quoteAmount}
                    onChange={(event) => setQuoteAmount(event.target.value)}
                    placeholder="e.g. 150"
                    className="mt-1 block w-28 rounded-lg border border-sky-200 px-2 py-1.5 text-xs"
                  />
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    setError('');
                    setFeedback('');
                    const amount = Number(quoteAmount);
                    if (!Number.isFinite(amount) || amount < 0) return;
                    try {
                      await quote({ requestId: request.id, estimatedCost: amount, currency: request.currency || 'GBP' });
                      setFeedback('Quote sent. The business must approve it before chargeable work begins.');
                      setQuoteAmount('');
                    } catch (err: unknown) {
                      setError(getErrorMessage(err, 'Could not save the quote.'));
                    }
                  }}
                  disabled={isQuoting || !quoteAmount}
                  className="min-h-9 rounded-lg bg-sky-700 px-3 text-xs font-bold text-white hover:bg-sky-800 disabled:opacity-50"
                >
                  {isQuoting ? 'Saving…' : 'Send quote'}
                </button>
                {request.estimatedCost != null && (
                  <span className="text-[11px] font-semibold text-sky-800">
                    Current: {request.currency || 'GBP'} {request.estimatedCost}
                  </span>
                )}
              </div>

              {canConvert && (
                <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Convert to a project/service plan
                  </p>
                  <input
                    value={projectTitle}
                    onChange={(event) => setProjectTitle(event.target.value)}
                    placeholder="Project title"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={projectDescription}
                    onChange={(event) => setProjectDescription(event.target.value)}
                    rows={2}
                    placeholder="Project scope"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={projectObjective}
                    onChange={(event) => setProjectObjective(event.target.value)}
                    rows={2}
                    placeholder="Objective / agreed outcome"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setError('');
                      setFeedback('');
                      try {
                        await convert({
                          requestId: request.id,
                          project: {
                            title: projectTitle.trim(),
                            description: projectDescription.trim(),
                            objective: projectObjective.trim() || undefined,
                          },
                        });
                        setFeedback('Project created. Add tasks and assign an agent or consultant.');
                      } catch (err: unknown) {
                        setError(getErrorMessage(err, 'Could not create the project.'));
                      }
                    }}
                    disabled={isConverting || !projectTitle.trim() || !projectDescription.trim()}
                    className="min-h-9 rounded-lg bg-blue-700 px-3 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {isConverting ? 'Creating…' : 'Convert to project'}
                  </button>
                </div>
              )}
            </>
          )}

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">{error}</p> : null}
          {feedback ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">{feedback}</p> : null}
        </div>
      )}
    </article>
  );
}

export default function AccountManagerReviewQueue() {
  const [status, setStatus] = useState('SUBMITTED');
  const [projectStatus, setProjectStatus] = useState('');
  const { data: tasks, isLoading, isError, error, refetch } = useManagedTasks({ status: status || undefined, limit: 50 });
  const { data: allManagedTasks, isError: isErrorAllManagedTasks, error: allManagedTasksError, refetch: refetchAllManagedTasks } = useManagedTasks({ limit: 100 });
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = useManagedProjects({ status: projectStatus || undefined, limit: 50 });
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
  } = useAffiliateDirectory({ limit: 100 });

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

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Account manager</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Business service requests</h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-600">
              Clarify what the business needs, then convert the request into a project and tasks.
            </p>
          </div>
          {!isErrorRequests && !isLoadingRequests ? <span className="text-[11px] font-bold text-slate-400">
            {requests?.length ?? 0} request{(requests?.length ?? 0) === 1 ? '' : 's'}
          </span> : null}
        </div>
        <div className="mt-4 space-y-3">
          {isLoadingRequests ? (
            <p className="py-6 text-center text-xs text-slate-500">Loading service requests…</p>
          ) : isErrorRequests ? (
            <RequestErrorState area="AccountManager service requests" label="Service requests" error={requestsError} onRetry={() => void refetchRequests()} />
          ) : requests?.length ? (
            requests.map((request) => <RequestRow key={request.id} request={request} />)
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
              No service requests assigned to you yet.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Account manager</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Managed projects & task delegation</h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-600">
              Track projects converted from service requests, delegate project tasks to verified agents or
              consultants, and record outcome summaries when closing completed projects.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isErrorProjects && !isLoadingProjects ? <span className="text-[11px] font-bold text-slate-400">
              {projects?.length ?? 0} project{(projects?.length ?? 0) === 1 ? '' : 's'}
            </span> : null}
            <select
              value={projectStatus}
              onChange={(event) => setProjectStatus(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="">All managed projects</option>
              <option value="ACTIVE">Active</option>
              <option value="PLANNING">Planning</option>
              <option value="COMPLETED">Completed / closed</option>
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {isLoadingProjects ? (
            <p className="py-6 text-center text-xs text-slate-500">Loading managed projects…</p>
          ) : isErrorProjects ? (
            <RequestErrorState area="AccountManager managed projects" label="Managed projects" error={projectsError} onRetry={() => void refetchProjects()} />
          ) : projects?.length ? (
            projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                projectTasks={tasksByProjectId.get(project.id) ?? []}
                isErrorTasks={isErrorAllManagedTasks && !Array.isArray(project.tasks)}
                tasksError={allManagedTasksError}
                onRetryTasks={() => void refetchAllManagedTasks()}
                affiliates={affiliates}
                isLoadingAffiliates={isLoadingAffiliates}
                isErrorAffiliates={isErrorAffiliates}
                onRefetchAffiliates={() => void refetchAffiliates()}
              />
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
              No managed projects found for this filter. Convert a business service request above to create one.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Account manager</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Business tasks needing your check</h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-600">
              Review deliverables before they reach the business owner, or delegate unassigned tasks to
              eligible affiliates. Approving forwards the work for business acceptance or completes it when
              no business approval is required.
            </p>
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
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
        </div>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <p className="py-6 text-center text-xs text-slate-500">Loading managed tasks…</p>
          ) : isError ? (
            <RequestErrorState area="AccountManager business task reviews" label="Business tasks needing review" error={error} onRetry={() => void refetch()} />
          ) : tasks?.length ? (
            tasks.map((task) => (
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
            <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-xs text-slate-500">
              Nothing in this queue right now.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
