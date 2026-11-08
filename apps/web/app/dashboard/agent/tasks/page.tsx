"use client";

import Link from 'next/link';
import TaskCountdown from '@/components/tasks/TaskCountdown';
import { useTasks, Task } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/useAuthStore';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';

const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? null
        : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

const cleanPreviewText = (value?: string | null) => {
    if (!value) return 'No additional description was provided.';
    return value
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
};

const statusTextColors: Record<string, string> = {
    open: 'text-slate-600',
    assigned: 'text-blue-700',
    accepted: 'text-emerald-700',
    declined: 'text-slate-500',
    submitted: 'text-amber-700',
    pending_business_approval: 'text-violet-700',
    revision_requested: 'text-orange-700',
    approved: 'text-teal-700',
    completed: 'text-emerald-700',
    cancelled: 'text-red-700',
};

function TaskCard({ task, basePath }: { task: Task; basePath: string }) {
    const [collapsed, setCollapsed] = useState(true);
    const assignedDate = formatDate(task.createdAt);
    const dueDate = formatDate(task.dueDate);
    const isRevision = task.status === 'revision_requested';
    const isAssigned = task.status === 'assigned';
    const isCentralTask = task.originSystem === 'MCOM_CENTRAL' || Boolean(task.externalTaskId);
    const formattedBudget =
        task.budget != null && Number(task.budget) > 0
            ? new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: task.currency || 'USD',
              }).format(Number(task.budget))
            : task.compensationAmount != null && Number(task.compensationAmount) > 0
              ? new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: task.compensationCurrency || 'GBP',
                }).format(Number(task.compensationAmount))
              : null;

    const contextName = task.centralBusinessName || task.projectName || (isCentralTask ? 'Central Hub' : 'Direct task');
    const secondaryProject =
        task.centralBusinessName && task.projectName && task.projectName !== task.centralBusinessName
            ? task.projectName
            : null;

    return (
        <article
            className={`group rounded-xl border bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all hover:border-slate-300 hover:shadow-xs sm:p-3 ${
                isRevision
                    ? 'border-orange-200/90'
                    : isAssigned
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
                        <h2 className="text-sm font-bold leading-snug text-slate-950">{task.title}</h2>
                        <span
                            className={`shrink-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider ${
                                statusTextColors[task.status] || 'text-slate-600'
                            }`}
                        >
                            {task.status.replaceAll('_', ' ')}
                        </span>
                        {task.paymentStatus === 'ON_HOLD' ? (
                            <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-amber-700">
                                · Awaiting funds
                            </span>
                        ) : task.chargeApprovalRequired ? (
                            <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-amber-700">
                                · Awaiting charge approval
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                            <span className="material-symbols-outlined !text-xs leading-none text-slate-400">
                                {task.centralBusinessName ? 'storefront' : 'folder'}
                            </span>
                            <span className="truncate max-w-[160px] sm:max-w-[260px]">{contextName}</span>
                        </span>
                        {secondaryProject && secondaryProject.trim().toLowerCase() !== task.title.trim().toLowerCase() && (
                            <>
                                <span className="text-slate-300">·</span>
                                <span className="truncate max-w-[160px] text-slate-600 sm:max-w-[260px]">
                                    {secondaryProject}
                                </span>
                            </>
                        )}
                        {dueDate && (
                            <>
                                <span className="text-slate-300">·</span>
                                <span className="whitespace-nowrap">Due {dueDate}</span>
                            </>
                        )}
                        {formattedBudget && (
                            <>
                                <span className="text-slate-300">·</span>
                                <span className="whitespace-nowrap font-semibold text-emerald-700">{formattedBudget}</span>
                            </>
                        )}
                        {task.requiredSkills?.length ? (
                            <>
                                <span className="text-slate-300">·</span>
                                <span className="whitespace-nowrap">
                                    {task.requiredSkills.length} req{task.requiredSkills.length === 1 ? '' : 's'}
                                </span>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <TaskCountdown dueDate={task.dueDate} status={task.status} />
                    <span
                        aria-hidden="true"
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors group-hover:bg-slate-100 group-hover:text-slate-700"
                    >
                        <span className="material-symbols-outlined !text-base leading-none">
                            {collapsed ? 'expand_more' : 'expand_less'}
                        </span>
                    </span>
                </div>
            </button>

            {!collapsed && (
                <div className="mt-2.5 border-t border-slate-100 pt-2.5">
                    <p className="line-clamp-3 text-xs leading-5 text-slate-600">
                        {cleanPreviewText(task.description)}
                    </p>

                    {(isCentralTask || task.platforms?.length || task.category || task.requiredSkills?.length || task.paymentStatus === 'ON_HOLD') ? (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {isCentralTask && (
                                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                    Central Hub
                                </span>
                            )}
                            {task.paymentStatus === 'ON_HOLD' && (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                    Awaiting funds
                                </span>
                            )}
                            {task.category && (
                                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-indigo-800">
                                    {task.category}
                                </span>
                            )}
                            {(task.platforms ?? []).map((platform) => (
                                <span
                                    key={platform}
                                    className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-blue-800"
                                >
                                    {platform}
                                </span>
                            ))}
                            {(task.requiredSkills ?? []).slice(0, 4).map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    {isRevision && (
                        <p className="mt-2 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs leading-5 text-orange-900">
                            <strong className="font-semibold">Changes requested:</strong>
                            {task.reviewNotes ? ` ${task.reviewNotes}` : ' Open the task to review the feedback and resubmit.'}
                        </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {assignedDate && (
                                <span>
                                    <strong className="font-semibold text-slate-700">Created:</strong> {assignedDate}
                                </span>
                            )}
                            {dueDate && (
                                <span>
                                    <strong className="font-semibold text-slate-700">Deadline:</strong> {dueDate}
                                </span>
                            )}
                            {task.estimatedTime && (
                                <span>
                                    <strong className="font-semibold text-slate-700">Estimate:</strong> {task.estimatedTime}
                                </span>
                            )}
                            {task.submittedAt && (
                                <span>
                                    <strong className="font-semibold text-slate-700">Submitted:</strong> {formatDate(task.submittedAt)}
                                </span>
                            )}
                        </div>
                        <Link
                            href={`${basePath}/tasks/${task.id}`}
                            className={`inline-flex h-8 items-center gap-1 rounded-lg px-3.5 text-xs font-bold text-white shadow-2xs transition-colors ${
                                isRevision
                                    ? 'bg-orange-600 hover:bg-orange-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            <span>{isRevision ? 'Resubmit' : isAssigned ? 'Respond' : 'Open task'}</span>
                            <span className="material-symbols-outlined !text-sm leading-none">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            )}
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
    const [statusBucket, setStatusBucket] = useState<'all' | 'action_needed' | 'in_review' | 'done'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'due_soon' | 'oldest'>('newest');

    const { tasks, isLoading, isError, error, refetch } = useTasks({
        assignedAgentId: user?.id,
        search: search.trim() || undefined,
        enabled: Boolean(user?.id),
        limit: 50,
    });

    // Compute task counts across buckets
    const counts = useMemo(() => {
        const list = tasks ?? [];
        let actionNeeded = 0;
        let inReview = 0;
        let done = 0;
        for (const t of list) {
            if (['assigned', 'accepted', 'revision_requested'].includes(t.status)) {
                actionNeeded += 1;
            } else if (['submitted', 'pending_business_approval'].includes(t.status)) {
                inReview += 1;
            } else if (['approved', 'completed', 'declined', 'cancelled'].includes(t.status)) {
                done += 1;
            }
        }
        return {
            all: list.length,
            action_needed: actionNeeded,
            in_review: inReview,
            done,
        };
    }, [tasks]);

    // Filter by active status bucket
    const filteredTasks = useMemo(() => {
        let list = tasks ?? [];
        if (statusBucket === 'action_needed') {
            list = list.filter((t) => ['assigned', 'accepted', 'revision_requested'].includes(t.status));
        } else if (statusBucket === 'in_review') {
            list = list.filter((t) => ['submitted', 'pending_business_approval'].includes(t.status));
        } else if (statusBucket === 'done') {
            list = list.filter((t) => ['approved', 'completed', 'declined', 'cancelled'].includes(t.status));
        }

        return [...list].sort((a, b) => {
            if (sortBy === 'due_soon') {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                return dateA - dateB;
            }
            if (sortBy === 'oldest') {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
            }
            // newest
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [tasks, statusBucket, sortBy]);

    if (!user?.id || isLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center px-4">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500" role="status">
                    <span className="size-4 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
                    Loading assigned tasks…
                </div>
            </div>
        );
    }

    const filterPills = [
        { id: 'all' as const, label: 'All tasks', count: counts.all, icon: 'list_alt' },
        { id: 'action_needed' as const, label: 'Action needed', count: counts.action_needed, icon: 'assignment_late' },
        { id: 'in_review' as const, label: 'In review', count: counts.in_review, icon: 'hourglass_top' },
        { id: 'done' as const, label: 'Completed', count: counts.done, icon: 'check_circle' },
    ];

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-3 pb-8">
            {/* Header row with stats */}
            <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 shadow-2xs">
                <div className="min-w-0">
                    <h1 className="text-base font-bold text-slate-950 sm:text-lg">Assigned Tasks</h1>
                    <p className="text-xs text-slate-500">
                        Tasks assigned to you by Central Hub businesses and Account Managers.
                    </p>
                </div>
                {basePath.endsWith('/agent') && (
                    <Link
                        href={`${basePath}/my-missions`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                    >
                        <span>View missions</span>
                        <span className="material-symbols-outlined !text-sm leading-none">arrow_forward</span>
                    </Link>
                )}
            </header>

            {/* Status Pills */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {filterPills.map((pill) => {
                    const active = statusBucket === pill.id;
                    return (
                        <button
                            key={pill.id}
                            type="button"
                            onClick={() => setStatusBucket(pill.id)}
                            className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
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
                            <span className={`tabular-nums text-[11px] ${active ? 'font-bold text-blue-700' : 'text-slate-400'}`}>
                                ({pill.count})
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Compact Search & Sort Bar */}
            <div className="flex flex-wrap items-center gap-2">
                <form
                    onSubmit={(event: FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const query = String(new FormData(event.currentTarget).get('search') || '').trim();
                        router.push(query ? `${basePath}/tasks?search=${encodeURIComponent(query)}` : `${basePath}/tasks`);
                    }}
                    className="flex h-8 min-w-[200px] flex-1 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 shadow-2xs focus-within:border-blue-600"
                >
                    <span className="material-symbols-outlined !text-base text-slate-400">search</span>
                    <input
                        key={search}
                        name="search"
                        defaultValue={search}
                        aria-label="Search assigned tasks"
                        placeholder="Search assigned task titles…"
                        className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => router.push(`${basePath}/tasks`)}
                            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                        >
                            Clear
                        </button>
                    )}
                    <button type="submit" className="text-[11px] font-bold text-blue-700 hover:underline">
                        Search
                    </button>
                </form>

                <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as 'newest' | 'due_soon' | 'oldest')}
                    aria-label="Sort assigned tasks"
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-blue-600 focus:outline-none"
                >
                    <option value="newest">Sort: Newest</option>
                    <option value="due_soon">Sort: Due soonest</option>
                    <option value="oldest">Sort: Oldest</option>
                </select>
            </div>

            {isError ? (
                <RequestErrorState
                    area="Assigned tasks"
                    label="Assigned tasks"
                    error={error}
                    onRetry={() => void refetch()}
                    supportHref={`${basePath}/messages`}
                    compact={false}
                />
            ) : filteredTasks.length ? (
                <div className="space-y-2">
                    {filteredTasks.map((task) => (
                        <TaskCard key={task.id} task={task} basePath={basePath} />
                    ))}
                </div>
            ) : (
                <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300" aria-hidden="true">
                        assignment
                    </span>
                    <h2 className="mt-1.5 text-sm font-semibold text-slate-800">
                        {search.trim() || statusBucket !== 'all' ? 'No matching tasks' : 'No tasks assigned yet'}
                    </h2>
                    <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                        {search.trim() || statusBucket !== 'all'
                            ? 'Try switching status filters or clearing your search query.'
                            : 'Tasks delegated to your account will appear here when they’re ready.'}
                    </p>
                </section>
            )}
        </div>
    );
}

export default function AgentTasksPage() {
    return (
        <Suspense fallback={<div className="py-8 text-center text-xs text-slate-500">Loading tasks…</div>}>
            <AgentTasksContent />
        </Suspense>
    );
}
