"use client";

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
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
    return Number.isNaN(date.getTime())
        ? 'Not specified'
        : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? null
        : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const formatMoney = (task: { budget?: number; currency?: string; compensationAmount?: number | null; compensationCurrency?: string | null }) => {
    if (task.budget != null && Number.isFinite(Number(task.budget)) && Number(task.budget) > 0) {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: task.currency || 'USD' }).format(Number(task.budget));
    }
    if (task.compensationAmount != null && Number.isFinite(Number(task.compensationAmount)) && Number(task.compensationAmount) > 0) {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: task.compensationCurrency || 'GBP' }).format(Number(task.compensationAmount));
    }
    return null;
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

interface ParsedBrief {
    summary: string;
    instructions: string[];
    deliverables: string[];
    closingNote: string | null;
}

function parseTaskDescription(raw?: string | null, explicitDeliverables?: string[] | null): ParsedBrief {
    const text = (raw || '').trim();
    if (!text) {
        return {
            summary: 'No additional instructions were provided.',
            instructions: [],
            deliverables: explicitDeliverables?.filter(Boolean) ?? [],
            closingNote: null,
        };
    }

    const instructionsIdx = text.search(/\*\*Instructions:?\*\*/i);
    const deliverablesIdx = text.search(/\*\*Deliverables:?\*\*/i);

    if (instructionsIdx === -1 && deliverablesIdx === -1) {
        const lines = text
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
        const bulletLines = lines.filter((l) => /^[-•*]\s+/.test(l)).map((l) => l.replace(/^[-•*]\s+/, '').trim());
        const nonBulletLines = lines.filter((l) => !/^[-•*]\s+/.test(l));
        return {
            summary: nonBulletLines.join('\n') || text.replace(/\*\*([^*]+)\*\*/g, '$1'),
            instructions: bulletLines,
            deliverables: explicitDeliverables?.filter(Boolean) ?? [],
            closingNote: null,
        };
    }

    let summaryPart = text;
    let instructionsPart = '';
    let deliverablesPart = '';

    if (instructionsIdx !== -1 && deliverablesIdx !== -1) {
        if (instructionsIdx < deliverablesIdx) {
            summaryPart = text.slice(0, instructionsIdx);
            instructionsPart = text.slice(instructionsIdx, deliverablesIdx);
            deliverablesPart = text.slice(deliverablesIdx);
        } else {
            summaryPart = text.slice(0, deliverablesIdx);
            deliverablesPart = text.slice(deliverablesIdx, instructionsIdx);
            instructionsPart = text.slice(instructionsIdx);
        }
    } else if (instructionsIdx !== -1) {
        summaryPart = text.slice(0, instructionsIdx);
        instructionsPart = text.slice(instructionsIdx);
    } else if (deliverablesIdx !== -1) {
        summaryPart = text.slice(0, deliverablesIdx);
        deliverablesPart = text.slice(deliverablesIdx);
    }

    const cleanSummary = summaryPart.replace(/\*\*([^*]+)\*\*/g, '$1').trim();

    const rawInstructionsBody = instructionsPart.replace(/^\*\*Instructions:?\*\*/i, '').replace(/\*\*([^*]+)\*\*/g, '$1').trim();
    const instructions = rawInstructionsBody
        ? rawInstructionsBody
              .split(/(?:^|\s+)-\s+|\r?\n/)
              .map((item) => item.trim())
              .filter(Boolean)
        : [];

    const rawDeliverablesBody = deliverablesPart.replace(/^\*\*Deliverables:?\*\*/i, '').replace(/\*\*([^*]+)\*\*/g, '$1').trim();
    let closingNote: string | null = null;
    let deliverablesFromText: string[] = [];

    if (rawDeliverablesBody) {
        const approvalMatch = rawDeliverablesBody.match(/(All deliverables must be[^\n]+)$/i);
        const bodyWithoutClosing = approvalMatch
            ? rawDeliverablesBody.slice(0, approvalMatch.index).trim()
            : rawDeliverablesBody;
        if (approvalMatch) {
            closingNote = approvalMatch[1].trim();
        }
        deliverablesFromText = bodyWithoutClosing
            .split(/(?:^|\s+)\d+\.\s+|\r?\n/)
            .map((item) => item.replace(/^[-•*]\s+/, '').trim())
            .filter(Boolean);
    }

    const mergedDeliverables = Array.from(
        new Set([...(explicitDeliverables?.filter(Boolean) ?? []), ...deliverablesFromText]),
    );

    return {
        summary: cleanSummary,
        instructions,
        deliverables: mergedDeliverables,
        closingNote,
    };
}

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
                    className="h-16 w-16 rounded-lg border border-slate-200 object-cover transition group-hover:opacity-90"
                />
                <span className="mt-1 block max-w-16 truncate text-[10px] text-slate-500">{attachment.fileName || 'Image'}</span>
            </a>
        );
    }
    return (
        <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
        >
            <span className="material-symbols-outlined !text-sm">description</span>
            <span className="max-w-40 truncate">{attachment.fileName || 'Attachment'}</span>
            <span className="material-symbols-outlined !text-xs">open_in_new</span>
        </a>
    );
}

