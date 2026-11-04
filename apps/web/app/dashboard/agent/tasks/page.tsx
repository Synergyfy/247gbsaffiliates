"use client";

import Link from 'next/link';
import { useTasks, Task } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/useAuthStore';
import { FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

const statusStyles: Record<string, string> = {
    assigned: 'bg-blue-50 text-blue-800 border-blue-200',
    accepted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    declined: 'bg-slate-100 text-slate-600 border-slate-200',
    submitted: 'bg-amber-50 text-amber-800 border-amber-200',
    approved: 'bg-teal-50 text-teal-800 border-teal-200',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function TaskCard({ task }: { task: Task }) {
    const assignedDate = formatDate(task.createdAt);
    const dueDate = formatDate(task.dueDate);

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-950">{task.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{task.description || 'No additional description was provided.'}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[task.status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    {task.status.replaceAll('_', ' ')}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
                {assignedDate && <span><strong className="font-semibold text-slate-800">Created:</strong> {assignedDate}</span>}
                {dueDate && <span><strong className="font-semibold text-slate-800">Deadline:</strong> {dueDate}</span>}
                {task.estimatedTime && <span><strong className="font-semibold text-slate-800">Estimate:</strong> {task.estimatedTime}</span>}
                {task.budget != null && <span><strong className="font-semibold text-slate-800">Budget:</strong> {new Intl.NumberFormat(undefined, { style: 'currency', currency: task.currency || 'USD' }).format(Number(task.budget))}</span>}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">{task.requiredSkills?.length ? `${task.requiredSkills.length} listed requirement${task.requiredSkills.length === 1 ? '' : 's'}` : 'Review the task instructions for requirements'}</span>
                <Link href={`/dashboard/agent/tasks/${task.id}`} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                    Open task <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
            </div>
        </article>
    );
}

function AgentTasksContent() {
    const { user } = useAuthStore();
    const router = useRouter();
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
                    <p className="mt-1 max-w-2xl text-sm text-slate-600">Tasks assigned to your account by an administrator, with their current status and deadlines.</p>
                </div>
                <Link href="/dashboard/agent/my-missions" className="text-sm font-semibold text-blue-700 hover:underline">View my missions</Link>
            </header>

            <form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const query = String(new FormData(event.currentTarget).get('search') || '').trim(); router.push(query ? `/dashboard/agent/tasks?search=${encodeURIComponent(query)}` : '/dashboard/agent/tasks'); }} className="mb-4 flex items-center gap-2 border border-slate-200 bg-white px-3">
                <span className="material-symbols-outlined text-lg text-slate-400">search</span>
                <input key={search} name="search" defaultValue={search} aria-label="Search assigned tasks" placeholder="Search assigned task titles" className="h-10 min-w-0 flex-1 text-sm outline-none placeholder:text-slate-400" />
                <button type="submit" className="text-xs font-semibold text-blue-700">Search</button>
            </form>

            {isError ? (
                <section className="rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
                    <h2 className="font-semibold text-red-900">Tasks couldn’t be loaded</h2>
                    <p className="mt-1 text-sm text-red-800">{error instanceof Error ? error.message : 'Check your connection and try again.'}</p>
                    <button type="button" onClick={() => refetch()} className="mt-3 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900">Try again</button>
                </section>
            ) : tasks?.length ? (
                <div className="space-y-3">
                    {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
                </div>
            ) : (
                <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300">assignment</span>
                    <h2 className="mt-3 font-semibold text-slate-900">{search.trim() ? 'No matching tasks' : 'No tasks assigned yet'}</h2>
                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{search.trim() ? 'Try a different search term.' : 'Administrator-assigned tasks will appear here when they’re ready for you.'}</p>
                    <Link href="/dashboard/agent" className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to dashboard</Link>
                </section>
            )}
        </div>
    );
}

export default function AgentTasksPage() {
    return <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading tasks…</div>}><AgentTasksContent /></Suspense>;
}
