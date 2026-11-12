'use client';

import Link from 'next/link';
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
const businessLocation = (business: AssignedBusiness) => {
    const parts: string[] = [];
    if (business.city?.name) parts.push(business.city.name);
    if (business.city?.region && business.city.region.toLowerCase() !== business.city?.name?.toLowerCase()) {
        parts.push(business.city.region);
    }
    if (business.postcode) parts.push(business.postcode);
    return parts.join(', ') || business.address || 'Location not provided';
};

const getMembershipBadge = (level?: string | null, planName?: string | null) => {
    const name = (planName || level || 'Standard').toLowerCase();
    if (name.includes('gold')) {
        return {
            label: planName || 'Gold',
            className: 'border-amber-300 bg-amber-50 text-amber-950',
            icon: 'workspace_premium',
        };
    }
    if (name.includes('silver')) {
        return {
            label: planName || 'Silver',
            className: 'border-slate-300 bg-slate-100 text-slate-800',
            icon: 'military_tech',
        };
    }
    if (name.includes('bronze')) {
        return {
            label: planName || 'Bronze',
            className: 'border-orange-300/90 bg-orange-50 text-orange-950',
            icon: 'stars',
        };
    }
    return {
        label: planName || level || 'Standard',
        className: 'border-blue-200 bg-blue-50 text-blue-900',
        icon: 'verified',
    };
};

