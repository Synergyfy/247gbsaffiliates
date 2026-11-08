'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { AssignedBusiness, useAssignedBusinesses } from '@/hooks/useAssignedBusinesses';
import { useLearningProgress, useLearningResources } from '@/hooks/useLearningResources';
import { Task, useManagedProjects, useManagedTasks, useTasks } from '@/hooks/useTasks';
import { useMcomWallet } from '@/hooks/useMcomWallet';
import { useAuthStore } from '@/store/useAuthStore';
import { OverviewStage, RoleOverview, SummaryCard } from '@/components/dashboard/RoleOverview';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';
import { stabilizeErrorRetry } from '@/lib/requestErrors';
import ReferralPanel from '@/components/dashboard/ReferralPanel';

type Profile = { id: string; name?: string; email?: string; role?: string; isOnboarded?: boolean; isQuizPassed?: boolean; isQualified?: boolean; verificationStatus?: string; verificationSubmission?: unknown; referralCode?: string | null; referralLink?: string | null };
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
const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const businessLocation = (business: AssignedBusiness) =>
    [business.city?.name, business.city?.region, business.postcode].filter(Boolean).join(', ') ||
    business.address ||
    'Location not provided';

export default function AccountManagerDashboard() {
    const { user } = useAuthStore();
    const profileQuery = stabilizeErrorRetry(useQuery({ queryKey: ['affiliate-dashboard-profile'], queryFn: async () => unwrap<Profile>((await apiClient.get('/auth/profile')).data) }));
    const profile: Profile | null = profileQuery.data || user as Profile | null;
    const role = (profile?.role || 'account_manager').replace('-', '_');
    const attemptQuery = stabilizeErrorRetry(useQuery({ queryKey: ['affiliate-dashboard-latest-attempt'], queryFn: async () => unwrap<Attempt>((await apiClient.get('/assessment/latest-attempt')).data) }));
    const resourcesQuery = useLearningResources(role);
    const progressQuery = useLearningProgress(Boolean(profile?.id));
    const tasksQuery = useTasks({ limit: 50 });
    const reviewTasksQuery = useManagedTasks({ status: 'SUBMITTED', limit: 50 });
    const businessesQuery = useAssignedBusinesses();
    const projectsQuery = useManagedProjects({ limit: 50 });
    const walletQuery = useMcomWallet();

    const myTasks = profile?.id ? (tasksQuery.tasks || []).filter((task) => task.assignedAgentId === profile.id || (task.assigneeEmail && task.assigneeEmail.toLowerCase() === profile.email?.toLowerCase())) : [] as Task[];
    const assignedBusinesses = businessesQuery.data;
    const isLoadingBusinesses = businessesQuery.isLoading;
    const businesses = assignedBusinesses?.businesses || [];
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
            {profileQuery.isError && <RequestErrorState area="Account Manager profile" label="Profile status" error={profileQuery.error} onRetry={() => void profileQuery.refetch()} supportHref="/dashboard/account-manager/messages" />}
            <section>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <div><h2 className="text-lg font-semibold text-slate-950">Account Manager work</h2><p className="mt-0.5 text-sm text-slate-600">Your assigned businesses and personal task queue.</p></div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard title="Assigned businesses" value={businessesQuery.isLoading ? '…' : businessesUnavailable ? '—' : String(businessesQuery.data?.total ?? businesses.length)} detail={businessesUnavailable ? 'Central Hub business data failed to load.' : businesses.length ? 'Businesses matched to you by Central Hub.' : 'Central Hub returned no businesses for your account.'} href="/dashboard/account-manager/businesses" action={businessesUnavailable ? 'Review status' : 'View businesses'} state={businessesUnavailable ? 'Unavailable' : undefined} />
                    <SummaryCard title="My active tasks" value={tasksQuery.isLoading ? '…' : tasksQuery.isError ? '—' : String(activeTasks)} detail={tasksQuery.isError ? 'Task assignments could not be loaded.' : activeTasks ? 'Tasks assigned directly to your account.' : 'No tasks are currently assigned to you.'} href="/dashboard/account-manager/tasks" action="Open tasks" state={tasksQuery.isError ? 'Unavailable' : undefined} />
                    <SummaryCard title="Awaiting my review" value={reviewTasksQuery.isLoading ? '…' : reviewTasksQuery.isError ? '—' : String(pendingReview)} detail={reviewTasksQuery.isError ? 'Review submissions could not be loaded.' : 'Managed assignments waiting for your review.'} href="/dashboard/account-manager/tasks" action="Review submissions" state={reviewTasksQuery.isError ? 'Unavailable' : undefined} />
                    <SummaryCard title="Managed projects" value={projectsQuery.isLoading ? '…' : projectsQuery.isError ? '—' : String(projects.length)} detail={projectsQuery.isError ? 'Managed projects could not be loaded.' : projects.length ? 'Projects assigned to your manager account.' : 'No managed projects are currently recorded.'} href="/dashboard/account-manager/tasks" action="Open work queue" state={projectsQuery.isError ? 'Unavailable' : undefined} />
                </div>
            </section>

            <div className="space-y-6">
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
                    {isLoadingBusinesses && !businessesUnavailable ? (
                        <div className="px-6 py-10 text-center text-sm text-slate-500">Loading assigned businesses…</div>
                    ) : businessesUnavailable ? (
                        <div className="p-4 sm:p-5">
                            <RequestErrorState
                                area="Assigned businesses"
                                label="Assigned businesses"
                                error={businessesQuery.error ?? new Error(assignedBusinesses?.error || 'Unavailable')}
                                onRetry={() => void businessesQuery.refetch()}
                                supportHref="/dashboard/account-manager/messages"
                            />
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
            </div>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <SummaryCard title="Learning" value={resourcesQuery.isLoading || progressQuery.isLoading ? '…' : resourcesQuery.isError || progressQuery.isError ? '—' : `${completedResources}/${resources.length}`} detail={resourcesQuery.isError || progressQuery.isError ? 'Learning data failed to load.' : resources.length ? 'Published resources completed for your account role.' : 'No learning resources are currently available for this role.'} href="/dashboard/account-manager/learning" action="Open Learning Hub" state={resourcesQuery.isError || progressQuery.isError ? 'Unavailable' : undefined} />
                <SummaryCard
                    title="Wallet"
                    value={
                        walletQuery.isLoading
                            ? '…'
                            : walletQuery.isError
                                ? 'Unavailable'
                                : `${Number(walletQuery.wallet?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} MCOM`
                    }
                    detail={
                        walletQuery.isError
                            ? 'Wallet data failed to load.'
                            : walletQuery.holds?.length
                                ? `${walletQuery.holds.length} hold(s) active · Available: ${Number(walletQuery.wallet?.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} MCOM`
                                : 'Central Hub MCOM balance for task settlements.'
                    }
                    href="/dashboard/account-manager/revenue"
                    action="Open wallet"
                    state={walletQuery.isError ? 'Unavailable' : undefined}
                />
            </section>

            <ReferralPanel
                referralCode={profile?.referralCode ?? user?.referralCode}
                referralLink={profile?.referralLink ?? user?.referralLink}
            />
        </RoleOverview>
    );
}
