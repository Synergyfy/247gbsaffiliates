'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useTasks, Task } from '@/hooks/useTasks';
import { useMcomWallet } from '@/hooks/useMcomWallet';
import { useAuthStore } from '@/store/useAuthStore';

const formatDate = (value?: string | null) => {
    if (!value) return 'No deadline';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'No deadline'
        : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

const statusStyles: Record<string, string> = {
    open: 'bg-slate-100 text-slate-700',
    assigned: 'bg-blue-50 text-blue-700',
    accepted: 'bg-emerald-50 text-emerald-700',
    declined: 'bg-slate-100 text-slate-600',
    submitted: 'bg-amber-50 text-amber-800',
    revision_requested: 'bg-orange-50 text-orange-800',
    approved: 'bg-teal-50 text-teal-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-700',
};

export default function ConsultantDashboard() {
    const { user } = useAuthStore();
    const { tasks, isLoading: isLoadingTasks, isError: tasksError } = useTasks({ limit: 50 });
    const { wallet, isLoading: isLoadingWallet } = useMcomWallet();

    const myTasks = useMemo(() => {
        if (!user?.id) return [] as Task[];
        return (tasks || []).filter(
            (task) =>
                task.assignedAgentId === user.id ||
                (task.assigneeEmail && task.assigneeEmail.toLowerCase() === user.email?.toLowerCase()),
        );
    }, [tasks, user?.id, user?.email]);

    const completedTasks = myTasks.filter((task) => ['completed', 'approved'].includes(task.status)).length;
    const activeTasks = myTasks.filter((task) => !['completed', 'approved', 'cancelled', 'declined'].includes(task.status)).length;
    const completionRate = myTasks.length ? Math.round((completedTasks / myTasks.length) * 100) : 0;
    const verificationStatus = user?.verificationStatus || 'pending';
    const initials = (user?.name || user?.email || 'C')
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    if (isLoadingWallet) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <div className="font-display">
            {verificationStatus !== 'verified' && (
                <div className="bg-amber-50 border-b border-amber-100 py-3 px-6 flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-amber-600 text-sm">verified_user</span>
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                        {verificationStatus === 'rejected'
                            ? 'Your verification needs attention. Review the feedback in your profile.'
                            : 'Your consultant credentials are being verified by our compliance team.'}
                    </p>
                </div>
            )}
            <header className="h-20 bg-surface-light border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
                <h1 className="text-xl font-black text-text-main italic uppercase tracking-tighter">
                    Consultant <span className="text-primary tracking-normal not-italic">Portal</span>
                </h1>
                <div className="flex items-center gap-3 sm:gap-6">
                    <Link href="/dashboard/consultant/tasks" className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover">
                        My tasks
                    </Link>
                    <div className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-slate-200">
                        <div className="text-right">
                            <p className="text-sm font-black text-text-main">{user?.name || 'Consultant'}</p>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                                {user?.role?.replaceAll('_', ' ') || 'Consultant'}
                            </p>
                        </div>
                        {user?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img alt={user.name} className="size-10 rounded-full object-cover border-2 border-primary/20 shadow-sm" src={user.avatar} />
                        ) : (
                            <div className="size-10 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center border-2 border-primary/20 shadow-sm">
                                {initials}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">payments</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Account balance</p>
                                <p className="text-2xl font-black text-text-main">{Number(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} MCOM</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
                                <span className="material-symbols-outlined text-2xl">assignment</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Active tasks</p>
                                <p className="text-2xl font-black text-text-main">{isLoadingTasks ? '…' : activeTasks}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                                <span className="material-symbols-outlined text-2xl">task_alt</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Completed tasks</p>
                                <p className="text-2xl font-black text-text-main">{isLoadingTasks ? '…' : completedTasks}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-700">
                                <span className="material-symbols-outlined text-2xl">insights</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Completion rate</p>
                                <p className="text-2xl font-black text-text-main">{isLoadingTasks ? '…' : `${completionRate}%`}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                                <h2 className="font-black text-text-main uppercase tracking-widest flex items-center gap-2 text-sm">
                                    <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
                                    Assigned work
                                </h2>
                                <Link href="/dashboard/consultant/tasks" className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full uppercase hover:bg-primary/20">
                                    View all
                                </Link>
                            </div>
                            {isLoadingTasks ? (
                                <div className="p-8 text-center text-sm text-slate-500">Loading assigned work…</div>
                            ) : tasksError ? (
                                <div className="p-6 text-sm text-red-700 bg-red-50">Tasks could not be loaded. Complete onboarding and try again.</div>
                            ) : myTasks.length === 0 ? (
                                <div className="p-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">assignment</span>
                                    <p className="mt-2 text-sm font-semibold text-slate-700">No tasks assigned yet</p>
                                    <p className="mt-1 text-xs text-slate-500">Work delegated to you by Central Hub businesses will appear here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {myTasks.slice(0, 8).map((task: Task) => (
                                        <Link key={task.id} href={`/dashboard/consultant/tasks/${task.id}`} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-slate-50">
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-text-main text-sm">{task.title}</h3>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {task.centralBusinessName || 'Central Hub'} · due {formatDate(task.dueDate)}
                                                </p>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${statusStyles[task.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {task.status.replaceAll('_', ' ')}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        <aside className="space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h3 className="font-black text-text-main uppercase tracking-widest text-sm mb-4">Delivery performance</h3>
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <span className="text-4xl font-black text-primary">{completionRate}%</span>
                                        <p className="text-[10px] text-text-secondary font-black uppercase mt-1">Tasks completed</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-text-secondary uppercase block">Assigned</span>
                                        <span className="text-sm font-black text-text-main">{myTasks.length}</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all" style={{ width: `${completionRate}%` }}></div>
                                </div>
                                <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <dt className="text-slate-500">Awaiting review</dt>
                                        <dd className="mt-1 text-lg font-black text-text-main">{myTasks.filter((task) => task.status === 'submitted').length}</dd>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <dt className="text-slate-500">Changes requested</dt>
                                        <dd className="mt-1 text-lg font-black text-text-main">{myTasks.filter((task) => task.status === 'revision_requested').length}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                                <h3 className="font-black text-sm uppercase tracking-widest mb-4">Consultant actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/dashboard/consultant/profile" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10">
                                        <span className="material-symbols-outlined text-primary text-2xl">person</span>
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Edit profile</span>
                                    </Link>
                                    <Link href="/dashboard/consultant/messages" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10">
                                        <span className="material-symbols-outlined text-primary text-2xl">forum</span>
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Messages</span>
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
