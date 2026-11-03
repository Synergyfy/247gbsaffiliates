'use client';

import Link from 'next/link';
import { useAdminStats } from '@/hooks/useAdminStats';

export default function AdminReportsPage() {
    const { stats, isLoading, isError, refetch } = useAdminStats();
    if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><span className="size-9 animate-spin rounded-full border-4 border-primary/20 border-b-primary" /></div>;
    if (isError || !stats) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Operational reports could not be loaded. <button onClick={() => void refetch()} className="font-bold underline">Retry</button></div>;
    const taskStatuses = Object.entries(stats.tasksByStatus || {}).sort(([a], [b]) => a.localeCompare(b));
    const resultBands = Object.entries(stats.attemptsByBand || {}).sort(([a], [b]) => a.localeCompare(b));

    return (
        <div className="mx-auto max-w-6xl font-display">
            <header className="mb-6"><p className="text-xs font-bold uppercase tracking-widest text-primary">Reporting</p><h1 className="mt-1 text-2xl font-black text-text-main">Affiliate Operations</h1><p className="mt-1 text-sm text-text-secondary">Live counts from persisted affiliate, assessment and task records.</p></header>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                    ['Registered affiliates', stats.totalAffiliates],
                    ['Pending verification', stats.pendingAffiliateVerification],
                    ['Verified affiliates', stats.verifiedAffiliates],
                    ['Qualified affiliates', stats.qualifiedAffiliates],
                    ['Assessment passes / partials', stats.passedAssessments],
                    ['Assessment failures', stats.failedAssessments],
                    ['Assigned / active tasks', stats.assignedTasks],
                    ['Completed tasks', stats.completedTasks],
                ].map(([label, count]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-950">{Number(count).toLocaleString()}</p></div>)}
            </section>

            <section className="mt-5 grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-bold text-slate-900">Task status breakdown</h2>{taskStatuses.length ? <div className="mt-3 divide-y divide-slate-100">{taskStatuses.map(([status, count]) => <div key={status} className="flex justify-between py-2 text-sm"><span className="capitalize text-slate-600">{status.replaceAll('_', ' ')}</span><strong>{count}</strong></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No task status data.</p>}<Link href="/dashboard/admin/tasks" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">Manage tasks →</Link></article>
                <article className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-bold text-slate-900">Assessment result breakdown</h2>{resultBands.length ? <div className="mt-3 divide-y divide-slate-100">{resultBands.map(([band, count]) => <div key={band} className="flex justify-between py-2 text-sm"><span className="capitalize text-slate-600">{band}</span><strong>{count}</strong></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No assessment attempts recorded.</p>}<Link href="/dashboard/admin/assessments" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">Review assessment results →</Link></article>
            </section>
        </div>
    );
}
