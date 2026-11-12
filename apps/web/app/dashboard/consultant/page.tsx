'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useLearningProgress, useLearningResources } from '@/hooks/useLearningResources';
import { Task, useTasks } from '@/hooks/useTasks';
import { useMcomWallet } from '@/hooks/useMcomWallet';
import { useAuthStore } from '@/store/useAuthStore';
import { OverviewStage, QueryMessage, RoleOverview, SummaryCard } from '@/components/dashboard/RoleOverview';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';
import { stabilizeErrorRetry } from '@/lib/requestErrors';
import ReferralPanel from '@/components/dashboard/ReferralPanel';

type Profile = { id: string; name?: string; email?: string; role?: string; isOnboarded?: boolean; isQuizPassed?: boolean; isQualified?: boolean; verificationStatus?: string; referralCode?: string | null; referralLink?: string | null };
type Attempt = { band?: string; percentage?: number } | null;
const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const value = (payload as { data?: unknown }).data;
        if (value && typeof value === 'object' && 'data' in value) return (value as { data: T }).data;
        return value as T;
    }
    return payload as T;
};
const isComplete = (task: Task) => ['completed', 'approved'].includes(task.status.toLowerCase());
const isClosed = (task: Task) => ['completed', 'approved', 'cancelled', 'declined'].includes(task.status.toLowerCase());

