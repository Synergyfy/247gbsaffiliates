'use client';

import Link from 'next/link';
import { useAdminStats } from '@/hooks/useAdminStats';
import { AcquisitionActivityFeed } from '@/components/business-acquisition/AcquisitionActivityFeed';

const metrics = [
    { key: 'totalAffiliates', label: 'Registered affiliates', icon: 'group', href: '/dashboard/admin/users', color: 'text-blue-700 bg-blue-50' },
    { key: 'pendingAffiliateVerification', label: 'Pending verification', icon: 'pending_actions', href: '/dashboard/admin/verifications', color: 'text-amber-700 bg-amber-50' },
    { key: 'verifiedAffiliates', label: 'Verified affiliates', icon: 'verified_user', href: '/dashboard/admin/users?verificationStatus=verified', color: 'text-emerald-700 bg-emerald-50' },
    { key: 'qualifiedAffiliates', label: 'Qualified affiliates', icon: 'workspace_premium', href: '/dashboard/admin/users?qualification=qualified', color: 'text-violet-700 bg-violet-50' },
    { key: 'assignedTasks', label: 'Assigned / active tasks', icon: 'assignment', href: '/dashboard/admin/tasks', color: 'text-orange-700 bg-orange-50' },
    { key: 'completedTasks', label: 'Completed tasks', icon: 'task_alt', href: '/dashboard/admin/tasks?status=completed', color: 'text-teal-700 bg-teal-50' },
] as const;

export default function AdminDashboard() {
    const { stats, isLoading, isError, refetch } = useAdminStats();

    if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><span className="size-9 animate-spin rounded-full border-4 border-primary/20 border-b-primary" /></div>;
    if (isError || !stats) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">Admin metrics could not be loaded. <button onClick={() => void refetch()} className="font-bold underline">Try again</button></div>;

    return (
        <div className="mx-auto w-full max-w-7xl font-display">
            <header className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Affiliate operations</p>
                <h1 className="mt-1 text-2xl font-black text-text-main">Admin Overview</h1>
                <p className="mt-1 text-sm text-text-secondary">Current account verification, qualification, assessment and task activity.</p>
            </header>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Affiliate lifecycle metrics">
                {metrics.map((metric) => (
                    <Link key={metric.key} href={metric.href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</span>
                            <span className={`flex size-9 items-center justify-center rounded-lg ${metric.color}`}><span className="material-symbols-outlined">{metric.icon}</span></span>
                        </div>
                        <p className="mt-3 text-3xl font-black text-slate-950">{stats[metric.key].toLocaleString()}</p>
                    </Link>
                ))}
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <h2 className="font-bold text-slate-900">Recent affiliate registrations</h2>
                        <Link href="/dashboard/admin/users" className="text-xs font-semibold text-primary hover:underline">View all</Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {stats.recentUsers.length ? stats.recentUsers.map((affiliate) => (
                            <Link href={`/dashboard/admin/users/${affiliate.id}`} key={affiliate.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50">
                                <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{affiliate.name}</span><span className="block truncate text-xs text-slate-500">{affiliate.email}</span></span>
                                <span className="text-right text-xs"><span className="block capitalize text-slate-600">{affiliate.role.replaceAll('_', ' ')}</span><span className="block capitalize text-slate-500">{affiliate.verificationStatus}</span></span>
                            </Link>
                        )) : <p className="px-4 py-8 text-center text-sm text-slate-500">No affiliate registrations yet.</p>}
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="font-bold text-slate-900">Assessment results</h2>
                    <div className="mt-4 space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-slate-600">Passed / partial attempts</span><strong className="text-slate-900">{stats.passedAssessments}</strong></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-600">Failed attempts</span><strong className="text-slate-900">{stats.failedAssessments}</strong></div>
                        <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">Qualification also requires verification, completed onboarding and selected skills.</div>
                        <Link href="/dashboard/admin/assessments" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">Manage assessments and results →</Link>
                    </div>
                </div>
            </section>

            <div className="mt-6">
                <AcquisitionActivityFeed admin limit={8} compact />
            </div>
        </div>
    );
}
