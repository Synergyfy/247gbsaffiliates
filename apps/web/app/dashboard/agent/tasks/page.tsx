"use client";

import Link from 'next/link';
import TaskCountdown from '@/components/tasks/TaskCountdown';
import { useTasks, Task } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/useAuthStore';
import { FormEvent, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';

const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

const statusStyles: Record<string, string> = {
    open: 'bg-slate-50 text-slate-700 border-slate-200',
    assigned: 'bg-blue-50 text-blue-800 border-blue-200',
    accepted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    declined: 'bg-slate-100 text-slate-600 border-slate-200',
    submitted: 'bg-amber-50 text-amber-800 border-amber-200',
    pending_business_approval: 'bg-violet-50 text-violet-800 border-violet-200',
    revision_requested: 'bg-orange-50 text-orange-800 border-orange-200',
    approved: 'bg-teal-50 text-teal-800 border-teal-200',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function TaskCard({ task, basePath }: { task: Task; basePath: string }) {
    const assignedDate = formatDate(task.createdAt);
    const dueDate = formatDate(task.dueDate);
    const isRevision = task.status === 'revision_requested';
    const isCentralTask = task.originSystem === 'MCOM_CENTRAL' || Boolean(task.externalTaskId);

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-slate-950">{task.title}</h2>
                        {isCentralTask && <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">Central Hub</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{task.description || 'No additional description was provided.'}</p>
                    {(task.centralBusinessName || task.platforms?.length) && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {task.centralBusinessName && <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"><span className="material-symbols-outlined text-sm">storefront</span>{task.centralBusinessName}</span>}
                            {(task.platforms ?? []).map((platform) => <span key={platform} className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-blue-800">{platform}</span>)}
                            {task.category && <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-indigo-800">{task.category}</span>}
                            {task.projectName && <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"><span className="material-symbols-outlined text-sm">folder</span>{task.projectName}</span>}
                            {task.paymentStatus === 'ON_HOLD' ? (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Awaiting funds</span>
                            ) : task.chargeApprovalRequired ? (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Awaiting charge approval</span>
                            ) : null}
                        </div>
                    )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[task.status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                        {task.status.replaceAll('_', ' ')}
                    </span>
                    <TaskCountdown dueDate={task.dueDate} status={task.status} />
                </div>
            </div>

            {isRevision && (
                <p className="mt-3 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs leading-5 text-orange-900">
                    <strong className="font-semibold">Changes requested.</strong>{task.reviewNotes ? ` ${task.reviewNotes}` : ' Open the task to review the feedback and resubmit.'}
                </p>
            )}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
                {assignedDate && <span><strong className="font-semibold text-slate-800">Created:</strong> {assignedDate}</span>}
                {dueDate && <span><strong className="font-semibold text-slate-800">Deadline:</strong> {dueDate}</span>}
                {task.estimatedTime && <span><strong className="font-semibold text-slate-800">Estimate:</strong> {task.estimatedTime}</span>}
                {task.budget != null && <span><strong className="font-semibold text-slate-800">Budget:</strong> {new Intl.NumberFormat(undefined, { style: 'currency', currency: task.currency || 'USD' }).format(Number(task.budget))}</span>}
                {task.submittedAt && <span><strong className="font-semibold text-slate-800">Submitted:</strong> {formatDate(task.submittedAt)}</span>}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">
                    {task.status === 'submitted'
                        ? `Awaiting ${isCentralTask ? 'Central Hub' : 'administrator'} review`
                        : task.requiredSkills?.length
                            ? `${task.requiredSkills.length} listed requirement${task.requiredSkills.length === 1 ? '' : 's'}`
                            : 'Review the task instructions for requirements'}
                </span>
                <Link href={`${basePath}/tasks/${task.id}`} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                    {isRevision ? 'Review & resubmit' : 'Open task'} <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
            </div>
        </article>
    );
}

function AgentTasksContent() {
    const { user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const basePath = pathname.split('/').slice(0, 3).join('/');
    const searchParams = useSearchParams();
    const search = searchParams.get('search') || '';
    const { tasks, isLoading, isError, error, refetch } = useTasks({
        assignedAgentId: user?.id,
        search: search.trim() || undefined,
        enabled: Boolean(user?.id),
        limit: 50,
    });

    if (!user?.id || isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500" role="status">
                    <span className="size-5 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
                    Loading assigned tasks…
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1500px] py-5 lg:py-8">
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Affiliate workspace</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950">Assigned Tasks</h1>
                    <p className="mt-1 max-w-2xl text-sm text-slate-600">Tasks assigned to you by Central Hub businesses or an administrator, with their current status, deadlines and review feedback.</p>
                </div>
                {basePath.endsWith('/agent') && (
                    <Link href={`${basePath}/my-missions`} className="text-sm font-semibold text-blue-700 hover:underline">View my missions</Link>
                )}
            </header>

            <form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const query = String(new FormData(event.currentTarget).get('search') || '').trim(); router.push(query ? `${basePath}/tasks?search=${encodeURIComponent(query)}` : `${basePath}/tasks`); }} className="mb-4 flex items-center gap-2 border border-slate-200 bg-white px-3">
                <span className="material-symbols-outlined text-lg text-slate-400">search</span>
                <input key={search} name="search" defaultValue={search} aria-label="Search assigned tasks" placeholder="Search assigned task titles" className="h-10 min-w-0 flex-1 text-sm outline-none placeholder:text-slate-400" />
                <button type="submit" className="text-xs font-semibold text-blue-700">Search</button>
            </form>

            {isError ? (
                <RequestErrorState area="Assigned tasks" label="Assigned tasks" error={error} onRetry={() => void refetch()} supportHref={`${basePath}/messages`} compact={false} />
            ) : tasks?.length ? (
                <div className="space-y-3">
                    {tasks.map((task) => <TaskCard key={task.id} task={task} basePath={basePath} />)}
                </div>
            ) : (
                <section className="bg-white py-4 text-sm text-slate-600">
                    <h2 className="font-semibold text-slate-900">{search.trim() ? 'No matching tasks' : 'No tasks assigned yet'}</h2>
                    <p className="mt-1 text-xs">{search.trim() ? 'Try a different search term.' : 'Tasks delegated to your account will appear here when they’re ready.'}</p>
                </section>
            )}
        </div>
    );
}

export default function AgentTasksPage() {
    return <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading tasks…</div>}><AgentTasksContent /></Suspense>;
}
