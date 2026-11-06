"use client";

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  TaskAttachment,
  TaskReviewEntry,
  useTask,
  useTasks,
} from '@/hooks/useTasks';
import TaskCountdown from '@/components/tasks/TaskCountdown';
import { parseTaskMaterials } from '@/lib/taskMaterials';
import { useAuthStore } from '@/store/useAuthStore';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';
import { getActionFailureMessage, reportRequestFailure } from '@/lib/requestErrors';

const formatDate = (value?: string | null) => {
    if (!value) return 'Not specified';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not specified' : new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date);
};

const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const formatMoney = (task: { budget?: number; currency?: string }) => {
    if (task.budget == null || !Number.isFinite(Number(task.budget))) return null;
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: task.currency || 'USD' }).format(Number(task.budget));
};

const getErrorMessage = (error: unknown, area: string) => {
    reportRequestFailure(area, error);
    return getActionFailureMessage(error, 'We could not complete that task action. Please try again.');
};

const statusStyles: Record<string, string> = {
    open: 'border-slate-200 bg-slate-50 text-slate-700',
    assigned: 'border-blue-200 bg-blue-50 text-blue-800',
    accepted: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    declined: 'border-slate-200 bg-slate-100 text-slate-600',
    submitted: 'border-amber-200 bg-amber-50 text-amber-800',
    pending_business_approval: 'border-violet-200 bg-violet-50 text-violet-800',
    revision_requested: 'border-orange-200 bg-orange-50 text-orange-800',
    approved: 'border-teal-200 bg-teal-50 text-teal-800',
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    cancelled: 'border-red-200 bg-red-50 text-red-700',
};

const statusLabel = (status: string) => status.replaceAll('_', ' ');

const isImageAttachment = (attachment: TaskAttachment) =>
    /^image\//i.test(attachment.mimeType || '') ||
    /\.(png|jpe?g|gif|webp)$/i.test(attachment.url);

function AttachmentPreview({ attachment }: { attachment: TaskAttachment }) {
    if (isImageAttachment(attachment)) {
        return (
            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="group block">
                <img
                    src={attachment.url}
                    alt={attachment.fileName || 'Submission attachment'}
                    className="h-20 w-20 rounded-md border border-slate-200 object-cover transition group-hover:opacity-90"
                />
                <span className="mt-1 block max-w-20 truncate text-[10px] text-slate-500">{attachment.fileName || 'Image'}</span>
            </a>
        );
    }
    return (
        <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50"
        >
            <span className="material-symbols-outlined text-base">description</span>
            <span className="max-w-48 truncate">{attachment.fileName || 'Attachment'}</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
    );
}

