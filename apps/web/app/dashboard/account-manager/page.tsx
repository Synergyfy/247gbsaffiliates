'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useTasks, Task } from '@/hooks/useTasks';
import { useMcomWallet } from '@/hooks/useMcomWallet';
import { useMessaging } from '@/hooks/useMessaging';
import { useAssignedBusinesses, AssignedBusiness } from '@/hooks/useAssignedBusinesses';
import { useAuthStore } from '@/store/useAuthStore';

const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? '—'
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

const businessLocation = (business: AssignedBusiness) => {
    const parts = [business.city?.name, business.city?.region, business.postcode].filter(Boolean);
    return parts.length ? parts.join(', ') : business.address || 'Location not provided';
};

export default function AccountManagerDashboard() {
    const { user } = useAuthStore();
    const {
        tasks,
        isLoading: isLoadingTasks,
        isError: tasksError,
        error: tasksErrorObject,
        refetch: refetchTasks,
    } = useTasks({ limit: 50 });
    const { wallet, isLoading: isLoadingWallet } = useMcomWallet();
    const { conversations, sendMessage, isSending } = useMessaging();
    const { data: assignedBusinesses, isLoading: isLoadingBusinesses } = useAssignedBusinesses();
    const [selectedConvId, setSelectedConvId] = React.useState<string | null>(null);
    const [replyText, setReplyText] = React.useState('');

    const activeConversation = conversations?.find((conversation) => conversation.id === selectedConvId);

    // If an admin verifies the account (or onboarding finishes in another tab),
    // clear the cached 403 and retry without making the user reload the page.
    React.useEffect(() => {
        if (!user?.id) return;
        void refetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.isOnboarded, user?.verificationStatus]);

    const taskError = tasksErrorObject as (Error & { code?: string }) | null;
    const taskErrorMessage =
        taskError?.message || 'Tasks could not be loaded. Please try again.';
    const needsOnboardingSteps = Boolean(
        user &&
        (!user.verificationSubmission ||
            !user.isQuizPassed ||
            (user.role === 'agent' && !user.skills?.length))
    );

    // Only surface work delegated directly to this account manager. The local
    // API also exposes the open pool, which is not their responsibility.
    const myTasks = useMemo(() => {
        if (!user?.id) return [] as Task[];
        return (tasks || []).filter(
            (task) =>
                task.assignedAgentId === user.id ||
                (task.assigneeEmail && task.assigneeEmail.toLowerCase() === user.email?.toLowerCase()),
        );
    }, [tasks, user?.id, user?.email]);

    const completedTasks = myTasks.filter((task) => task.status === 'completed' || task.status === 'approved').length;
    const activeTasks = myTasks.filter((task) => !['completed', 'approved', 'cancelled', 'declined'].includes(task.status)).length;
    const businesses = assignedBusinesses?.businesses ?? [];

    const handleSendReply = async () => {
        if (!selectedConvId || !replyText.trim()) return;
        try {
            await sendMessage({ id: selectedConvId, content: replyText });
            setReplyText('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    if (isLoadingWallet) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <div className="font-display">
            <header className="bg-surface-light border-b border-slate-200 px-4 py-6 sm:px-8 sticky top-0 z-20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-text-main">Account Manager Dashboard</h1>
                        <p className="text-text-secondary text-sm font-medium">
                            Welcome back, {user?.name || 'Manager'}
                        </p>
                    </div>
                    <Link href="/dashboard/account-manager/tasks" className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">
                        View my tasks
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Assigned businesses</span>
                            <span className="material-symbols-outlined text-primary text-sm">storefront</span>
                        </div>
                        <span className="text-2xl font-black text-text-main">{isLoadingBusinesses ? '…' : businesses.length}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Active tasks</span>
                            <span className="material-symbols-outlined text-primary text-sm">assignment</span>
                        </div>
                        <span className="text-2xl font-black text-text-main">{isLoadingTasks ? '…' : activeTasks}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Completed tasks</span>
                            <span className="material-symbols-outlined text-primary text-sm">task_alt</span>
                        </div>
                        <span className="text-2xl font-black text-text-main">{isLoadingTasks ? '…' : completedTasks}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Wallet balance</span>
                            <span className="material-symbols-outlined text-primary text-sm">monetization_on</span>
                        </div>
                        <span className="text-2xl font-black text-text-main">
                            {Number(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} MCOM
                        </span>
                    </div>
                </div>
            </header>

            <div className="p-4 sm:p-8 space-y-6">
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="font-bold text-text-main">Assigned businesses</h2>
                            <p className="text-xs text-text-secondary">Businesses matched to you by Central Hub.</p>
                        </div>
                        {assignedBusinesses?.manager && (
                            <span className="text-[11px] font-semibold text-slate-500">
                                {assignedBusinesses.manager.name} · {assignedBusinesses.manager.email}
                            </span>
                        )}
                    </div>
                    {isLoadingBusinesses ? (
                        <div className="px-6 py-10 text-center text-sm text-slate-500">Loading assigned businesses…</div>
                    ) : assignedBusinesses?.error ? (
                        <div className="px-6 py-8 text-sm text-red-700 bg-red-50 border-t border-red-100">
                            {assignedBusinesses.error}
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300">storefront</span>
                            <p className="mt-2 text-sm font-semibold text-slate-700">No businesses assigned yet</p>
                            <p className="mt-1 text-xs text-slate-500">Central Hub assigns businesses to you based on territory and membership.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Business</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Location</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Membership</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Acquired by</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Assigned</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {businesses.map((business: AssignedBusiness) => (
                                        <tr key={business.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-text-main text-sm">{business.businessName}</p>
                                                <p className="text-[11px] text-slate-500">{business.email || business.businessType || 'Business'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600">{businessLocation(business)}</td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                                                    {business.membershipPlanName || business.membershipLevel || 'Standard'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600">
                                                {business.acquiredByAffiliateName ? (
                                                    <span className="font-semibold text-slate-800">
                                                        {business.acquiredByAffiliateName}
                                                        <span className="ml-1 font-normal capitalize text-slate-400">
                                                            ({(business.acquiredByAffiliateRole || 'affiliate').replaceAll('_', ' ')})
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">Direct signup</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600">{formatDate(business.accountManagerAssignedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <div className="flex flex-col xl:flex-row gap-6">
                    <section className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="font-bold text-text-main">My tasks</h2>
                            <Link href="/dashboard/account-manager/tasks" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View all</Link>
                        </div>
                        {isLoadingTasks ? (
                            <div className="px-6 py-10 text-center text-sm text-slate-500">Loading tasks…</div>
                        ) : tasksError ? (
                            <div className="border-t border-amber-100 bg-amber-50 px-6 py-5">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined mt-0.5 text-xl text-amber-700">
                                        {user?.verificationStatus === 'verified' ? 'info' : 'verified_user'}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-amber-950">
                                            {taskError?.code === 'VERIFICATION_PENDING'
                                                ? 'Your account is awaiting administrator verification'
                                                : taskError?.code === 'VERIFICATION_REJECTED'
                                                    ? 'Your verification needs attention'
                                                    : taskError?.code === 'ONBOARDING_REQUIRED'
                                                        ? 'Finish onboarding to unlock delegated tasks'
                                                        : 'Tasks are temporarily unavailable'}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-amber-900">{taskErrorMessage}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void refetchTasks()}
                                                className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-amber-700 px-3 text-xs font-bold text-white hover:bg-amber-800"
                                            >
                                                <span className="material-symbols-outlined text-base">refresh</span>
                                                Check again
                                            </button>
                                            {user?.verificationStatus !== 'verified' && needsOnboardingSteps && (
                                                <Link
                                                    href="/onboarding"
                                                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 text-xs font-bold text-amber-900 hover:bg-amber-100"
                                                >
                                                    Continue onboarding
                                                </Link>
                                            )}
                                            {user?.verificationStatus === 'verified' && !user?.isOnboarded && (
                                                <Link
                                                    href="/onboarding"
                                                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 text-xs font-bold text-amber-900 hover:bg-amber-100"
                                                >
                                                    Finish onboarding
                                                </Link>
                                            )}
                                            {user?.verificationStatus === 'rejected' && (
                                                <Link
                                                    href="/onboarding?edit-profile=1"
                                                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-300 bg-white px-3 text-xs font-bold text-red-800 hover:bg-red-50"
                                                >
                                                    Update submission
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : myTasks.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-300">assignment</span>
                                <p className="mt-2 text-sm font-semibold text-slate-700">No tasks assigned yet</p>
                                <p className="mt-1 text-xs text-slate-500">Tasks delegated to you by Central Hub businesses appear here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {myTasks.slice(0, 6).map((task: Task) => (
                                    <Link key={task.id} href={`/dashboard/account-manager/tasks/${task.id}`} className="flex items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-text-main">{task.title}</p>
                                            <p className="truncate text-[11px] text-slate-500">
                                                {task.centralBusinessName || 'Central Hub'} · due {formatDate(task.dueDate)}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${statusStyles[task.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {task.status.replaceAll('_', ' ')}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-w-0">
                        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">forum</span>
                                <h2 className="font-black text-text-main text-sm uppercase tracking-widest">Messaging Hub</h2>
                            </div>
                            <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black rounded-full uppercase">Live</span>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[360px]">
                            {activeConversation && (
                                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-semibold text-slate-600">
                                    Chatting with {activeConversation.participant?.name || 'participant'}
                                </div>
                            )}
                            <div className="p-4 flex flex-col gap-3">
                                {conversations && conversations.length > 0 ? (
                                    conversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            onClick={() => setSelectedConvId(conv.id)}
                                            className={`flex gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                                selectedConvId === conv.id ? 'bg-primary/5 border-primary/20 shadow-md ring-1 ring-primary/10' : 'bg-white border-transparent hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="size-10 rounded-full bg-slate-800 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                                                {conv.participant?.name?.slice(0, 2).toUpperCase() || '??'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-xs font-black text-text-main truncate">{conv.participant?.name}</span>
                                                    <span className="text-[10px] font-bold text-text-secondary">
                                                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-medium text-text-secondary truncate leading-relaxed">
                                                    {conv.lastMessageContent || 'Start a conversation…'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center py-10 opacity-50">No active conversations</p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                            <div className="relative">
                                <input
                                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-4 pr-10 text-[11px] font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Write a quick response…"
                                    type="text"
                                    value={replyText}
                                    onChange={(event) => setReplyText(event.target.value)}
                                    onKeyDown={(event) => event.key === 'Enter' && handleSendReply()}
                                    disabled={!selectedConvId || isSending}
                                />
                                <button
                                    onClick={handleSendReply}
                                    disabled={!selectedConvId || isSending || !replyText.trim()}
                                    className="absolute right-2.5 top-2 text-primary hover:scale-110 disabled:opacity-30 transition-transform"
                                >
                                    <span className="material-symbols-outlined text-xl">send</span>
                                </button>
                            </div>
                            {!selectedConvId && (
                                <p className="text-[9px] text-center text-slate-400 font-bold uppercase mt-2 tracking-tighter">Select a conversation to reply</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