export default function AccountManagerDashboard() {
    const { user } = useAuthStore();
    const profileQuery = stabilizeErrorRetry(useQuery({ queryKey: ['affiliate-dashboard-profile'], queryFn: async () => unwrap<Profile>((await apiClient.get('/auth/profile')).data) }));
    const profile: Profile | null = profileQuery.data || user as Profile | null;
    const role = (profile?.role || 'account_manager').replace('-', '_');
    const attemptQuery = stabilizeErrorRetry(useQuery({ queryKey: ['affiliate-dashboard-latest-attempt'], queryFn: async () => unwrap<Attempt>((await apiClient.get('/assessment/latest-attempt')).data) }));
    const resourcesQuery = useLearningResources(role);
    const progressQuery = useLearningProgress(Boolean(profile?.id));
    const verified = profile?.verificationStatus?.toLowerCase() === 'verified';
    const isPendingVerification = profile?.verificationStatus?.toLowerCase() === 'pending' || (!verified && profile?.verificationStatus !== 'rejected');
    const hasTaskAccess = Boolean(verified && profile?.isOnboarded);
    const tasksQuery = useTasks({ limit: 50, enabled: hasTaskAccess });
    const reviewTasksQuery = useManagedTasks({ status: 'SUBMITTED', limit: 50 }, hasTaskAccess);
    const businessesQuery = useAssignedBusinesses();
    const projectsQuery = useManagedProjects({ limit: 50 }, hasTaskAccess);
    const walletQuery = useMcomWallet();

    const myTasks = profile?.id ? (tasksQuery.tasks || []).filter((task) => task.assignedAgentId === profile.id || (task.assigneeEmail && task.assigneeEmail.toLowerCase() === profile.email?.toLowerCase())) : [] as Task[];
    const assignedBusinesses = businessesQuery.data;
    const isLoadingBusinesses = businessesQuery.isLoading;
    const businesses = assignedBusinesses?.businesses || [];
    const completedResources = (progressQuery.data || []).filter((row) => row.status === 'completed').length;
    const resources = resourcesQuery.data || [];
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
    else if (isPendingVerification) nextStep = { title: 'Verification under administrator review', detail: 'Your profile and quiz have been submitted. An administrator is currently reviewing your ID verification before client assignments unlock.', href: '/dashboard/account-manager/verification', action: 'Check verification' };

    return (
        <RoleOverview name={displayName.split(/\s+/)[0]} description="Track your account setup and the businesses, projects and tasks assigned to you." stages={stages} nextStep={nextStep} profileHref="/dashboard/account-manager/profile">
            {profileQuery.isError && <RequestErrorState area="Account Manager profile" label="Profile status" error={profileQuery.error} onRetry={() => void profileQuery.refetch()} supportHref="/dashboard/account-manager/messages" />}
            {isPendingVerification && (
                <section className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-xl text-blue-700 mt-0.5">verified_user</span>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Verification in progress</h3>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                Your profile and quiz have been submitted. An administrator is currently reviewing your ID verification before client assignments unlock.
                            </p>
                        </div>
                    </div>
                </section>
            )}
            <section>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <div><h2 className="text-lg font-semibold text-slate-950">Account Manager work</h2><p className="mt-0.5 text-sm text-slate-600">Your assigned businesses and personal task queue.</p></div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard title="Assigned businesses" value={businessesQuery.isLoading ? '…' : businessesUnavailable ? '—' : String(businessesQuery.data?.total ?? businesses.length)} detail={businessesUnavailable ? 'Central Hub business data failed to load.' : businesses.length ? 'Businesses matched to you by Central Hub.' : 'Central Hub returned no businesses for your account.'} href="/dashboard/account-manager/businesses" action={businessesUnavailable ? 'Review status' : 'View businesses'} state={businessesUnavailable ? 'Unavailable' : undefined} />
                    <SummaryCard title="My active tasks" value={!hasTaskAccess ? '0' : tasksQuery.isLoading ? '…' : tasksQuery.isError ? '—' : String(activeTasks)} detail={!hasTaskAccess ? 'Tasks unlock once your verification is approved.' : tasksQuery.isError ? 'Task assignments could not be loaded.' : activeTasks ? 'Tasks assigned directly to your account.' : 'No tasks are currently assigned to you.'} href="/dashboard/account-manager/tasks" action="Open tasks" state={!hasTaskAccess ? undefined : tasksQuery.isError ? 'Unavailable' : undefined} />
                    <SummaryCard title="Awaiting my review" value={!hasTaskAccess ? '0' : reviewTasksQuery.isLoading ? '…' : reviewTasksQuery.isError ? '—' : String(pendingReview)} detail={!hasTaskAccess ? 'Review queue will activate once verified.' : reviewTasksQuery.isError ? 'Review submissions could not be loaded.' : 'Managed assignments waiting for your review.'} href="/dashboard/account-manager/tasks" action="Review submissions" state={!hasTaskAccess ? undefined : reviewTasksQuery.isError ? 'Unavailable' : undefined} />
                    <SummaryCard title="Managed projects" value={!hasTaskAccess ? '0' : projectsQuery.isLoading ? '…' : projectsQuery.isError ? '—' : String(projects.length)} detail={!hasTaskAccess ? 'Projects will appear once verified.' : projectsQuery.isError ? 'Managed projects could not be loaded.' : projects.length ? 'Projects assigned to your manager account.' : 'No managed projects are currently recorded.'} href="/dashboard/account-manager/tasks" action="Open work queue" state={!hasTaskAccess ? undefined : projectsQuery.isError ? 'Unavailable' : undefined} />
                </div>
            </section>

            <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-4.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <span className="material-symbols-outlined !text-lg leading-none">storefront</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-bold text-slate-900">Assigned businesses</h2>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                        {businesses.length}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">Businesses matched to you by Central Hub.</p>
                            </div>
                        </div>
                        {assignedBusinesses?.manager && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                                <span className="material-symbols-outlined !text-sm text-slate-400">person</span>
                                <span className="font-semibold text-slate-800">{assignedBusinesses.manager.name}</span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-500">{assignedBusinesses.manager.email}</span>
                            </div>
                        )}
                    </div>
                    {isLoadingBusinesses && !businessesUnavailable ? (
                        <div className="px-6 py-12 text-center text-sm font-medium text-slate-500">
                            <span className="inline-block size-4 animate-spin rounded-full border-2 border-blue-200 border-b-blue-600 mr-2 align-middle" />
                            Loading assigned businesses…
                        </div>
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
                        <div className="divide-y divide-slate-100">
                            {businesses.map((business: AssignedBusiness) => {
                                const location = businessLocation(business);
                                const badge = getMembershipBadge(business.membershipLevel, business.membershipPlanName);
                                const initials = business.businessName
                                    ? business.businessName.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                                    : 'BZ';
                                return (
                                    <div
                                        key={business.id}
                                        className="group flex flex-col gap-3.5 p-4 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4.5"
                                    >
                                        {/* Left: Avatar + Business details */}
                                        <div className="flex items-start gap-3.5 min-w-0">
                                            {business.logoUrl ? (
                                                <img
                                                    src={business.logoUrl}
                                                    alt={business.businessName}
                                                    className="size-11 shrink-0 rounded-xl border border-slate-200/90 object-cover shadow-2xs"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={`flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-100/80 bg-blue-50/70 font-black text-sm tracking-wide text-blue-700 shadow-2xs ${
                                                    business.logoUrl ? 'hidden' : ''
                                                }`}
                                            >
                                                {initials}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                                                        {business.businessName}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                                                        <span className="material-symbols-outlined !text-[12px] leading-none">
                                                            {badge.icon}
                                                        </span>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                    {business.email && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <span className="material-symbols-outlined !text-xs leading-none text-slate-400">mail</span>
                                                            <span className="truncate max-w-[200px] sm:max-w-none">{business.email}</span>
                                                        </span>
                                                    )}
                                                    {location !== 'Location not provided' && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <span className="material-symbols-outlined !text-xs leading-none text-slate-400">location_on</span>
                                                            <span>{location}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Meta chips + Action Button */}
                                        <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Source */}
                                                <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-[11px] text-slate-600">
                                                    <span className="text-slate-400">Source:</span>
                                                    {business.acquiredByAffiliateName ? (
                                                        <span className="font-semibold text-slate-800">
                                                            {business.acquiredByAffiliateName}
                                                            <span className="ml-1 font-normal text-slate-400">
                                                                ({(business.acquiredByAffiliateRole || 'affiliate').replaceAll('_', ' ')})
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="font-medium text-slate-600">Direct signup</span>
                                                    )}
                                                </div>

                                                {/* Assigned date */}
                                                {business.accountManagerAssignedAt && (
                                                    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-[11px] text-slate-600">
                                                        <span className="material-symbols-outlined !text-xs leading-none text-slate-400">calendar_today</span>
                                                        <span>Assigned {formatDate(business.accountManagerAssignedAt)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Link
                                                href="/dashboard/account-manager/tasks"
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-700"
                                            >
                                                <span>View work</span>
                                                <span className="material-symbols-outlined !text-sm leading-none text-slate-400">
                                                    arrow_forward
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
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