function ReviewEntry({ entry, latest }: { entry: TaskReviewEntry; latest?: boolean }) {
    const approved = entry.decision === 'APPROVED';
    return (
        <li className={`rounded-lg border p-3 ${approved ? 'border-emerald-200 bg-emerald-50/60' : 'border-orange-200 bg-orange-50/60'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${approved ? 'text-emerald-800' : 'text-orange-800'}`}>
                    <span className="material-symbols-outlined text-base">{approved ? 'check_circle' : 'error'}</span>
                    {approved ? 'Approved' : 'Changes requested'} · round {entry.round}
                </span>
                <span className="text-[11px] text-slate-500">{formatDateTime(entry.reviewedAt) || ''}</span>
            </div>
            {entry.notes ? <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-slate-700">{entry.notes}</p> : null}
            {latest && approved && entry.acknowledgedAt ? (
                <p className="mt-1 text-[11px] text-slate-500">Acknowledged {formatDateTime(entry.acknowledgedAt)}</p>
            ) : null}
        </li>
    );
}

export default function AgentTaskDetailsPage() {
    const params = useParams<{ id: string }>();
    const pathname = usePathname();
    const basePath = pathname.split('/').slice(0, 3).join('/');
    const taskId = params.id;
    const { user } = useAuthStore();
    const { data: task, isLoading, isError, error, refetch } = useTask(taskId, Boolean(user?.id));
    const {
        acceptTask,
        declineTask,
        submitTask,
        acknowledgeReview,
        uploadTaskAttachment,
        isAccepting,
        isDeclining,
        isSubmitting,
        isAcknowledgingReview,
    } = useTasks({ enabled: false });

    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const [declineFormOpen, setDeclineFormOpen] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [declineError, setDeclineError] = useState('');
    const [notes, setNotes] = useState('');
    const [linksText, setLinksText] = useState('');
    const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Seed the submission form from any previous submission (e.g. after a
    // changes-requested review) without overwriting edits on refetch.
    useEffect(() => {
        if (!task) return;
        setNotes(task.submissionData?.notes ?? '');
        setLinksText((task.submissionData?.links ?? []).join('\n'));
        setAttachments(task.submissionData?.attachments ?? []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task?.id]);

    const isQualified = user?.role === 'agent'
        ? user?.verificationStatus === 'verified' && user?.isOnboarded === true && user?.isQuizPassed === true
        : user?.isOnboarded === true;

    const run = async (action: () => Promise<unknown>, successMessage: string) => {
        setActionMessage('');
        setActionError('');
        try {
            await action();
            setActionMessage(successMessage);
            await refetch();
        } catch (err) {
            setActionError(getErrorMessage(err, 'AssignedTask action'));
        }
    };

    const handleDecline = async () => {
        const reason = declineReason.trim();
        if (reason.length < 5) {
            setDeclineError('Give a short reason (at least 5 characters) so the business and an administrator can reassign the task.');
            return;
        }
        setDeclineError('');
        setActionError('');
        setActionMessage('');
        try {
            await declineTask({ taskId, reason });
            setDeclineFormOpen(false);
            setDeclineReason('');
            setActionMessage('Task declined. The business and an administrator can see your reason and reassign it.');
            await refetch();
        } catch (err) {
            setDeclineError(getErrorMessage(err, 'Task decline'));
        }
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files?.length) return;
        setUploadError('');
        setIsUploading(true);
        try {
            const uploaded: TaskAttachment[] = [];
            for (const file of Array.from(files)) {
                uploaded.push(await uploadTaskAttachment(taskId, file));
            }
            setAttachments((current) => [...current, ...uploaded]);
        } catch (err) {
            setUploadError(getErrorMessage(err, 'AssignedTask attachment upload'));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setActionError('');
        setActionMessage('');
        const links = linksText.split('\n').map((link) => link.trim()).filter(Boolean);
        if (!notes.trim() && !links.length && !attachments.length) {
            setActionError('Add a note, a link, or at least one attachment before submitting.');
            return;
        }
        try {
            await submitTask({
                taskId,
                notes: notes.trim() || undefined,
                links,
                attachments,
            });
            setActionMessage('Submitted for review. You will be notified when the review is complete.');
            await refetch();
        } catch (err) {
            setActionError(getErrorMessage(err, 'AssignedTask submission'));
        }
    };

    if (isLoading) {
        return <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500" role="status"><span className="size-5 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />Loading task…</div>;
    }

    if (isError || !task) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-8">
                <Link href={`${basePath}/tasks`} className="text-sm font-semibold text-blue-700 hover:underline">← Back to tasks</Link>
                <div className="mt-5"><RequestErrorState area="Assigned task details" label="Task details" error={error} onRetry={() => void refetch()} supportHref={`${basePath}/messages`} compact={false} /></div>
            </div>
        );
    }

    const canRespond = task.status === 'assigned';
    const canSubmit = task.status === 'accepted' || task.status === 'revision_requested';
    const waitingForCharge = task.status === 'assigned' && Boolean(task.chargeApprovalRequired);
    const waitingForFunds = task.status === 'assigned' && task.paymentStatus === 'ON_HOLD';
    const isRevision = task.status === 'revision_requested';
    const isCentralTask = task.originSystem === 'MCOM_CENTRAL' || Boolean(task.externalTaskId);
    const money = formatMoney(task);
    const latestReview = task.reviewHistory?.length ? task.reviewHistory[task.reviewHistory.length - 1] : null;
    const reviewHistory = task.reviewHistory ?? [];
    const submission = task.submissionData;
    const hasSubmission = Boolean(submission && (submission.notes || submission.links?.length || submission.attachments?.length));
    const materials = parseTaskMaterials(task.materials);

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Link href={`${basePath}/tasks`} className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
                <span className="material-symbols-outlined text-base">arrow_back</span> Back to tasks
            </Link>

            <article className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">{isCentralTask ? 'Central Hub delegated task' : 'Assigned task'}</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-950">{task.title}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {task.centralBusinessName && <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700"><span className="material-symbols-outlined text-sm">storefront</span>{task.centralBusinessName}</span>}
                            {(task.platforms ?? []).map((platform) => <span key={platform} className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold capitalize text-blue-800">{platform}</span>)}
                            {task.category && <span className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-semibold capitalize text-indigo-800">{task.category} task</span>}
                            {task.projectName && <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800"><span className="material-symbols-outlined text-sm">folder</span>{task.projectName}</span>}
                            {task.taskType && <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">{task.taskType.replaceAll('_', ' ')}</span>}
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[task.status] || statusStyles.assigned}`}>{statusLabel(task.status)}</span>
                        <TaskCountdown dueDate={task.dueDate} status={task.status} />
                    </div>
                </div>

                {isRevision && (
                    <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4" role="status">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-orange-900"><span className="material-symbols-outlined text-base">rate_review</span>Changes requested</p>
                        {task.reviewNotes ? <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-orange-900">{task.reviewNotes}</p> : <p className="mt-1 text-sm text-orange-900">Review the feedback, update your deliverables, and resubmit.</p>}
                        <button
                            type="button"
                            onClick={() => void run(() => acknowledgeReview(taskId), 'Review acknowledged. You can now update your submission.')}
                            disabled={isAcknowledgingReview}
                            className="mt-3 inline-flex min-h-10 items-center gap-1 rounded-lg border border-orange-300 bg-white px-3 text-xs font-semibold text-orange-900 hover:bg-orange-100 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-base">check</span>
                            {isAcknowledgingReview ? 'Acknowledging…' : 'Acknowledge & start revision'}
                        </button>
                    </div>
                )}

                {waitingForFunds && (
                    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4" role="status">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-amber-900">
                            <span className="material-symbols-outlined text-base">lock_clock</span>
                            Waiting for the business to secure funds
                        </p>
                        <p className="mt-1 text-sm leading-6 text-amber-900">
                            This task is assigned to you, but the business has not locked the payment yet. You can see the task and its instructions, but you cannot accept or start it until Central Hub confirms the funds are secured.
                        </p>
                    </div>
                )}

                {task.chargeApprovalRequired && !waitingForFunds && (
                    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4" role="status">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-amber-900">
                            <span className="material-symbols-outlined text-base">lock_clock</span>
                            Waiting for business approval
                        </p>
                        <p className="mt-1 text-sm leading-6 text-amber-900">
                            This is chargeable work{task.businessChargeAmount != null ? ` (${new Intl.NumberFormat(undefined, { style: 'currency', currency: task.businessChargeCurrency || 'GBP' }).format(Number(task.businessChargeAmount))})` : ''}. The business must approve the charge before you can accept the task.
                        </p>
                    </div>
                )}

                <dl className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
                    <div><dt className="text-xs text-slate-500">Task created</dt><dd className="mt-1 font-semibold text-slate-900">{formatDate(task.createdAt)}</dd></div>
                    <div><dt className="text-xs text-slate-500">Deadline</dt><dd className="mt-1 font-semibold text-slate-900">{formatDate(task.dueDate)}</dd></div>
                    {money && <div><dt className="text-xs text-slate-500">Budget</dt><dd className="mt-1 font-semibold text-slate-900">{money}</dd></div>}
                    {task.originSystem && <div><dt className="text-xs text-slate-500">Source</dt><dd className="mt-1 font-semibold text-slate-900">{task.originSystem.replaceAll('_', ' ')}</dd></div>}
                    {task.submittedAt && <div><dt className="text-xs text-slate-500">Last submitted</dt><dd className="mt-1 font-semibold text-slate-900">{formatDate(task.submittedAt)}</dd></div>}
                    {typeof task.revisionCount === 'number' && task.revisionCount > 0 && <div><dt className="text-xs text-slate-500">Revisions</dt><dd className="mt-1 font-semibold text-slate-900">{task.revisionCount}</dd></div>}
                </dl>

                <section className="mt-6">
                    <h2 className="text-base font-semibold text-slate-950">Instructions</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{task.description || 'No additional instructions were provided.'}</p>
                    {task.executionUrl && <a href={task.executionUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">Open work link<span className="material-symbols-outlined text-base">open_in_new</span></a>}
                </section>

                {task.deliverables?.length ? (
                    <section className="mt-6 border-t border-slate-100 pt-5">
                        <h2 className="text-base font-semibold text-slate-950">Agreed deliverables</h2>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {task.deliverables.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </section>
                ) : null}

                {(materials.notes || materials.files.length > 0 || materials.links.length > 0) ? (
                    <section className="mt-6 border-t border-slate-100 pt-5">
                        <h2 className="text-base font-semibold text-slate-950">Materials supplied</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Files and links from the business. Open or download them before you start.
                        </p>

                        {materials.notes ? (
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                {materials.notes}
                            </p>
                        ) : null}

                        {materials.files.length > 0 ? (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {materials.files.map((file) => (
                                    <a
                                        key={file.url}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={file.name}
                                        className="group flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-blue-300 hover:bg-blue-50/40"
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                            <span className="material-symbols-outlined text-lg" aria-hidden="true">
                                                description
                                            </span>
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-slate-900">
                                                {file.name}
                                            </span>
                                            <span className="block text-[11px] text-slate-500">
                                                Download material
                                            </span>
                                        </span>
                                        <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-blue-700" aria-hidden="true">
                                            download
                                        </span>
                                    </a>
                                ))}
                            </div>
                        ) : null}

                        {materials.links.length > 0 ? (
                            <ul className="mt-3 space-y-1.5">
                                {materials.links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                                        >
                                            <span className="material-symbols-outlined text-base" aria-hidden="true">
                                                link
                                            </span>
                                            <span className="truncate">{link}</span>
                                            <span className="material-symbols-outlined text-base" aria-hidden="true">
                                                open_in_new
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </section>
                ) : null}

                {(task.compensationAmount != null || task.compensationModel) && (
                    <section className="mt-6 border-t border-slate-100 pt-5">
                        <h2 className="text-base font-semibold text-slate-950">Compensation</h2>
                        <p className="mt-2 text-sm text-slate-700">
                            {task.compensationModel === 'MEMBERSHIP_INCLUDED'
                                ? 'Included in the CHS membership service arrangement.'
                                : task.compensationAmount != null
                                    ? `${new Intl.NumberFormat(undefined, { style: 'currency', currency: task.compensationCurrency || 'GBP' }).format(Number(task.compensationAmount))} payable on approved completion.`
                                    : 'To be agreed with the account manager before work begins.'}
                        </p>
                        {task.paymentStatus && <p className="mt-1 text-xs capitalize text-slate-500">Payment status: {task.paymentStatus.replaceAll('_', ' ').toLowerCase()}</p>}
                    </section>
                )}

                {task.requiredSkills?.length ? (
                    <section className="mt-6 border-t border-slate-100 pt-5">
                        <h2 className="text-base font-semibold text-slate-950">Requirements</h2>
                        <ul className="mt-2 flex flex-wrap gap-2">
                            {task.requiredSkills.map((skill) => <li key={skill} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">{skill}</li>)}
                        </ul>
                    </section>
                ) : null}

                {reviewHistory.length > 0 && (
                    <section className="mt-6 border-t border-slate-100 pt-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-base font-semibold text-slate-950">Review history</h2>
                            {latestReview && <span className="text-xs text-slate-500">Latest: round {latestReview.round} · {latestReview.decision === 'APPROVED' ? 'approved' : 'changes requested'}</span>}
                        </div>
                        <ul className="mt-3 space-y-2">
                            {[...reviewHistory].reverse().map((entry, index) => <ReviewEntry key={`${entry.round}-${entry.reviewedAt}`} entry={entry} latest={index === 0} />)}
                        </ul>
                    </section>
                )}

                {hasSubmission && (
                    <section className="mt-6 border-t border-slate-100 pt-5">
                        <h2 className="text-base font-semibold text-slate-950">Your submission</h2>
                        {submission?.notes && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{submission.notes}</p>}
                        {submission?.links?.length ? (
                            <ul className="mt-2 space-y-1">
                                {submission.links.map((link) => <li key={link}><a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"><span className="material-symbols-outlined text-base">link</span>{link}</a></li>)}
                            </ul>
                        ) : null}
                        {submission?.attachments?.length ? (
                            <div className="mt-3 flex flex-wrap gap-3">
                                {submission.attachments.map((attachment) => <AttachmentPreview key={attachment.url} attachment={attachment} />)}
                            </div>
                        ) : null}
                    </section>
                )}

                {task.status === 'submitted' && (
                    <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
                        Submitted{task.submittedAt ? ` ${formatDate(task.submittedAt)}` : ''} · awaiting {isCentralTask ? 'Central Hub' : 'administrator'} review.
                    </p>
                )}
                {task.status === 'pending_business_approval' && (
                    <p className="mt-5 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900" role="status">
                        Your work was checked by the account manager and is awaiting the business owner&apos;s approval.
                    </p>
                )}
                {(task.status === 'approved' || task.status === 'completed') && (
                    <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
                        {task.status === 'approved' ? 'Approved' : 'Completed'}{task.completedAt ? ` ${formatDate(task.completedAt)}` : ''}. Thank you for your work.
                    </p>
                )}
                {task.status === 'open' && (
                    <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" role="status">
                        This task is in the open pool. An administrator will assign it before you can accept it.
                    </p>
                )}
                {(task.status === 'declined' || task.status === 'cancelled') && (
                    <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" role="status">
                        This task is {statusLabel(task.status)} and no further action is required.
                    </p>
                )}

                {!isQualified && (canRespond || canSubmit) && (
                    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        Your account needs completed onboarding before you can accept or submit work. <Link href={user?.role === 'agent' ? `${basePath}/assessment` : basePath} className="font-semibold underline">Review qualification</Link>.
                    </div>
                )}
                {actionError && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{actionError}</p>}
                {actionMessage && <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{actionMessage}</p>}

                {canRespond && (
                    <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                        <button type="button" onClick={() => void run(() => acceptTask(taskId), 'Task accepted. You can now work on it and submit it for review when ready.')} disabled={!isQualified || isAccepting || isDeclining || waitingForCharge || waitingForFunds} title={waitingForFunds ? 'The business must lock the funds before you can start' : waitingForCharge ? 'The business must approve the charge first' : undefined} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{isAccepting ? 'Accepting…' : waitingForFunds ? 'Awaiting funds' : waitingForCharge ? 'Awaiting business approval' : 'Accept task'}</button>
                        <button type="button" onClick={() => { setDeclineFormOpen(true); setDeclineError(''); setActionMessage(''); setActionError(''); }} disabled={isAccepting || isDeclining} className="min-h-11 rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Decline</button>
                    </div>
                )}

                {canRespond && declineFormOpen && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <label className="block text-sm font-semibold text-slate-900">
                            Why are you declining this task?
                            <textarea
                                value={declineReason}
                                onChange={(event) => setDeclineReason(event.target.value)}
                                rows={3}
                                maxLength={1000}
                                placeholder="e.g. I do not have the capacity to deliver this before the deadline."
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </label>
                        <p className="mt-1 text-xs text-slate-500">Required. The business and an administrator will see this so they can reassign the task.</p>
                        {declineError && <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-semibold text-red-800" role="alert">{declineError}</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => void handleDecline()}
                                disabled={isDeclining || declineReason.trim().length < 5}
                                className="min-h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeclining ? 'Declining…' : 'Confirm decline'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setDeclineFormOpen(false); setDeclineReason(''); setDeclineError(''); }}
                                disabled={isDeclining}
                                className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {canSubmit && (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">{isRevision ? 'Resubmit your work' : 'Submit your work'}</h2>
                            <p className="mt-1 text-sm text-slate-600">Add notes, links, photos, PDFs or documents. {isCentralTask ? 'Central Hub' : 'An administrator'} will review your submission.</p>
                        </div>

                        <label className="block text-xs font-semibold text-slate-700">
                            Notes for the reviewer
                            <textarea
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                rows={4}
                                maxLength={5000}
                                placeholder="What did you complete? Anything the reviewer should check?"
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </label>

                        <label className="block text-xs font-semibold text-slate-700">
                            Links <span className="font-normal text-slate-500">(one per line)</span>
                            <textarea
                                value={linksText}
                                onChange={(event) => setLinksText(event.target.value)}
                                rows={2}
                                placeholder="https://…"
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </label>

                        <div>
                            <span className="block text-xs font-semibold text-slate-700">Photos, PDFs or documents</span>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.txt,.csv,.xlsx"
                                    onChange={(event) => void handleUpload(event.target.files)}
                                    disabled={isUploading}
                                    className="block w-full max-w-sm text-xs text-slate-600 file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {isUploading && <span className="inline-flex items-center gap-2 text-xs text-slate-500"><span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />Uploading…</span>}
                            </div>
                            {uploadError && <p className="mt-2 text-xs text-red-700" role="alert">{uploadError}</p>}
                            {attachments.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-3">
                                    {attachments.map((attachment) => (
                                        <div key={attachment.url} className="relative">
                                            <AttachmentPreview attachment={attachment} />
                                            <button
                                                type="button"
                                                onClick={() => setAttachments((current) => current.filter((item) => item.url !== attachment.url))}
                                                className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-red-700"
                                                aria-label={`Remove ${attachment.fileName || 'attachment'}`}
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={!isQualified || isSubmitting || isUploading} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                            {isSubmitting ? 'Submitting…' : isRevision ? 'Resubmit for review' : 'Submit for review'}
                        </button>
                    </form>
                )}
            </article>
        </div>
    );
}
