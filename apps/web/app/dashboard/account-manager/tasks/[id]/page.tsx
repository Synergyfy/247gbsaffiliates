'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import {
    useTask,
    useManagedTask,
    useManagedTasks,
    useTasks,
    useDelegatableAgents,
    Task,
    TaskAttachment,
    TaskReviewEntry
} from '@/hooks/useTasks';
import { useAuthStore } from '@/store/useAuthStore';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';

type DetailedTask = Task & {
    business?: { businessName?: string };
    project?: { title?: string };
    dueAt?: string | null;
    attachments?: TaskAttachment[];
    reviews?: TaskReviewEntry[];
    assignee?: { name?: string; email?: string };
    assignedAgentName?: string | null;
    assignedAgentEmail?: string | null;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string') {
        return (err as any).message;
    }
    return fallback;
};

const formatDate = (val?: string | null) => {
    if (!val) return 'Not set';
    const d = new Date(val);
    return isNaN(d.getTime()) ? 'Not set' : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
};

const formatCurrency = (amount?: number | null, currency?: string | null) => {
    const curr = (currency || 'EUR').toUpperCase();
    const val = Number(amount || 0);
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: curr, maximumFractionDigits: 2 }).format(val);
    } catch {
        return `${curr} ${val.toFixed(2)}`;
    }
};

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    open: { label: 'Open', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', dot: 'bg-sky-500' },
    assigned: { label: 'Assigned', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
    accepted: { label: 'Accepted', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    in_progress: { label: 'In Progress', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    submitted: { label: 'Submitted for Review', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
    pending_business_approval: { label: 'Awaiting Business Approval', bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200', dot: 'bg-violet-500' },
    revision_requested: { label: 'Revision Requested', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    closed: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
    declined: { label: 'Declined', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};

export default function AccountManagerTaskDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const taskId = params.id;
    const { user } = useAuthStore();

    // Data fetching
    const { data: localTask, isLoading: isLoadingLocal, isError: isErrorLocal, error: localError, refetch: refetchLocal } = useTask(taskId, Boolean(taskId && user?.id));
    const managedTaskId = localTask?.externalTaskId || taskId;
    const { data: managedTask, isLoading: isLoadingManaged, refetch: refetchManaged } = useManagedTask(managedTaskId, Boolean(managedTaskId && user?.id));
    const { tasks: cachedTasks = [] } = useTasks({ limit: 100 });
    const { data: delegatableAgents = [] } = useDelegatableAgents(Boolean(user?.id));

    // Fallback: If GET /tasks/:id returns 404 (because task is unassigned or open), use cached list record
    const fallbackTask = cachedTasks.find((t) => t.id === taskId);
    const task = (managedTask || localTask || fallbackTask) as DetailedTask | null;

    // Mutations
    const { reviewTask, isReviewing, assignTask, isAssigningTask } = useManagedTasks();
    const { updateTaskStatus, isUpdatingStatus } = useTasks({ enabled: false });

    // Local form state
    const [reviewNotes, setReviewNotes] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const [actionError, setActionError] = useState('');

    const isLoading = (isLoadingLocal && !task) || (Boolean(localTask?.externalTaskId) && isLoadingManaged);

    if (isLoading) {
        return (
            <div className="mx-auto flex min-h-[40vh] max-w-5xl items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading task and campaign details...
            </div>
        );
    }

    if (!task) {
        return (
            <div className="mx-auto max-w-5xl space-y-3 p-4">
                <Link
                    href="/dashboard/account-manager/campaigns"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to Campaigns
                </Link>
                <RequestErrorState
                    area="Account Manager Task Details"
                    label="Task details"
                    error={localError}
                    onRetry={() => void refetchLocal()}
                    supportHref="/dashboard/account-manager/messages"
                />
            </div>
        );
    }

    const normalizedStatus = (task.status || 'open').toLowerCase().replace(/\s+/g, '_');
    const statusMeta = statusConfig[normalizedStatus] || {
        label: task.status?.replaceAll('_', ' ') || 'Unknown',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
    };

    const submission = task.submissionData;
    const isSubmitted = normalizedStatus === 'submitted';
    const isPendingClient = normalizedStatus === 'pending_business_approval';
    const isCompleted = normalizedStatus === 'completed' || normalizedStatus === 'approved';

    const handleReviewAction = async (decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
        setActionError('');
        setActionSuccess('');
        try {
            if (task.externalTaskId || managedTask?.id) {
                await reviewTask({
                    taskId: task.externalTaskId || managedTask?.id || taskId,
                    decision,
                    notes: reviewNotes.trim() || undefined,
                });
            } else {
                await updateTaskStatus({
                    taskId,
                    status: decision === 'APPROVED' ? 'completed' : 'revision_requested',
                });
            }

            setActionSuccess(
                decision === 'APPROVED'
                    ? task.requiresBusinessApproval
                        ? 'Deliverables verified and forwarded to the business owner for sign-off.'
                        : 'Deliverables approved and marked complete. Payment processing initiated.'
                    : 'Changes requested. The assigned specialist has been notified.'
            );
            setReviewNotes('');
            await Promise.allSettled([refetchLocal(), refetchManaged?.()]);
        } catch (err) {
            setActionError(getErrorMessage(err, 'Failed to complete review.'));
        }
    };

    const handleAssignAgent = async () => {
        if (!selectedAgentId) return;
        setActionError('');
        setActionSuccess('');
        try {
            if (task.externalTaskId || managedTask?.id) {
                await assignTask({
                    taskId: task.externalTaskId || managedTask?.id || taskId,
                    assigneeUserId: selectedAgentId,
                });
            } else {
                await apiClient.post(`/tasks/${taskId}/assign`, { agentId: selectedAgentId });
            }
            setActionSuccess('Specialist assigned successfully.');
            setSelectedAgentId('');
            await Promise.allSettled([refetchLocal(), refetchManaged?.()]);
        } catch (err) {
            setActionError(getErrorMessage(err, 'Failed to assign specialist.'));
        }
    };

    return (
        <div className="mx-auto w-full max-w-[1400px] space-y-4 px-3 py-4 sm:px-5 sm:py-5 lg:px-7 font-display">

            {/* Top Navigation & Breadcrumbs */}
            <nav className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-200/70">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Link
                        href="/dashboard/account-manager/campaigns"
                        className="inline-flex items-center gap-1 hover:text-blue-700 transition-colors"
                    >
                        <span className="material-symbols-outlined !text-sm">arrow_back</span>
                        <span>Back to Campaigns</span>
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-slate-800 truncate max-w-[240px] sm:max-w-[400px]">
                        {task.title}
                    </span>
                </div>

                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                    <span className={`size-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                </span>
            </nav>

            {/* Header section with compact meta chips */}
            <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg sm:text-xl font-bold font-display text-slate-950 tracking-tight">
                                {task.title}
                            </h1>
                            {task.originSystem === 'MCOM_CENTRAL' && (
                                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60 uppercase">
                                    Central Hub
                                </span>
                            )}
                            {task.category && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                                    {task.category}
                                </span>
                            )}
                        </div>

                        {/* Metadata row */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                            {(task.centralBusinessName || task.business?.businessName) && (
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                    <span className="material-symbols-outlined text-sm text-slate-400">storefront</span>
                                    {task.centralBusinessName || task.business?.businessName}
                                </span>
                            )}
                            {(task.projectName || task.project?.title) && (
                                <span className="inline-flex items-center gap-1 text-slate-600">
                                    <span className="material-symbols-outlined text-sm text-slate-400">folder</span>
                                    Project: {task.projectName || task.project?.title}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-slate-600">
                                <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
                                Due: {formatDate(task.dueDate || task.dueAt)}
                            </span>
                            <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                                <span className="material-symbols-outlined text-sm text-slate-400">payments</span>
                                Budget: {formatCurrency(Number(task.budget || 0), task.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Action Feedback alerts */}
            {actionSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                    <span>{actionSuccess}</span>
                    <button type="button" onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-900">
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
            )}
            {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-800 flex items-center justify-between">
                    <span>{actionError}</span>
                    <button type="button" onClick={() => setActionError('')} className="text-red-700 hover:text-red-900">
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
            )}

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Left Column: Scope, Submission & Evidence, History (8 cols) */}
                <div className="lg:col-span-8 space-y-4">

                    {/* 1. Campaign Scope & Instructions */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-primary">description</span>
                                Campaign Scope & Briefing
                            </h2>
                            {task.executionUrl && (
                                <a
                                    href={task.executionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                >
                                    <span>External Work Link</span>
                                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                                </a>
                            )}
                        </div>

                        <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                            {task.description || 'No description provided.'}
                        </div>

                        {/* Deliverables / Scope list */}
                        {Boolean(task.deliverables?.length) && (
                            <div className="rounded-lg bg-slate-50 border border-slate-200/60 p-3 space-y-1.5">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Agreed Deliverables Checklist
                                </h3>
                                <ul className="space-y-1 text-xs text-slate-700">
                                    {(task.deliverables as string[]).map((del, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5">check_circle</span>
                                            <span>{del}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Skills & Platforms Chips */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                            {(task.requiredSkills ?? []).length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Skills:</span>
                                    {task.requiredSkills?.map((s) => (
                                        <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {(task.platforms ?? []).length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Platforms:</span>
                                    {task.platforms?.map((p) => (
                                        <span key={p} className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 capitalize">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 2. Specialist Deliverables & Evidence Submission */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-primary">fact_check</span>
                                Specialist Deliverables & Evidence
                            </h2>
                            {task.submittedAt && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                    Submitted {formatDate(task.submittedAt)}
                                </span>
                            )}
                        </div>

                        {submission || (task.attachments?.length || (task.submissionData as any)?.links?.length) ? (
                            <div className="space-y-3">
                                {/* Written notes */}
                                {submission?.notes && (
                                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/60">
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                            Specialist Handover Notes
                                        </h3>
                                        <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                                            {submission.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Links */}
                                {Boolean(submission?.links?.length) && submission?.links && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Submitted Links
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {submission.links.map((link: string, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-primary hover:bg-slate-50 hover:underline"
                                                >
                                                    <span className="material-symbols-outlined text-sm">link</span>
                                                    <span className="truncate max-w-xs">{link}</span>
                                                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* File Attachments */}
                                {Boolean(submission?.attachments?.length || task.attachments?.length) && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Attachments & Proof Files
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {(submission?.attachments || task.attachments || []).map((att: TaskAttachment, i: number) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="flex size-7 items-center justify-center rounded bg-white text-slate-500 border border-slate-200/70">
                                                            <span className="material-symbols-outlined text-sm">
                                                                {att.kind === 'IMAGE' ? 'image' : 'description'}
                                                            </span>
                                                        </span>
                                                        <div className="min-w-0 truncate">
                                                            <p className="font-semibold text-slate-800 truncate" title={att.fileName}>
                                                                {att.fileName || 'Attachment'}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 uppercase">{att.kind || 'File'}</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={att.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:text-primary font-semibold text-[10px] shrink-0"
                                                    >
                                                        View
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center text-xs text-slate-500">
                                <span className="material-symbols-outlined text-2xl text-slate-400 block mb-1.5">
                                    {(task.assignedAgent || task.assignedAgentId || task.assignee || task.assignedAgentEmail) ? 'hourglass_top' : 'person_add'}
                                </span>
                                <p className="font-semibold text-slate-700">
                                    {(task.assignedAgent || task.assignedAgentId || task.assignee || task.assignedAgentEmail)
                                        ? 'No deliverables submitted yet'
                                        : 'No specialist assigned yet'}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    {(task.assignedAgent || task.assignedAgentId || task.assignee || task.assignedAgentEmail)
                                        ? 'The assigned specialist is currently executing this campaign.'
                                        : 'Select and assign an affiliate agent in the panel to begin execution.'}
                                </p>
                            </div>
                        )}
                    </section>

                    {/* 3. Review History & Audit Trail */}
                    {Boolean(task.reviews?.length || task.reviewHistory?.length) && (
                        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                                Review & Verification Trail
                            </h2>
                            <div className="space-y-2">
                                {(task.reviews || task.reviewHistory || []).map((rev: TaskReviewEntry, i: number) => (
                                    <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${rev.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {rev.decision === 'APPROVED' ? 'Approved' : 'Changes Requested'}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {formatDate(rev.reviewedAt || (rev as any).createdAt)}
                                            </span>
                                        </div>
                                        {rev.notes && <p className="text-slate-700 leading-normal">{rev.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column: AM Action Panel, Specialist Allocation, Financials (4 cols) */}
                <div className="lg:col-span-4 space-y-4">

                    {/* AM Review & Decision Action Card */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                            <span>Account Manager Actions</span>
                            <span className="material-symbols-outlined text-base text-primary">rate_review</span>
                        </h2>

                        {isSubmitted ? (
                            <div className="space-y-3">
                                <p className="text-xs leading-relaxed text-slate-600">
                                    The specialist has submitted deliverables. Inspect the evidence and either approve or request revisions.
                                </p>

                                <div className="space-y-1">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                        Feedback / Review Notes
                                    </label>
                                    <textarea
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Add notes for the specialist or instructions for the business owner..."
                                        rows={3}
                                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-primary resize-y"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => void handleReviewAction('APPROVED')}
                                        disabled={isReviewing || isUpdatingStatus}
                                        className="h-9 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                                    >
                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                        {isReviewing ? 'Processing...' : task.requiresBusinessApproval ? 'Approve & Forward to Business' : 'Approve & Complete'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => void handleReviewAction('CHANGES_REQUESTED')}
                                        disabled={isReviewing || isUpdatingStatus}
                                        className="h-9 w-full rounded-lg border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-base">edit_note</span>
                                        Request Revisions
                                    </button>
                                </div>

                                {task.requiresBusinessApproval && (
                                    <p className="text-[10px] text-slate-500 leading-tight">
                                        Note: Approving will forward the deliverables to the business owner on Central Hub for final settlement.
                                    </p>
                                )}
                            </div>
                        ) : isPendingClient ? (
                            <div className="rounded-lg bg-violet-50 border border-violet-200 p-3 text-xs text-violet-900 space-y-1">
                                <p className="font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    Waiting for Client Sign-Off
                                </p>
                                <p className="text-[11px] text-violet-800 leading-relaxed">
                                    You have approved these deliverables. The task is currently with the business owner on Central Hub for final verification and release of funds.
                                </p>
                            </div>
                        ) : isCompleted ? (
                            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 space-y-1">
                                <p className="font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    Task Successfully Completed
                                </p>
                                <p className="text-[11px] text-emerald-800">
                                    Deliverables approved and payment settled to the specialist.
                                </p>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-500 space-y-2">
                                <p>Current Status: <strong className="text-slate-800 capitalize">{statusMeta.label}</strong></p>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Review actions will become active once the assigned specialist submits deliverables.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Specialist Assignment Card */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                            Assigned Specialist
                        </h2>

                        {task.assignedAgent || task.assignee || task.assignedAgentName ? (
                            <div className="flex items-center gap-2.5">
                                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                    {(task.assignedAgent?.firstName?.[0] || task.assignedAgentName?.[0] || 'S').toUpperCase()}
                                </div>
                                <div className="min-w-0 text-xs">
                                    <p className="font-bold text-slate-900 truncate">
                                        {[task.assignedAgent?.firstName, task.assignedAgent?.lastName].filter(Boolean).join(' ') ||
                                            task.assignedAgentName ||
                                            task.assignee?.name ||
                                            task.assignedAgent?.email}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate">
                                        {task.assignedAgent?.email || task.assignedAgentEmail || 'Qualified Specialist'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                <p className="text-xs text-slate-500">No specialist currently assigned.</p>
                                <select
                                    value={selectedAgentId}
                                    onChange={(e) => setSelectedAgentId(e.target.value)}
                                    className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none"
                                >
                                    <option value="">Select a specialist...</option>
                                    {delegatableAgents.map((ag) => (
                                        <option key={ag.id} value={ag.id}>
                                            {ag.name} ({ag.role})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => void handleAssignAgent()}
                                    disabled={!selectedAgentId || isAssigningTask}
                                    className="h-8 w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    {isAssigningTask ? 'Assigning...' : 'Assign Specialist'}
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Financial & Escrow Overview */}
                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                            Budget & Protection
                        </h2>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Agreed Budget:</span>
                                <span className="font-bold text-slate-900">{formatCurrency(Number(task.budget || 0), task.currency)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Payment Status:</span>
                                <span className={`font-bold text-[10px] px-2 py-0.5 rounded uppercase ${task.paymentStatus === 'PAID' || isCompleted
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : task.paymentStatus === 'ON_HOLD'
                                            ? 'bg-amber-50 text-amber-700'
                                            : 'bg-slate-100 text-slate-700'
                                    }`}>
                                    {task.paymentStatus || (isCompleted ? 'PAID' : 'ESCROW_HELD')}
                                </span>
                            </div>

                            {Boolean((task as any).businessChargePence) && (
                                <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                                    <span className="text-slate-500">Business Charge:</span>
                                    <span className="font-semibold text-slate-800">
                                        £{((task as any).businessChargePence / 100).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
