"use client";

import Link from 'next/link';
import { useTasks, type Task } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/useAuthStore';

const activeStatuses = new Set(['accepted', 'in_progress', 'submitted']);

const missionStatusStyles: Record<string, string> = {
    accepted: 'bg-blue-50 text-blue-800 border-blue-200',
    in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
    submitted: 'bg-amber-50 text-amber-800 border-amber-200',
};

function formatDate(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function formatBudget(task: Task) {
    if (task.budget == null || !Number.isFinite(Number(task.budget))) return null;
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: task.currency || 'USD',
    }).format(Number(task.budget));
}

function MissionCard({ task }: { task: Task }) {
    const deadline = formatDate(task.dueDate);
    const budget = formatBudget(task);

    return (
        <article className="border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-blue-700">Active mission</p>
                    <h2 className="mt-1 text-base font-semibold text-slate-950">{task.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{task.description || 'No additional instructions were provided.'}</p>
                </div>
                <span className={`shrink-0 border px-2.5 py-1 text-xs font-medium capitalize ${missionStatusStyles[task.status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    {task.status.replaceAll('_', ' ')}
                </span>
            </div>

            {(deadline || task.estimatedTime || budget) && (
                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-3 text-xs">
                    {deadline && <div className="flex gap-1.5"><dt className="text-slate-500">Deadline</dt><dd className="font-medium text-slate-800">{deadline}</dd></div>}
                    {task.estimatedTime && <div className="flex gap-1.5"><dt className="text-slate-500">Estimate</dt><dd className="font-medium text-slate-800">{task.estimatedTime}</dd></div>}
                    {budget && <div className="flex gap-1.5"><dt className="text-slate-500">Budget</dt><dd className="font-medium text-slate-800">{budget}</dd></div>}
                </dl>
            )}

            <div className="mt-3 flex justify-end">
                <Link href={`/dashboard/agent/tasks/${task.id}`} className="inline-flex min-h-10 items-center gap-1 rounded-md px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                    Open mission <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
            </div>
        </article>
    );
}

export default function MyMissionsPage() {
    const { user } = useAuthStore();
    const { tasks, isLoading, isError, error, refetch } = useTasks({
        assignedAgentId: user?.id,
        enabled: Boolean(user?.id),
        limit: 50,
    });

    const activeMissions = (tasks || []).filter((task) => activeStatuses.has(task.status));

    if (!user?.id || isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500" role="status">
                <span className="size-5 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />
                Loading your missions…
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-4 py-5 sm:space-y-5 lg:py-8">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Affiliate workspace</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950">My Missions</h1>
                    <p className="mt-1 max-w-2xl text-sm text-slate-600">Track accepted work and follow each mission through submission.</p>
                </div>
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-950">{activeMissions.length}</span> active</p>
            </header>

            {isError ? (
                <section className="border-l-4 border-red-600 bg-red-50 p-4" role="alert">
                    <h2 className="font-semibold text-red-900">Missions couldn’t be loaded</h2>
                    <p className="mt-1 text-sm text-red-800">{error instanceof Error ? error.message : 'Check your connection and try again.'}</p>
                    <button type="button" onClick={() => void refetch()} className="mt-3 min-h-9 rounded-md bg-red-800 px-4 text-sm font-semibold text-white hover:bg-red-900">Try again</button>
                </section>
            ) : activeMissions.length ? (
                <div className="space-y-3">
                    {activeMissions.map((task) => <MissionCard key={task.id} task={task} />)}
                </div>
            ) : (
                <section className="border border-dashed border-slate-300 bg-white px-5 py-10 text-center sm:py-12">
                    <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">rocket_launch</span>
                    <h2 className="mt-3 font-semibold text-slate-900">No active missions</h2>
                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">Accepted or in-progress tasks will appear here. Browse your assigned tasks to review available work.</p>
                    <Link href="/dashboard/agent/tasks" className="mt-4 inline-flex min-h-10 items-center gap-1 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">
                        View my tasks <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                </section>
            )}
        </div>
    );
}
