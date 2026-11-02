'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTasks, Task } from '@/hooks/useTasks';
import { useWallet, Transaction } from '@/hooks/useWallet';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { toast } from 'react-toastify';

type TaskView = 'open' | 'active';

const formatCurrency = (amount: number, currency = 'USD') => {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    } catch {
        return '$' + amount.toFixed(2);
    }
};

export default function AgentDashboard() {
    const { user } = useAuthStore();
    const { assessmentSkipped, currentStep } = useOnboardingStore();
    const [taskView, setTaskView] = useState<TaskView>('open');

    const {
        tasks: openTasksRaw,
        isLoading: isLoadingOpenTasks,
        isError: isErrorOpenTasks,
        error: tasksError,
        refetch: refetchTasks,
        acceptTask,
        isAccepting,
    } = useTasks({ status: 'open' });
    const { tasks: assignedTasksRaw, isLoading: isLoadingMissions } =
        useTasks(user?.id ? { assignedAgentId: user.id } : {});
    const { wallet, transactions, isLoading: isLoadingWallet } = useWallet();
    const { conversations, isLoading: isLoadingConversations } = useMessaging();

    const openTasks = (openTasksRaw || []).filter(task => task.status === 'open');
    const activeMissions = (assignedTasksRaw || []).filter(task =>
        ['assigned', 'accepted', 'in_progress', 'submitted'].includes(task.status),
    );
    const displayName = user?.email || user?.name || 'Affiliate Agent';
    const statusLabel = user?.stats?.rank;
    const balance = wallet ? formatCurrency(wallet.balance, wallet.currency || 'USD') : null;
    const onboardingSteps = [
        { id: 'basic-info', label: 'Basic Info' },
        { id: 'profile-info', label: 'Professional Profile' },
        { id: 'questionnaire', label: 'Expertise' },
        { id: 'quiz', label: 'Assessment' },
        { id: 'outcome', label: 'Certification' },
    ];
    const currentOnboardingStep = Math.max(0, onboardingSteps.findIndex(step => step.id === currentStep));
    const onboardingProgress = Math.round((currentOnboardingStep / onboardingSteps.length) * 100);
    const showOnboardingReminder = (assessmentSkipped || user?.assessmentSkipped) && !user?.isOnboarded;

    const handleAcceptTask = async (taskId: string) => {
        try {
            await acceptTask(taskId);
            toast.success('Task accepted successfully! Track it in My Missions.');
        } catch (error) {
            console.error('Accept task error:', error);
            toast.error('Failed to accept task. It may have already been claimed.');
        }
    };

    if (isLoadingOpenTasks || isLoadingMissions || isLoadingWallet || isLoadingConversations) {
        return (
            <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4">
                <div className="size-10 animate-spin rounded-full border-4 border-blue-100 border-b-blue-600" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Agent Workspace…</p>
            </div>
        );
    }

    const taskList = taskView === 'active' ? activeMissions : openTasks;

    return (
        <div className="min-h-screen bg-[#f7f8fc] font-display text-slate-950">
            <main className="mx-auto max-w-5xl space-y-3 px-3.5 py-3 sm:px-5 lg:space-y-5 lg:px-8">
                <section className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Welcome back</p>
                            <h1 className="truncate text-sm font-bold text-slate-950">{displayName}</h1>
                        </div>
                        {statusLabel && <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-900">{statusLabel}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Link href="/dashboard/agent/earnings" className="min-w-0 rounded-lg border border-slate-100 bg-white p-3">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-700">Available Balance</p>
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-blue-700">
                                    <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
                                </span>
                            </div>
                            <p className="mt-1 text-xl font-bold leading-none">{balance ?? '—'}</p>
                            {!wallet && <p className="mt-2 text-[9px] text-slate-500">Balance unavailable</p>}
                            <div className="mt-3 flex items-center justify-between gap-1 text-[9px]">
                                <span className="inline-flex items-center gap-1 font-bold text-blue-700">Withdraw <span className="material-symbols-outlined text-xs">arrow_forward</span></span>
                            </div>
                        </Link>

                        <Link href="/dashboard/agent/messages" className="min-w-0 rounded-lg border border-slate-100 bg-white p-3">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-700">Affiliate Inbox</p>
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                                    <span className="material-symbols-outlined text-[15px]">chat_bubble_outline</span>
                                </span>
                            </div>
                            <p className="mt-1 text-base font-bold leading-tight">{conversations?.length ?? 0} conversations</p>
                            {!conversations?.length && <p className="mt-2 text-[9px] text-slate-500">No conversations yet</p>}
                            <div className="mt-3 flex items-center justify-between gap-1 text-[9px]">
                                <span className="inline-flex items-center gap-1 font-bold text-blue-700">Open Chat <span className="material-symbols-outlined text-[11px]">open_in_new</span></span>
                            </div>
                        </Link>
                    </div>
                </section>

                {showOnboardingReminder && (
                    <section className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <div className="flex items-start gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                                <span className="material-symbols-outlined text-lg">assignment</span>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[8px] font-bold uppercase tracking-wider text-amber-800">Onboarding · Step {currentOnboardingStep + 1} of {onboardingSteps.length}</p>
                                <h2 className="mt-0.5 text-xs font-bold leading-tight">Finish setting up your affiliate profile</h2>
                                <p className="mt-1 text-[9px] leading-snug text-slate-600">Your onboarding is incomplete. Continue where you left off to finish your setup.</p>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                                    <div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${onboardingProgress}%` }} />
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-[8px] text-slate-600">{onboardingSteps[currentOnboardingStep]?.label} · {onboardingProgress}% complete</span>
                                    <Link href="/onboarding" className="shrink-0 rounded-md bg-amber-700 px-2.5 py-1.5 text-[9px] font-bold text-white">Continue onboarding</Link>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h2 className="text-sm font-bold">Available Tasks <span className="rounded-full bg-blue-700 px-1.5 py-0.5 align-middle text-[8px] text-white">{openTasks.length} Open</span></h2>
                        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-100 p-0.5 text-[8px]">
                            <button type="button" onClick={() => setTaskView('open')} className={taskView === 'open' ? 'rounded-md bg-white px-2 py-1.5 font-bold text-blue-700 shadow-sm' : 'rounded-md px-2 py-1.5 text-slate-600'}>Open ({openTasks.length})</button>
                            <button type="button" onClick={() => setTaskView('active')} className={taskView === 'active' ? 'rounded-md bg-white px-2 py-1.5 font-bold text-blue-700 shadow-sm' : 'rounded-md px-2 py-1.5 text-slate-600'}>Active ({activeMissions.length})</button>
                        </div>
                    </div>

                    {isErrorOpenTasks && (
                        <div className="mb-2 flex items-center justify-between gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-[10px] text-red-800">
                            <span>{tasksError instanceof Error ? tasksError.message : 'Tasks could not be loaded.'}</span>
                            <button type="button" onClick={() => refetchTasks()} className="font-bold underline">Retry</button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {taskList.length ? taskList.slice(0, 3).map((task: Task, index: number) => (
                            <article key={task.id} className="rounded-lg border border-slate-100 bg-white p-2.5">
                                <div className="flex min-w-0 items-start gap-2">
                                    <span className={index === 1 ? 'flex size-8 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-700' : 'flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-blue-700'}>
                                        <span className="material-symbols-outlined text-[16px]">{task.type === 'audit' ? 'manage_search' : task.type === 'research' ? 'person_search' : 'campaign'}</span>
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[8px]">
                                            {(typeof task.category === 'string' ? task.category : task.category?.name) && <span className={index === 1 ? 'rounded bg-orange-100 px-1.5 py-0.5 font-bold uppercase tracking-wide text-orange-900' : 'rounded bg-blue-100 px-1.5 py-0.5 font-bold uppercase tracking-wide text-blue-900'}>{typeof task.category === 'string' ? task.category : task.category?.name}</span>}
                                            {task.estimatedTime && <span className="text-slate-500">{task.estimatedTime}</span>}
                                        </div>
                                        <h3 className="mt-0.5 truncate text-[11px] font-semibold">{task.title}</h3>
                                        {task.description && <p className="mt-0.5 truncate text-[9px] text-slate-600">{task.description}</p>}
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-bold text-emerald-800">{formatCurrency(Number(task.budget), task.currency)}</p>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                                    <p className="min-w-0 truncate text-[8px] text-slate-600">{task.requiredSkills?.length ? `Required: ${task.requiredSkills.join(', ')}` : task.status}</p>
                                    <button type="button" onClick={() => handleAcceptTask(task.id)} disabled={isAccepting} className="shrink-0 rounded-md bg-blue-700 px-3 py-1.5 text-[9px] font-bold text-white disabled:opacity-50">
                                        {isAccepting ? 'Accepting…' : 'Accept Task'}
                                    </button>
                                </div>
                            </article>
                        )) : (
                            <div className="rounded-lg border border-dashed border-indigo-200 bg-white px-4 py-8 text-center text-[10px] text-slate-500">No tasks are available right now. Check again soon.</div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h2 className="text-sm font-bold">My Active Missions <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-900">{activeMissions.length}</span></h2>
                        <Link href="/dashboard/agent/my-missions" className="text-[9px] font-bold text-blue-700">View all</Link>
                    </div>
                    {activeMissions.length ? activeMissions.slice(0, 1).map(mission => (
                        <article key={mission.id} className="rounded-lg border border-indigo-100 bg-[#eff0ff] p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-start gap-2">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-800 text-white">
                                        <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                                    </span>
                                    <div className="min-w-0">
                                        <p className="flex flex-wrap items-center gap-1.5 text-[8px]">
                                            <span className="rounded bg-emerald-200 px-1.5 py-0.5 font-bold uppercase text-emerald-900">{mission.status.replace(/_/g, ' ')}</span>
                                            {mission.estimatedTime && <span className="text-slate-600">{mission.estimatedTime}</span>}
                                        </p>
                                        <h3 className="mt-1 truncate text-[11px] font-semibold">{mission.title}</h3>
                                    </div>
                                </div>
                                <p className="shrink-0 text-xs font-semibold">{formatCurrency(Number(mission.budget), mission.currency)}</p>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2 border-t border-indigo-100 pt-2 text-[8px] text-slate-500">
                                {(typeof mission.category === 'string' ? mission.category : mission.category?.name) && <span>{typeof mission.category === 'string' ? mission.category : mission.category?.name}</span>}
                                <Link href="/dashboard/agent/my-missions" className="shrink-0 rounded-md bg-emerald-800 px-2.5 py-1.5 text-[9px] font-bold text-white">Open mission</Link>
                            </div>
                        </article>
                    )) : <div className="rounded-lg border border-dashed border-indigo-200 bg-white px-4 py-8 text-center text-[10px] text-slate-500">No active missions yet. Accepted tasks will appear here.</div>}
                </section>

                <section>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-bold">Agent Performance</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-slate-100 bg-white p-2.5">
                            <p className="text-[8px] uppercase tracking-wide text-slate-600">Completed Tasks</p>
                            <p className="mt-1 text-lg font-semibold">{user?.stats?.tasksCompleted ?? '—'} <span className="text-[9px] font-normal text-slate-500">tasks</span></p>
                            {user?.stats?.tasksCompleted == null && <p className="mt-0.5 text-[8px] text-slate-500">No task data yet</p>}
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-white p-2.5">
                            <p className="text-[8px] uppercase tracking-wide text-slate-600">Quality Rating</p>
                            <p className="mt-1 text-lg font-semibold">{user?.stats?.rating ?? '—'} {user?.stats?.rating != null && <span className="text-amber-500">☆</span>}</p>
                            {user?.stats?.rating == null && <p className="mt-0.5 text-[8px] text-slate-500">No rating data yet</p>}
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-[#202b42] p-3 text-white shadow-sm">
                    <h2 className="text-sm font-semibold">Progression</h2>
                    <p className="mt-2 text-[10px] text-slate-300">Progression details are not available yet.</p>
                </section>

                <section className="rounded-lg border border-slate-100 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h2 className="text-sm font-bold">Financial Ledger</h2>
                        <Link href="/dashboard/agent/earnings" className="text-[9px] font-bold text-blue-700">Audit Log</Link>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[8px] uppercase tracking-wider">
                        <span>Recent Movements</span>
                        {transactions?.length ? <span className="text-emerald-800">{transactions.length} entries</span> : <span className="text-slate-500">No entries</span>}
                    </div>
                    {transactions?.length ? (
                        <div className="space-y-2 py-2">
                            {transactions.slice(0, 3).map((transaction: Transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between gap-2 text-[9px]">
                                    <span className="truncate">{transaction.description || transaction.type}</span>
                                    <span className="shrink-0 font-semibold">{formatCurrency(Number(transaction.amount), wallet?.currency || 'USD')}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 py-3 text-[9px] leading-snug text-slate-600">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-blue-700">
                                <span className="material-symbols-outlined text-sm">receipt_long</span>
                            </span>
                            <p>No financial movements recorded yet.</p>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-2 rounded-md bg-indigo-50 p-2">
                        <div className="min-w-0">
                            <p className="truncate text-[9px] font-semibold">Affiliate Support &amp; Client Threads</p>
                            <p className="text-[8px] text-slate-600">{conversations?.length ?? 0} conversations</p>
                        </div>
                        <Link href="/dashboard/agent/messages" className="shrink-0 rounded bg-white px-2 py-1 text-[9px] font-semibold text-blue-700">Open Inbox</Link>
                    </div>
                </section>

            </main>

        </div>
    );
}
