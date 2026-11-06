'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useAssignedBusinesses } from '@/hooks/useAssignedBusinesses';
import { useLearningProgress, useLearningResources } from '@/hooks/useLearningResources';
import { Task, useManagedProjects, useManagedTasks, useTasks } from '@/hooks/useTasks';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/store/useAuthStore';
import { OverviewStage, QueryMessage, RoleOverview, SummaryCard } from '@/components/dashboard/RoleOverview';

type Profile = { id: string; name?: string; email?: string; role?: string; isOnboarded?: boolean; isQuizPassed?: boolean; isQualified?: boolean; verificationStatus?: string; verificationSubmission?: unknown };
type Attempt = { band?: string; percentage?: number } | null;
const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const value = (payload as { data?: unknown }).data;
        if (value && typeof value === 'object' && 'data' in value) return (value as { data: T }).data;
        return value as T;
    }
    return payload as T;
};
const closed = (task: Task) => ['completed', 'approved', 'cancelled', 'declined'].includes(task.status.toLowerCase());

export default function AccountManagerDashboard() {
    const { user } = useAuthStore();
    const profileQuery = useQuery({ queryKey: ['affiliate-dashboard-profile'], queryFn: async () => unwrap<Profile>((await apiClient.get('/auth/profile')).data) });
    const profile: Profile | null = profileQuery.data || user as Profile | null;
    const role = (profile?.role || 'account_manager').replace('-', '_');
    const attemptQuery = useQuery({ queryKey: ['affiliate-dashboard-latest-attempt'], queryFn: async () => unwrap<Attempt>((await apiClient.get('/assessment/latest-attempt')).data) });
    const resourcesQuery = useLearningResources(role);
    const progressQuery = useLearningProgress(Boolean(profile?.id));
    const tasksQuery = useTasks({ limit: 50 });
    const reviewTasksQuery = useManagedTasks({ status: 'SUBMITTED', limit: 50 });
    const businessesQuery = useAssignedBusinesses();
    const projectsQuery = useManagedProjects({ limit: 50 });
    const walletQuery = useWallet();

    const myTasks = profile?.id ? (tasksQuery.tasks || []).filter((task) => task.assignedAgentId === profile.id || (task.assigneeEmail && task.assigneeEmail.toLowerCase() === profile.email?.toLowerCase())) : [] as Task[];
    const businesses = businessesQuery.data?.businesses || [];
    const completedResources = (progressQuery.data || []).filter((row) => row.status === 'completed').length;
    const resources = resourcesQuery.data || [];
    const verified = profile?.verificationStatus?.toLowerCase() === 'verified';
    const verificationLabel = profile?.verificationStatus?.replaceAll('_', ' ') || 'Not recorded';
    const latestAttempt = attemptQuery.data;
    const pendingReview = reviewTasksQuery.data?.length || 0;
    const projects = projectsQuery.data || [];
    const businessesUnavailable = businessesQuery.isError || Boolean(businessesQuery.data?.error);
    const activeTasks = myTasks.filter((task) => !closed(task)).length;
    const completedTasks = myTasks.filter((task) => ['completed', 'approved'].includes(task.status.toLowerCase())).length;
    const displayName = profile?.name || user?.name || 'Account Manager';

    const stages: OverviewStage[] = [
        { title: 'Profile', detail: profile?.isOnboarded === true ? 'Onboarding marked complete' : profile?.isOnboarded === false ? 'Onboarding is incomplete' : 'No profile completion status recorded', state: profile?.isOnboarded === true ? 'complete' : profile?.isOnboarded === false ? 'active' : 'unknown', href: '/dashboard/account-manager/profile' },
        { title: 'Verification', detail: profile?.verificationStatus?.toLowerCase() === 'pending' ? '' : verificationLabel, state: verified ? 'complete' : profile?.verificationStatus === 'rejected' ? 'blocked' : profile?.verificationStatus === 'pending' ? 'pending' : profile?.verificationStatus ? 'active' : 'unknown', href: '/dashboard/account-manager/verification' },
        { title: 'Learning', detail: resourcesQuery.isError || progressQuery.isError ? 'Learning status unavailable' : resources.length ? `${completedResources} of ${resources.length} resources completed` : 'No resources available for this role', state: resourcesQuery.isError || progressQuery.isError ? 'unknown' : resources.length > 0 && completedResources === resources.length ? 'complete' : completedResources ? 'active' : 'unknown', href: '/dashboard/account-manager/learning' },
        { title: 'Assessments', detail: attemptQuery.isError ? 'Assessment status unavailable' : latestAttempt ? `${latestAttempt.band}${latestAttempt.percentage != null ? ` · ${latestAttempt.percentage}%` : ''}` : profile?.isQuizPassed ? 'Quiz passed' : 'Assessment not started', state: attemptQuery.isError ? 'unknown' : latestAttempt?.band?.toLowerCase() === 'fail' ? 'blocked' : profile?.isQuizPassed || ['pass', 'partial'].includes(latestAttempt?.band?.toLowerCase() || '') ? 'complete' : latestAttempt ? 'active' : 'unknown', href: '/dashboard/account-manager/assessment' },
        { title: 'Tasks', detail: tasksQuery.isError ? 'Task assignments unavailable' : activeTasks ? `${activeTasks} active assignment${activeTasks === 1 ? '' : 's'}` : myTasks.length && completedTasks === myTasks.length ? 'Assigned work is complete' : myTasks.length ? 'No open assignments' : 'No assignments recorded', state: tasksQuery.isError ? 'unknown' : activeTasks ? 'active' : myTasks.length && completedTasks === myTasks.length ? 'complete' : 'unknown', href: '/dashboard/account-manager/tasks' },
    ];

    let nextStep = { title: 'Review your assigned work', detail: activeTasks ? `You have ${activeTasks} active task${activeTasks === 1 ? '' : 's'}${pendingReview ? ` and ${pendingReview} submission${pendingReview === 1 ? '' : 's'} awaiting review` : ''}.` : 'Check your work queue for tasks and submitted work that needs review.', href: '/dashboard/account-manager/tasks', action: 'Open tasks' };
    if (profile?.verificationStatus === 'rejected') nextStep = { title: 'Review your verification status', detail: 'Your account has a persisted rejected status. Open the verification page for the recorded status and next available step.', href: '/dashboard/account-manager/verification', action: 'Review status' };

    return (
        <RoleOverview name={displayName.split(/\s+/)[0]} description="Track your account setup and the businesses, projects and tasks assigned to you." stages={stages} nextStep={nextStep} profileHref="/dashboard/account-manager/profile">
            {profileQuery.isError && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">The latest profile status could not be loaded. Any profile details above are from the signed-in session. <button type="button" onClick={() => void profileQuery.refetch()} className="font-semibold underline">Retry</button></div>}
            <section>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <div><h2 className="text-lg font-semibold text-slate-950">Account Manager work</h2><p className="mt-0.5 text-sm text-slate-600">Your assigned businesses and personal task queue.</p></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard title="Assigned businesses" value={businessesQuery.isLoading ? '…' : businessesUnavailable ? '—' : String(businessesQuery.data?.total ?? businesses.length)} detail={businessesUnavailable ? 'Central Hub business data failed to load.' : businesses.length ? 'Businesses matched to you by Central Hub.' : 'Central Hub returned no businesses for your account.'} href="/dashboard/account-manager/businesses" action={businessesUnavailable ? 'Review status' : 'View businesses'} state={businessesUnavailable ? 'Unavailable' : undefined} />
                    <SummaryCard title="My active tasks" value={tasksQuery.isLoading ? '…' : tasksQuery.isError ? '—' : String(activeTasks)} detail={tasksQuery.isError ? 'Task assignments could not be loaded.' : activeTasks ? 'Tasks assigned directly to your account.' : 'No tasks are currently assigned to you.'} href="/dashboard/account-manager/tasks" action="Open tasks" state={tasksQuery.isError ? 'Unavailable' : undefined} />
                    <SummaryCard title="Awaiting my review" value={reviewTasksQuery.isLoading ? '…' : reviewTasksQuery.isError ? '—' : String(pendingReview)} detail={reviewTasksQuery.isError ? 'Review submissions could not be loaded.' : 'Managed assignments waiting for your review.'} href="/dashboard/account-manager/tasks" action="Review submissions" state={reviewTasksQuery.isError ? 'Unavailable' : undefined} />
                    <SummaryCard title="Managed projects" value={projectsQuery.isLoading ? '…' : projectsQuery.isError ? '—' : String(projects.length)} detail={projectsQuery.isError ? 'Managed projects could not be loaded.' : projects.length ? 'Projects assigned to your manager account.' : 'No managed projects are currently recorded.'} href="/dashboard/account-manager/tasks" action="Open work queue" state={projectsQuery.isError ? 'Unavailable' : undefined} />
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-5">
                <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-3">
                    <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-950">Assigned businesses</h2><p className="mt-0.5 text-xs text-slate-500">Live assignments from Central Hub</p></div><Link href="/dashboard/account-manager/businesses" className="text-xs font-semibold text-blue-700 hover:underline">View all</Link></div>
                    <QueryMessage loading={businessesQuery.isLoading} error={businessesUnavailable} empty={businesses.length === 0} onRetry={() => void businessesQuery.refetch()}>
                        <ul className="divide-y divide-slate-100">{businesses.slice(0, 4).map((business) => <li key={business.id} className="flex flex-wrap justify-between gap-2 py-3"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{business.businessName || 'Business'}</span><span className="mt-0.5 block text-xs text-slate-500">{[business.city?.name, business.city?.region, business.postcode].filter(Boolean).join(', ') || business.address || 'Location not provided'}</span></span><span className="self-center text-xs text-slate-500">{business.membershipPlanName || business.membershipLevel || 'Membership not listed'}</span></li>)}</ul>
                    </QueryMessage>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-2">
                    <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-950">My tasks</h2><p className="mt-1 text-xs text-slate-500">Only assignments associated with your account</p></div><Link href="/dashboard/account-manager/tasks" className="text-xs font-semibold text-blue-700 hover:underline">View all</Link></div>
                    <QueryMessage loading={tasksQuery.isLoading} error={tasksQuery.isError} empty={myTasks.length === 0} onRetry={() => void tasksQuery.refetch()}>
                        <ul className="divide-y divide-slate-100">{myTasks.slice(0, 4).map((task) => <li key={task.id}><Link href={`/dashboard/account-manager/tasks/${task.id}`} className="flex justify-between gap-3 py-3"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{task.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{task.centralBusinessName || task.projectName || 'Assigned task'}</span></span><span className="shrink-0 self-center text-xs capitalize text-slate-600">{task.status.replaceAll('_', ' ')}</span></Link></li>)}</ul>
                    </QueryMessage>
                </section>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <SummaryCard title="Learning" value={resourcesQuery.isLoading || progressQuery.isLoading ? '…' : resourcesQuery.isError || progressQuery.isError ? '—' : `${completedResources}/${resources.length}`} detail={resourcesQuery.isError || progressQuery.isError ? 'Learning data failed to load.' : resources.length ? 'Published resources completed for your account role.' : 'No learning resources are currently available for this role.'} href="/learning" action="Open Learning Hub" state={resourcesQuery.isError || progressQuery.isError ? 'Unavailable' : undefined} />
                <SummaryCard title="Wallet" value={walletQuery.isLoading ? '…' : walletQuery.isError ? 'Unavailable' : `${walletQuery.wallet?.currency || 'GBP'} ${Number(walletQuery.wallet?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} detail={walletQuery.isError ? 'Wallet data failed to load.' : 'Current balance from your wallet.'} href="/dashboard/account-manager/revenue" action="Open wallet" state={walletQuery.isError ? 'Unavailable' : undefined} />
            </section>
        </RoleOverview>
    );
}