function ReviewEntry({ entry, latest }: { entry: TaskReviewEntry; latest?: boolean }) {
    const approved = entry.decision === 'APPROVED';
    return (
        <li className={`rounded-lg border p-2.5 ${approved ? 'border-emerald-200 bg-emerald-50/60' : 'border-orange-200 bg-orange-50/60'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${approved ? 'text-emerald-800' : 'text-orange-800'}`}>
                    <span className="material-symbols-outlined !text-sm">{approved ? 'check_circle' : 'error'}</span>
                    {approved ? 'Approved' : 'Changes requested'} · Round {entry.round}
                </span>
                <span className="text-[11px] text-slate-500">{formatDateTime(entry.reviewedAt) || ''}</span>
            </div>
            {entry.notes ? <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">{entry.notes}</p> : null}
            {latest && approved && entry.acknowledgedAt ? (
                <p className="mt-1 text-[10px] text-slate-500">Acknowledged {formatDateTime(entry.acknowledgedAt)}</p>
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
    const [instructionsExpanded, setInstructionsExpanded] = useState(true);
    const [deliverablesExpanded, setDeliverablesExpanded] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!task) return;
        setNotes(task.submissionData?.notes ?? '');
        setLinksText((task.submissionData?.links ?? []).join('\n'));
        setAttachments(task.submissionData?.attachments ?? []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task?.id]);

    const parsedBrief = useMemo(
        () => parseTaskDescription(task?.description, task?.deliverables),
        [task?.description, task?.deliverables],
    );

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
        const trimmed = declineReason.trim();
        if (trimmed.length < 5) {
            setDeclineError('Please provide a reason of at least 5 characters for declining this task.');
            return;
        }
        setDeclineError('');
        setActionError('');
        setActionMessage('');
        try {
            await declineTask({ taskId, reason: trimmed });
            setActionMessage('Task declined.');
            setDeclineFormOpen(false);
            setDeclineReason('');
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
        return (
            <div className="flex min-h-[40vh] items-center justify-center gap-2.5 text-xs font-medium text-slate-500" role="status">
                <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
                Loading task workspace…
            </div>
        );
    }

    if (isError || !task) {
        return (
            <div className="mx-auto w-full max-w-[1600px] space-y-3">
                <Link
                    href={`${basePath}/tasks`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                    <span className="material-symbols-outlined !text-sm">arrow_back</span>
                    <span>Back to tasks</span>
                </Link>
                <RequestErrorState
                    area="Assigned task details"
                    label="Task details"
                    error={error}
                    onRetry={() => void refetch()}
                    supportHref={`${basePath}/messages`}
                    compact={false}
                />
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

    const compensationText = money
        ? money
        : task.compensationModel === 'MEMBERSHIP_INCLUDED'
          ? 'Included in membership'
          : 'Agreed with AM';

    const showDistinctProjectName =
        Boolean(task.projectName) &&
        task.projectName?.trim().toLowerCase() !== task.title.trim().toLowerCase();

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-2.5">
            {/* Compact Command Header Card */}
            <header className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-4">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        {/* Title Row */}
                        <div className="flex items-start gap-2">
                            <Link
                                href={`${basePath}/tasks`}
                                aria-label="Back to tasks"
                                title="Back to tasks"
                                className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
                            >
                                <span className="material-symbols-outlined !text-base leading-none">arrow_back</span>
                            </Link>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <h1 className="text-[15px] font-bold leading-snug tracking-tight text-slate-950 sm:text-lg">
                                        {task.title}
                                    </h1>
                                    <span
                                        className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                            statusStyles[task.status] || statusStyles.assigned
                                        }`}
                                    >
                                        {statusLabel(task.status)}
                                    </span>
                                    <TaskCountdown dueDate={task.dueDate} status={task.status} />
                                </div>
                            </div>
                        </div>

                        {/* Full-Width Compact Metadata Chips */}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {task.centralBusinessName && (
                                <span className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                    <span className="material-symbols-outlined !text-xs leading-none">storefront</span>
                                    <span className="truncate">{task.centralBusinessName}</span>
                                </span>
                            )}
                            {isCentralTask && (
                                <span className="whitespace-nowrap rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                    Central Hub
                                </span>
                            )}
                            {task.paymentStatus === 'ON_HOLD' && (
                                <span className="whitespace-nowrap rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                    Awaiting funds
                                </span>
                            )}
                            {task.category && (
                                <span className="whitespace-nowrap rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-indigo-800">
                                    {task.category}
                                </span>
                            )}
                            {showDistinctProjectName && (
                                <span className="inline-flex max-w-[220px] items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 sm:max-w-xs">
                                    <span className="material-symbols-outlined shrink-0 !text-xs leading-none">folder</span>
                                    <span className="truncate">{task.projectName}</span>
                                </span>
                            )}
                            {(task.platforms ?? []).map((platform) => (
                                <span
                                    key={platform}
                                    className="whitespace-nowrap rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-blue-800"
                                >
                                    {platform}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Quick Actions */}
                    {(task.executionUrl || canRespond) && (
                        <div className="hidden shrink-0 items-center gap-2 sm:flex">
                            {task.executionUrl && (
                                <a
                                    href={task.executionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 hover:bg-blue-100"
                                >
                                    <span>Open work link</span>
                                    <span className="material-symbols-outlined !text-sm leading-none">open_in_new</span>
                                </a>
                            )}
                            {canRespond && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void run(
                                                () => acceptTask(taskId),
                                                'Task accepted. You can now work on it and submit it for review when ready.',
                                            )
                                        }
                                        disabled={!isQualified || isAccepting || isDeclining || waitingForCharge || waitingForFunds}
                                        title={waitingForFunds ? 'The business must lock the funds before you can start' : waitingForCharge ? 'The business must approve the charge first' : undefined}
                                        className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-700 px-3.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined !text-sm leading-none">check_circle</span>
                                        <span>{isAccepting ? 'Accepting…' : waitingForFunds ? 'Awaiting funds' : waitingForCharge ? 'Awaiting charge approval' : 'Accept task'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeclineFormOpen(true);
                                            setDeclineError('');
                                            setActionMessage('');
                                            setActionError('');
                                        }}
                                        disabled={isAccepting || isDeclining}
                                        className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        <span>{isDeclining ? 'Declining…' : 'Decline'}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Compact 4-Column Key Facts Strip */}
                <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-xs sm:grid-cols-4 sm:px-3">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="material-symbols-outlined shrink-0 !text-sm text-slate-400">calendar_today</span>
                        <div className="min-w-0">
                            <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Created</dt>
                            <dd className="truncate font-semibold text-slate-900">{formatDate(task.createdAt)}</dd>
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="material-symbols-outlined shrink-0 !text-sm text-amber-500">event</span>
                        <div className="min-w-0">
                            <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Deadline</dt>
                            <dd className="truncate font-semibold text-slate-900">{formatDate(task.dueDate)}</dd>
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="material-symbols-outlined shrink-0 !text-sm text-emerald-600">payments</span>
                        <div className="min-w-0">
                            <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Compensation</dt>
                            <dd className="truncate font-semibold text-slate-900">{compensationText}</dd>
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5">
                        <span className="material-symbols-outlined shrink-0 !text-sm text-blue-600">hub</span>
                        <div className="min-w-0">
                            <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Source</dt>
                            <dd className="truncate font-semibold text-slate-900">
                                {task.originSystem ? task.originSystem.replaceAll('_', ' ') : '247GBS Direct'}
                            </dd>
                        </div>
                    </div>
                </dl>

                {/* Mobile Full-Width Action Bar */}
                {(task.executionUrl || canRespond) && (
                    <div className="mt-2.5 flex items-center gap-2 sm:hidden">
                        {canRespond && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        void run(
                                            () => acceptTask(taskId),
                                            'Task accepted. You can now work on it and submit it for review when ready.',
                                        )
                                    }
                                    disabled={!isQualified || isAccepting || isDeclining || waitingForCharge || waitingForFunds}
                                    title={waitingForFunds ? 'The business must lock the funds before you can start' : waitingForCharge ? 'The business must approve the charge first' : undefined}
                                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined !text-sm leading-none">check_circle</span>
                                    <span>{isAccepting ? 'Accepting…' : waitingForFunds ? 'Awaiting funds' : waitingForCharge ? 'Awaiting approval' : 'Accept task'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeclineFormOpen(true);
                                        setDeclineError('');
                                        setActionMessage('');
                                        setActionError('');
                                    }}
                                    disabled={isAccepting || isDeclining}
                                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <span>{isDeclining ? 'Declining…' : 'Decline'}</span>
                                </button>
                            </>
                        )}
                        {task.executionUrl && (
                            <a
                                href={task.executionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 hover:bg-blue-100"
                            >
                                <span>Open work link</span>
                                <span className="material-symbols-outlined !text-sm leading-none">open_in_new</span>
                            </a>
                        )}
                    </div>
                )}

                {/* Decline Reason Form */}
                {canRespond && declineFormOpen && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
                        <label className="block text-xs font-bold text-slate-900">
                            Why are you declining this task?
                            <textarea
                                value={declineReason}
                                onChange={(event) => setDeclineReason(event.target.value)}
                                rows={3}
                                maxLength={1000}
                                placeholder="e.g. I do not have the capacity to deliver this before the deadline."
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                        </label>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Required (minimum 5 characters). The business and account manager will see this so they can reassign the task.
                        </p>
                        {declineError && (
                            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-800" role="alert">
                                {declineError}
                            </p>
                        )}
                        <div className="mt-2.5 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => void handleDecline()}
                                disabled={isDeclining || declineReason.trim().length < 5}
                                className="inline-flex h-8 items-center rounded-lg bg-red-600 px-3.5 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeclining ? 'Declining…' : 'Confirm decline'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDeclineFormOpen(false);
                                    setDeclineReason('');
                                    setDeclineError('');
                                }}
                                disabled={isDeclining}
                                className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Inline Banners for Alerts / Feedback */}
                {actionError && (
                    <p className="mt-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800" role="alert">
                        {actionError}
                    </p>
                )}
                {actionMessage && (
                    <p className="mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800" role="status">
                        {actionMessage}
                    </p>
                )}
                {isRevision && (
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2" role="status">
                        <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1 text-xs font-bold text-orange-900">
                                <span className="material-symbols-outlined !text-sm">rate_review</span>
                                Changes requested
                            </p>
                            <p className="mt-0.5 text-xs text-orange-900">
                                {task.reviewNotes || 'Review the feedback, update your deliverables, and resubmit.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                void run(
                                    () => acknowledgeReview(taskId),
                                    'Review acknowledged. You can now update your submission.',
                                )
                            }
                            disabled={isAcknowledgingReview}
                            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-orange-300 bg-white px-2.5 text-[11px] font-bold text-orange-900 hover:bg-orange-100 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined !text-sm">check</span>
                            {isAcknowledgingReview ? 'Acknowledging…' : 'Acknowledge & start revision'}
                        </button>
                    </div>
                )}
                {task.chargeApprovalRequired && (
                    <p className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900" role="status">
                        This task incurs an extra charge that the business must approve before you can accept or work on it.
                    </p>
                )}
                {waitingForFunds && (
                    <p className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900" role="status">
                        The business must lock the funds in escrow before you can accept or begin work on this task.
                    </p>
                )}
                {!isQualified && (
                    <p className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900" role="status">
                        Complete your verification, onboarding and quiz before accepting or submitting tasks.
                    </p>
                )}
            </header>

            {/* 12-Column Main Workspace */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                {/* Left Column: Instructions, Deliverables & Materials (7 or 8 cols) */}
                <div className="space-y-3 lg:col-span-7 xl:col-span-8">
                    {/* Instructions Card (Collapsible) */}
                    <section className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
                        <button
                            type="button"
                            onClick={() => setInstructionsExpanded((prev) => !prev)}
                            aria-expanded={instructionsExpanded}
                            className="flex w-full items-center justify-between gap-2 text-left"
                        >
                            <div className="flex items-center gap-2">
                                <span className="inline-flex size-6 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                                    <span className="material-symbols-outlined !text-sm leading-none">description</span>
                                </span>
                                <h2 className="text-sm font-bold text-slate-950">Instructions & Brief</h2>
                            </div>
                            <span className="inline-flex size-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                <span className="material-symbols-outlined !text-base leading-none">
                                    {instructionsExpanded ? 'expand_less' : 'expand_more'}
                                </span>
                            </span>
                        </button>

                        {instructionsExpanded && (
                            <div className="mt-2.5 space-y-2.5 border-t border-slate-100 pt-2.5">
                                {parsedBrief.summary && (
                                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 sm:text-[13px]">
                                        {parsedBrief.summary}
                                    </p>
                                )}

                                {parsedBrief.instructions.length > 0 && (
                                    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 sm:p-3">
                                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Step-by-step instructions ({parsedBrief.instructions.length})
                                        </h3>
                                        <ul className="mt-1.5 space-y-1.5">
                                            {parsedBrief.instructions.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
                                                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-blue-600" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Agreed Deliverables Card (Collapsible) */}
                    {parsedBrief.deliverables.length > 0 && (
                        <section className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
                            <button
                                type="button"
                                onClick={() => setDeliverablesExpanded((prev) => !prev)}
                                aria-expanded={deliverablesExpanded}
                                className="flex w-full items-center justify-between gap-2 text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                                        <span className="material-symbols-outlined !text-sm leading-none">checklist</span>
                                    </span>
                                    <h2 className="text-sm font-bold text-slate-950">
                                        Agreed Deliverables ({parsedBrief.deliverables.length})
                                    </h2>
                                </div>
                                <span className="inline-flex size-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                    <span className="material-symbols-outlined !text-base leading-none">
                                        {deliverablesExpanded ? 'expand_less' : 'expand_more'}
                                    </span>
                                </span>
                            </button>

                            {deliverablesExpanded && (
                                <div className="mt-2.5 border-t border-slate-100 pt-2.5">
                                    <ol className="space-y-1.5">
                                        {parsedBrief.deliverables.map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2 text-xs leading-5 text-slate-700"
                                            >
                                                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                                    {idx + 1}
                                                </span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    {parsedBrief.closingNote && (
                                        <p className="mt-2 text-[11px] font-medium text-slate-500">
                                            {parsedBrief.closingNote}
                                        </p>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Materials Supplied */}
                    {(materials.notes || materials.files.length > 0 || materials.links.length > 0 || task.materials) ? (
                        <section className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex size-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
                                    <span className="material-symbols-outlined !text-sm leading-none">folder_open</span>
                                </span>
                                <h2 className="text-sm font-bold text-slate-950">Materials Supplied</h2>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Files and links from the business. Open or download them before you start.
                            </p>

                            {materials.notes ? (
                                <p className="mt-2.5 whitespace-pre-wrap border-t border-slate-100 pt-2 text-xs leading-5 text-slate-700">
                                    {materials.notes}
                                </p>
                            ) : task.materials && typeof task.materials === 'string' && !materials.files.length && !materials.links.length ? (
                                <p className="mt-2.5 whitespace-pre-wrap border-t border-slate-100 pt-2 text-xs leading-5 text-slate-700">
                                    {task.materials}
                                </p>
                            ) : null}

                            {materials.files.length > 0 ? (
                                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                                    {materials.files.map((file) => (
                                        <a
                                            key={file.url}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={file.name}
                                            className="group flex min-h-12 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 transition hover:border-blue-300 hover:bg-blue-50/40"
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-700">
                                                <span className="material-symbols-outlined !text-base" aria-hidden="true">
                                                    description
                                                </span>
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-xs font-semibold text-slate-900">
                                                    {file.name}
                                                </span>
                                                <span className="block text-[10px] text-slate-500">
                                                    Download material
                                                </span>
                                            </span>
                                            <span className="material-symbols-outlined !text-base text-slate-400 group-hover:text-blue-700" aria-hidden="true">
                                                download
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            ) : null}

                            {materials.links.length > 0 ? (
                                <ul className="mt-2.5 space-y-1.5">
                                    {materials.links.map((link) => (
                                        <li key={link}>
                                            <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                            >
                                                <span className="material-symbols-outlined !text-sm" aria-hidden="true">
                                                    link
                                                </span>
                                                <span className="truncate">{link}</span>
                                                <span className="material-symbols-outlined !text-xs" aria-hidden="true">
                                                    open_in_new
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </section>
                    ) : null}
                </div>

                {/* Right Column: Action Studio, Skills, Compensation & Reviews (4-5 cols) */}
                <div className="space-y-3 lg:col-span-5 xl:col-span-4">
                    {/* Task Action / Submission Studio Card */}
                    <section
                        className={`rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 ${
                            canRespond && !canSubmit ? 'hidden lg:block' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-sm font-bold text-slate-950">
                                {canSubmit
                                    ? isRevision
                                        ? 'Resubmit Deliverables'
                                        : 'Submit Deliverables'
                                    : canRespond
                                      ? 'Respond to Assignment'
                                      : 'Task Status'}
                            </h2>
                            {task.submittedAt && (
                                <span className="text-[11px] text-slate-500">
                                    Submitted {formatDate(task.submittedAt)}
                                </span>
                            )}
                        </div>

                        {canRespond && (
                            <div className="mt-2.5 border-t border-slate-100 pt-2.5">
                                <p className="text-xs leading-5 text-slate-600">
                                    Review the instructions and deliverables on the left. Accept the task to unlock the deliverable submission form.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void run(
                                                () => acceptTask(taskId),
                                                'Task accepted. You can now work on it and submit it for review when ready.',
                                            )
                                        }
                                        disabled={!isQualified || isAccepting || isDeclining || waitingForCharge || waitingForFunds}
                                        title={waitingForFunds ? 'The business must lock the funds before you can start' : waitingForCharge ? 'The business must approve the charge first' : undefined}
                                        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined !text-sm">check_circle</span>
                                        <span>{isAccepting ? 'Accepting…' : waitingForFunds ? 'Awaiting funds' : waitingForCharge ? 'Awaiting approval' : 'Accept task'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeclineFormOpen(true);
                                            setDeclineError('');
                                            setActionMessage('');
                                            setActionError('');
                                        }}
                                        disabled={isAccepting || isDeclining}
                                        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        <span>{isDeclining ? 'Declining…' : 'Decline'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {canSubmit && (
                            <form onSubmit={handleSubmit} className="mt-2.5 space-y-3 border-t border-slate-100 pt-2.5">
                                <div>
                                    <label htmlFor="submission-notes" className="block text-xs font-semibold text-slate-700">
                                        Notes for the reviewer
                                    </label>
                                    <textarea
                                        id="submission-notes"
                                        rows={3}
                                        value={notes}
                                        onChange={(event) => setNotes(event.target.value)}
                                        placeholder="Describe what you completed, where files are hosted, or context for the review…"
                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="submission-links" className="block text-xs font-semibold text-slate-700">
                                        Deliverable links <span className="font-normal text-slate-400">(one per line)</span>
                                    </label>
                                    <textarea
                                        id="submission-links"
                                        rows={2}
                                        value={linksText}
                                        onChange={(event) => setLinksText(event.target.value)}
                                        placeholder="https://docs.google.com/…&#10;https://figma.com/…"
                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <span className="block text-xs font-semibold text-slate-700">Attachments</span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(event) => void handleUpload(event.target.files)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-3 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined !text-sm">upload_file</span>
                                        <span>{isUploading ? 'Uploading…' : 'Attach screenshots, PDFs or documents'}</span>
                                    </button>
                                    {uploadError && (
                                        <p className="mt-1 text-xs text-red-600" role="alert">
                                            {uploadError}
                                        </p>
                                    )}

                                    {attachments.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {attachments.map((attachment) => (
                                                <div key={attachment.url} className="relative">
                                                    <AttachmentPreview attachment={attachment} />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setAttachments((current) =>
                                                                current.filter((item) => item.url !== attachment.url),
                                                            )
                                                        }
                                                        className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-xs hover:text-red-700"
                                                        aria-label={`Remove ${attachment.fileName || 'attachment'}`}
                                                    >
                                                        <span className="material-symbols-outlined !text-xs">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isQualified || isSubmitting || isUploading}
                                    className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined !text-sm">send</span>
                                    <span>{isSubmitting ? 'Submitting…' : isRevision ? 'Resubmit for review' : 'Submit for review'}</span>
                                </button>
                            </form>
                        )}

                        {task.status === 'submitted' && (
                            <p className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900" role="status">
                                Submitted{task.submittedAt ? ` ${formatDate(task.submittedAt)}` : ''} · awaiting {isCentralTask ? 'Central Hub' : 'administrator'} review.
                            </p>
                        )}
                        {task.status === 'pending_business_approval' && (
                            <p className="mt-2.5 rounded-lg border border-violet-200 bg-violet-50 p-2.5 text-xs text-violet-900" role="status">
                                Checked by the account manager and awaiting business owner approval.
                            </p>
                        )}
                        {(task.status === 'approved' || task.status === 'completed') && (
                            <p className="mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-900" role="status">
                                {task.status === 'approved' ? 'Approved' : 'Completed'}
                                {task.completedAt ? ` ${formatDate(task.completedAt)}` : ''}. Thank you for your work.
                            </p>
                        )}
                        {task.status === 'open' && (
                            <p className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700" role="status">
                                This task is in the open pool. An administrator will assign it before you can accept it.
                            </p>
                        )}
                        {(task.status === 'declined' || task.status === 'cancelled') && (
                            <p className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700" role="status">
                                This task is {statusLabel(task.status)} and no further action is required.
                            </p>
                        )}
                    </section>

                    {/* Requirements & Compensation Side Card */}
                    <section className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Requirements & Compensation
                        </h2>

                        <div className="mt-2.5 space-y-2.5">
                            <div>
                                <p className="text-[11px] font-semibold text-slate-700">Payout arrangement</p>
                                <p className="mt-0.5 text-xs text-slate-600">
                                    {task.compensationModel === 'MEMBERSHIP_INCLUDED'
                                        ? 'Included in the CHS membership service arrangement.'
                                        : task.compensationAmount != null && Number(task.compensationAmount) > 0
                                          ? `${new Intl.NumberFormat(undefined, { style: 'currency', currency: task.compensationCurrency || 'GBP' }).format(Number(task.compensationAmount))} payable on approved completion.`
                                          : money
                                            ? `${money} task budget.`
                                            : 'To be agreed with the account manager before work begins.'}
                                </p>
                                {task.paymentStatus && (
                                    <p className="mt-0.5 text-[11px] capitalize text-slate-400">
                                        Payment status: {task.paymentStatus.replaceAll('_', ' ').toLowerCase()}
                                    </p>
                                )}
                            </div>

                            {task.requiredSkills?.length ? (
                                <div className="border-t border-slate-100 pt-2.5">
                                    <p className="text-[11px] font-semibold text-slate-700">
                                        Required skills ({task.requiredSkills.length})
                                    </p>
                                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                                        {task.requiredSkills.map((skill) => (
                                            <li
                                                key={skill}
                                                className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800"
                                            >
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    </section>

                    {/* Your Submission Summary */}
                    {hasSubmission && (
                        <section className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
                            <h2 className="text-sm font-bold text-slate-950">Your Submission</h2>
                            {submission?.notes && (
                                <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">
                                    {submission.notes}
                                </p>
                            )}
                            {submission?.links?.length ? (
                                <ul className="mt-2 space-y-1">
                                    {submission.links.map((link) => (
                                        <li key={link}>
                                            <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                                            >
                                                <span className="material-symbols-outlined !text-sm">link</span>
                                                <span className="truncate">{link}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                            {submission?.attachments?.length ? (
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {submission.attachments.map((attachment) => (
                                        <AttachmentPreview key={attachment.url} attachment={attachment} />
                                    ))}
                                </div>
                            ) : null}
                        </section>
                    )}

                    {/* Review History */}
                    {reviewHistory.length > 0 && (
                        <section className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 className="text-sm font-bold text-slate-950">Review History</h2>
                                {latestReview && (
                                    <span className="text-[11px] text-slate-500">
                                        Round {latestReview.round} · {latestReview.decision === 'APPROVED' ? 'approved' : 'changes requested'}
                                    </span>
                                )}
                            </div>
                            <ul className="mt-2.5 space-y-2">
                                {[...reviewHistory].reverse().map((entry, index) => (
                                    <ReviewEntry key={`${entry.round}-${entry.reviewedAt}`} entry={entry} latest={index === 0} />
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
