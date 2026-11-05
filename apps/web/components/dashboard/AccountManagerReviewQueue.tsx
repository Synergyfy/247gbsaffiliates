'use client';

import { useState } from 'react';
import {
  ManagedServiceRequest,
  ManagedTask,
  useManagedRequests,
  useManagedTasks,
} from '@/hooks/useTasks';

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

const statusStyles: Record<string, string> = {
  ASSIGNED: 'bg-blue-50 text-blue-800 border-blue-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  SUBMITTED: 'bg-amber-50 text-amber-800 border-amber-200',
  PENDING_BUSINESS_APPROVAL: 'bg-violet-50 text-violet-800 border-violet-200',
  REVISION_REQUESTED: 'bg-orange-50 text-orange-800 border-orange-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  DECLINED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
};

function label(status?: string | null) {
  return (status || '').replaceAll('_', ' ').toLowerCase();
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

function TaskRow({ task }: { task: ManagedTask }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { reviewTask, isReviewing } = useManagedTasks({}, false);

  const decide = async (decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    setError('');
    setMessage('');
    try {
      await reviewTask({ taskId: task.id, decision, notes: notes.trim() || undefined });
      setMessage(
        decision === 'APPROVED'
          ? task.requiresBusinessApproval
            ? 'Forwarded to the business owner for approval.'
            : 'Approved and completed. Payment has been recorded where applicable.'
          : 'Changes requested — the affiliate will be notified.',
      );
      setNotes('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'The review could not be recorded. Please try again.',
      );
    }
  };

  const canReview = task.status === 'SUBMITTED';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-950">{task.title}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyles[task.status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              {label(task.status)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{task.business?.businessName || 'Business'}</span>
            <span className="mx-1.5">·</span>
            {task.project?.title ? `${task.project.title} · ` : ''}
            Due {formatDate(task.dueAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {open ? 'Hide' : 'Review'}
          <span className="material-symbols-outlined text-base">{open ? 'expand_less' : 'expand_more'}</span>
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Task scope</p>
            <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">{task.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-600">
              <span className="rounded bg-indigo-50 px-2 py-1 capitalize text-indigo-800">{task.category || 'external'}</span>
              {(task.platforms ?? []).map((platform) => (
                <span key={platform} className="rounded bg-blue-50 px-2 py-1 capitalize text-blue-800">{platform}</span>
              ))}
            </div>
          </div>

          {task.deliverables?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deliverables</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
                {task.deliverables.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ) : null}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Submission</p>
            <div className="mt-1 rounded-lg bg-slate-50 p-3">
              <Submission task={task} />
            </div>
          </div>

          {task.reviews?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Review history</p>
              <ul className="mt-1 space-y-1.5">
                {task.reviews.map((review) => (
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

          {task.status === 'PENDING_BUSINESS_APPROVAL' && (
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
                  } catch (err: any) {
                    setError(err?.response?.data?.message || 'Could not send the clarification.');
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
                    } catch (err: any) {
                      setError(err?.response?.data?.message || 'Could not save the quote.');
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
                      } catch (err: any) {
                        setError(err?.response?.data?.message || 'Could not create the project.');
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
  const { data: tasks, isLoading, isError, refetch } = useManagedTasks({ status: status || undefined, limit: 50 });
  const { data: requests } = useManagedRequests({ limit: 25 });

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
        <span className="text-[11px] font-bold text-slate-400">{requests?.length ?? 0} request{(requests?.length ?? 0) === 1 ? '' : 's'}</span>
      </div>
      <div className="mt-4 space-y-3">
        {requests?.length ? (
          requests.map((request) => <RequestRow key={request.id} request={request} />)
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
            No service requests assigned to you yet.
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
            Review deliverables before they reach the business owner. Approving forwards the work for
            business acceptance or completes it when no business approval is required.
          </p>
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
        >
          <option value="SUBMITTED">Submitted for review</option>
          <option value="PENDING_BUSINESS_APPROVAL">Awaiting business approval</option>
          <option value="REVISION_REQUESTED">Changes requested</option>
          <option value="">All managed tasks</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="py-6 text-center text-xs text-slate-500">Loading managed tasks…</p>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            Tasks could not be loaded.{' '}
            <button type="button" onClick={() => void refetch()} className="font-bold underline">Try again</button>
          </div>
        ) : tasks?.length ? (
          tasks.map((task) => <TaskRow key={task.id} task={task} />)
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