export default function ConsultantDashboard() {
    const { user } = useAuthStore();
    const profileQuery = stabilizeErrorRetry(useQuery({ queryKey: ['affiliate-dashboard-profile'], queryFn: async () => unwrap<Profile>((await apiClient.get('/auth/profile')).data) }));
    const profile: Profile | null = profileQuery.data || user as Profile | null;
    const role = (profile?.role || 'consultant').replace('-', '_');
    const attemptQuery = stabilizeErrorRetry(useQuery({ queryKey: ['affiliate-dashboard-latest-attempt'], queryFn: async () => unwrap<Attempt>((await apiClient.get('/assessment/latest-attempt')).data) }));
    const resourcesQuery = useLearningResources(role);
    const progressQuery = useLearningProgress(Boolean(profile?.id));
    const verified = profile?.verificationStatus?.toLowerCase() === 'verified';
    const isPendingVerification = profile?.verificationStatus?.toLowerCase() === 'pending' || (!verified && profile?.verificationStatus !== 'rejected');
    const hasTaskAccess = Boolean(verified && profile?.isOnboarded);
    const tasksQuery = useTasks({ limit: 50, enabled: hasTaskAccess });
    const walletQuery = useMcomWallet();

    const myTasks = profile?.id ? (tasksQuery.tasks || []).filter((task) => task.assignedAgentId === profile.id || (task.assigneeEmail && task.assigneeEmail.toLowerCase() === profile.email?.toLowerCase())) : [] as Task[];
    const sessions = myTasks.filter((task) => task.type?.toLowerCase() === 'consultancy');
    const activeTasks = myTasks.filter((task) => !isClosed(task));
    const completedTasks = myTasks.filter(isComplete);
    const awaitingReview = myTasks.filter((task) => task.status === 'submitted');
    const changesRequested = myTasks.filter((task) => task.status === 'revision_requested');
    const resources = resourcesQuery.data || [];
    const completedResources = (progressQuery.data || []).filter((item) => item.status === 'completed').length;
    const latestAttempt = attemptQuery.data;
    const displayName = profile?.name || user?.name || 'Consultant';

    const stages: OverviewStage[] = [
        { title: 'Profile', detail: profile?.isOnboarded === true ? 'Onboarding marked complete' : profile?.isOnboarded === false ? 'Onboarding is incomplete' : 'No profile completion status recorded', state: profile?.isOnboarded === true ? 'complete' : profile?.isOnboarded === false ? 'active' : 'unknown', href: '/dashboard/consultant/profile' },
        { title: 'Verification', detail: profile?.verificationStatus?.toLowerCase() === 'pending' ? '' : profile?.verificationStatus?.replaceAll('_', ' ') || 'Not recorded', state: verified ? 'complete' : profile?.verificationStatus === 'rejected' ? 'blocked' : profile?.verificationStatus === 'pending' ? 'pending' : profile?.verificationStatus ? 'active' : 'unknown', href: '/dashboard/consultant/verification' },
        { title: 'Learning', detail: resourcesQuery.isError || progressQuery.isError ? 'Learning status unavailable' : resources.length ? `${completedResources} of ${resources.length} resources completed` : 'No resources available for this role', state: resourcesQuery.isError || progressQuery.isError ? 'unknown' : resources.length && completedResources === resources.length ? 'complete' : completedResources ? 'active' : 'unknown', href: '/dashboard/consultant/learning' },
        { title: 'Assessments', detail: attemptQuery.isError ? 'Assessment status unavailable' : latestAttempt ? `${latestAttempt.band}${latestAttempt.percentage != null ? ` · ${latestAttempt.percentage}%` : ''}` : profile?.isQuizPassed ? 'Quiz passed' : 'Assessment not started', state: attemptQuery.isError ? 'unknown' : latestAttempt?.band?.toLowerCase() === 'fail' ? 'blocked' : profile?.isQuizPassed || ['pass', 'partial'].includes(latestAttempt?.band?.toLowerCase() || '') ? 'complete' : latestAttempt ? 'active' : 'unknown', href: '/dashboard/consultant/assessment' },
        { title: 'Tasks', detail: tasksQuery.isError ? 'Assignments unavailable' : activeTasks.length ? `${activeTasks.length} active assignment${activeTasks.length === 1 ? '' : 's'}` : myTasks.length && completedTasks.length === myTasks.length ? 'Assigned work is complete' : myTasks.length ? 'No open assignments' : 'No assignments recorded', state: tasksQuery.isError ? 'unknown' : activeTasks.length ? 'active' : myTasks.length && completedTasks.length === myTasks.length ? 'complete' : 'unknown', href: '/dashboard/consultant/tasks' },
    ];

    let nextStep = { title: 'Review your assigned consultancy work', detail: activeTasks.length ? `You have ${activeTasks.length} active assignment${activeTasks.length === 1 ? '' : 's'} to review.` : 'Open your task and session lists to check for new assignments.', href: '/dashboard/consultant/tasks', action: 'Open tasks' };
    if (changesRequested.length) nextStep = { title: 'Revise and resubmit your work', detail: `${changesRequested.length} assignment${changesRequested.length === 1 ? ' has' : 's have'} feedback requesting changes.`, href: '/dashboard/consultant/tasks', action: 'Review feedback' };
    else if (awaitingReview.length) nextStep = { title: 'Your submitted work is awaiting review', detail: `${awaitingReview.length} submission${awaitingReview.length === 1 ? ' is' : 's are'} with the reviewer.`, href: '/dashboard/consultant/tasks', action: 'View submissions' };
    else if (profile?.verificationStatus === 'rejected') nextStep = { title: 'Review your verification status', detail: 'Your account has a persisted rejected status. Open your profile for the recorded status and available next step.', href: '/dashboard/consultant/profile', action: 'Review profile' };
    else if (isPendingVerification) nextStep = { title: 'Verification under administrator review', detail: 'Your profile and quiz have been submitted. An administrator is currently reviewing your ID verification before client assignments unlock.', href: '/dashboard/consultant/verification', action: 'Check verification' };
    else if (activeTasks.length === 0 && sessions.length > 0) nextStep = { title: 'Check your consultancy sessions', detail: `You have ${sessions.length} consultancy assignment${sessions.length === 1 ? '' : 's'} in your work history.`, href: '/dashboard/consultant/sessions', action: 'View sessions' };

    return (
        <RoleOverview name={displayName.split(/\s+/)[0]} description="Follow your professional progress and manage consultancy work assigned to you." stages={stages} nextStep={nextStep} profileHref="/dashboard/consultant/profile">
            {profileQuery.isError && <RequestErrorState area="Consultant profile" label="Profile status" error={profileQuery.error} onRetry={() => void profileQuery.refetch()} supportHref="/dashboard/consultant/messages" />}
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
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-lg font-semibold text-slate-950">Consultant work</h2><p className="mt-0.5 text-xs text-slate-600">Assigned work, sessions and delivery status from your account.</p></div></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard title="Active assignments" value={!hasTaskAccess ? '0' : tasksQuery.isLoading ? '…' : tasksQuery.isError ? '—' : String(activeTasks.length)} detail={!hasTaskAccess ? 'Assignments unlock once your verification is approved.' : tasksQuery.isError ? 'Your assignments could not be loaded.' : activeTasks.length ? 'Tasks currently assigned to your account.' : 'No active assignments are recorded.'} href="/dashboard/consultant/tasks" action="Open tasks" state={!hasTaskAccess ? undefined : tasksQuery.isError ? 'Unavailable' : undefined} />
                    <SummaryCard title="Awaiting review" value={!hasTaskAccess ? '0' : tasksQuery.isLoading ? '…' : tasksQuery.isError ? '—' : String(awaitingReview.length)} detail={!hasTaskAccess ? 'Assignments awaiting reviewer decision will appear here.' : tasksQuery.isError ? 'Submission status could not be loaded.' : 'Work you submitted and is awaiting reviewer action.'} href="/dashboard/consultant/tasks" action="View submissions" state={!hasTaskAccess ? undefined : tasksQuery.isError ? 'Unavailable' : undefined} />
                    <SummaryCard title="Changes requested" value={!hasTaskAccess ? '0' : tasksQuery.isLoading ? '…' : tasksQuery.isError ? '—' : String(changesRequested.length)} detail={!hasTaskAccess ? 'Assignments requiring revision will appear here.' : tasksQuery.isError ? 'Revision status could not be loaded.' : 'Assignments returned with feedback for revision.'} href="/dashboard/consultant/tasks" action="Review feedback" state={!hasTaskAccess ? undefined : tasksQuery.isError ? 'Unavailable' : undefined} />
                    <SummaryCard title="Completed assignments" value={!hasTaskAccess ? '0' : tasksQuery.isLoading ? '…' : tasksQuery.isError ? '—' : String(completedTasks.length)} detail={!hasTaskAccess ? 'Completed client work records will appear here.' : tasksQuery.isError ? 'Completion records could not be loaded.' : 'Tasks with completed or approved status.'} href="/dashboard/consultant/tasks" action="View tasks" state={!hasTaskAccess ? undefined : tasksQuery.isError ? 'Unavailable' : undefined} />
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-3">
                    <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-950">Assigned work</h2><p className="mt-1 text-xs text-slate-500">Personal assignments only</p></div><Link href="/dashboard/consultant/tasks" className="text-xs font-semibold text-blue-700 hover:underline">View all</Link></div>
                    <QueryMessage
                        loading={tasksQuery.isLoading}
                        error={tasksQuery.isError}
                        empty={myTasks.length === 0}
                        onRetry={() => void tasksQuery.refetch()}
                        emptyContent={
                            <div className="py-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">assignment</span>
                                <p className="mt-2 text-sm font-semibold text-slate-700">
                                    {!hasTaskAccess ? 'Assignments unlock after verification' : 'No tasks assigned yet'}
                                </p>
                                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                                    {!hasTaskAccess
                                        ? 'Your verification is under review. Assigned work from CHS businesses will appear here once approved.'
                                        : 'Tasks delegated to your account from CHS businesses will appear here.'}
                                </p>
                            </div>
                        }
                    >
                        <ul className="divide-y divide-slate-100">{myTasks.slice(0, 5).map((task) => <li key={task.id}><Link href={`/dashboard/consultant/tasks/${task.id}`} className="flex flex-wrap justify-between gap-2 py-3"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{task.title}</span><span className="mt-0.5 block text-xs text-slate-500">{task.centralBusinessName || 'Assigned by Central Hub'}{task.dueDate ? ` · Due ${new Date(task.dueDate).toLocaleDateString()}` : ''}</span></span><span className="self-center text-xs capitalize text-slate-600">{task.status.replaceAll('_', ' ')}</span></Link></li>)}</ul>
                    </QueryMessage>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-2">
                    <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-950">Consultancy sessions</h2><p className="mt-1 text-xs text-slate-500">Consultancy-type assignments in your task records</p></div><Link href="/dashboard/consultant/sessions" className="text-xs font-semibold text-blue-700 hover:underline">Sessions</Link></div>
                    {!hasTaskAccess ? (
                        <div className="py-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">event_available</span>
                            <p className="mt-2 text-sm font-semibold text-slate-700">Sessions unlock after verification</p>
                            <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                                Client appointments and consultation sessions will appear here once your ID verification is approved.
                            </p>
                        </div>
                    ) : tasksQuery.isLoading && !tasksQuery.isError ? (
                        <p className="py-3 text-xs text-slate-500">Loading sessions…</p>
                    ) : tasksQuery.isError ? (
                        <RequestErrorState area="Consultancy sessions" label="Consultancy sessions" error={tasksQuery.error} onRetry={() => void tasksQuery.refetch()} supportHref="/dashboard/consultant/messages" />
                    ) : sessions.length ? (
                        <ul className="divide-y divide-slate-100">{sessions.slice(0, 4).map((session) => <li key={session.id}><Link href={`/dashboard/consultant/tasks/${session.id}`} className="flex justify-between gap-2 py-3"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{session.title}</span><span className="mt-0.5 block text-xs text-slate-500">{session.dueDate ? `Due ${new Date(session.dueDate).toLocaleDateString()}` : 'No date recorded'}</span></span><span className="self-center text-xs capitalize text-slate-600">{session.status.replaceAll('_', ' ')}</span></Link></li>)}</ul>
                    ) : (
                        <div className="py-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">event_available</span>
                            <p className="mt-2 text-sm font-semibold text-slate-700">No consultancy sessions yet</p>
                            <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                                Scheduled client appointments and consultation sessions will appear here.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <SummaryCard
                    title="Earnings"
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
                                : 'Current Central Hub MCOM balance; transaction details are available on Earnings.'
                    }
                    href="/dashboard/consultant/earnings"
                    action="Open earnings"
                    state={walletQuery.isError ? 'Unavailable' : undefined}
                />
                <SummaryCard title="Learning" value={resourcesQuery.isLoading || progressQuery.isLoading ? '…' : resourcesQuery.isError || progressQuery.isError ? '—' : `${completedResources}/${resources.length}`} detail={resourcesQuery.isError || progressQuery.isError ? 'Learning data failed to load.' : resources.length ? 'Published resources completed for your account role.' : 'No learning resources are currently available for this role.'} href="/dashboard/consultant/learning" action="Open Learning Hub" state={resourcesQuery.isError || progressQuery.isError ? 'Unavailable' : undefined} />
            </section>

            <ReferralPanel
                referralCode={profile?.referralCode ?? user?.referralCode}
                referralLink={profile?.referralLink ?? user?.referralLink}
            />
        </RoleOverview>
    );
}
