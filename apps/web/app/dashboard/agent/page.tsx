'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useLearningProgress, useLearningResources } from '@/hooks/useLearningResources';
import { useTasks } from '@/hooks/useTasks';

type WorkflowStatus = 'not_started' | 'in_progress' | 'pending_review' | 'completed' | 'blocked' | 'failed';
type DashboardProfile = {
    id: string;
    name?: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    role: string;
    bio?: string | null;
    skills?: string[] | null;
    sectorId?: string | null;
    categoryId?: string | null;
    subCategoryId?: string | null;
    verificationStatus?: string;
    verificationNotes?: string | null;
    verificationSubmission?: Record<string, unknown> | null;
    verificationDocumentName?: string | null;
    verificationDocumentMimeType?: string | null;
    verificationReviewedAt?: string | null;
    isOnboarded?: boolean;
    isQuizPassed?: boolean;
};
type AssessmentAttempt = { id: string; score: number; maxScore: number; percentage: number; band: string; createdAt: string };

const unwrap = <T,>(value: unknown): T => {
    if (value && typeof value === 'object' && 'data' in value) {
        const outer = (value as { data?: unknown }).data;
        if (outer && typeof outer === 'object' && 'data' in outer) return (outer as { data: T }).data;
        return outer as T;
    }
    return value as T;
};

const statusLabel: Record<WorkflowStatus, string> = {
    not_started: 'Not started',
    in_progress: 'In progress',
    pending_review: 'Pending review',
    completed: 'Completed',
    blocked: 'Blocked',
    failed: 'Failed',
};

const statusColor: Record<WorkflowStatus, string> = {
    not_started: 'text-slate-500',
    in_progress: 'text-blue-700',
    pending_review: 'text-amber-800',
    completed: 'text-emerald-800',
    blocked: 'text-red-700',
    failed: 'text-red-700',
};

const dotColor: Record<WorkflowStatus, string> = {
    not_started: 'bg-blue-600',
    in_progress: 'bg-blue-600',
    pending_review: 'bg-blue-600',
    completed: 'bg-emerald-600',
    blocked: 'bg-red-600',
    failed: 'bg-red-600',
};

function getDisplayName(profile?: DashboardProfile | null) {
    return [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() || profile?.name || profile?.email?.split('@')[0] || 'Affiliate';
}

function StageCard({ number, title, description, status, href, slideIndex }: { number: number; title: string; description: string; status: WorkflowStatus; href: string; slideIndex: number }) {
    return (
        <Link href={href} data-lifecycle-slide={slideIndex} className="group min-h-[108px] w-[min(40vw,170px)] shrink-0 snap-start rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/30 sm:min-h-[136px] sm:w-auto sm:shrink sm:p-4">
            <div className="flex items-center justify-between gap-2">
                <span className={`flex size-7 items-center justify-center rounded-full ${status === 'completed' ? 'bg-emerald-700 text-white' : status === 'blocked' || status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    <span className="material-symbols-outlined text-[16px]">{status === 'completed' ? 'check' : status === 'blocked' || status === 'failed' ? 'priority_high' : 'arrow_forward'}</span>
                </span>
                <span aria-label={statusLabel[status]} title={statusLabel[status]} className={`size-2.5 rounded-full ${dotColor[status]}`} />
            </div>
            <h3 className="mt-1.5 text-xs font-semibold text-slate-950 sm:mt-3">{number}. {title}</h3>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500 sm:mt-1 sm:leading-relaxed">{description}</p>
        </Link>
    );
}

function CapabilityCard({ icon, title, status, children, href, action }: { icon: string; title: string; status: WorkflowStatus; children: React.ReactNode; href: string; action: string }) {
    return (
        <article className="flex min-h-[188px] flex-col rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-blue-50 text-blue-700"><span className="material-symbols-outlined text-[20px]">{icon}</span></span>
                <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${statusColor[status]}`}><span className={`size-1.5 rounded-full ${dotColor[status]}`} />{statusLabel[status]}</span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-950">{title}</h3>
            <div className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-600">{children}</div>
            <Link href={href} className="mt-4 inline-flex min-h-8 items-center gap-1 self-start text-xs font-semibold text-blue-700 hover:text-blue-900">
                {action}<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>
        </article>
    );
}

export default function AgentDashboard() {
    const { user } = useAuthStore();
    const lifecycleSliderRef = useRef<HTMLDivElement>(null);
    const [activeLifecycleStage, setActiveLifecycleStage] = useState(1);
    const profileQuery = useQuery({
        queryKey: ['affiliate-dashboard-profile'],
        queryFn: async () => unwrap<DashboardProfile>((await apiClient.get('/auth/profile')).data),
    });
    const profile = profileQuery.data || user as DashboardProfile | null;
    const userId = profile?.id || user?.id;
    const rawRole = profile?.role || user?.role || null;
    const role = rawRole === 'account-manager' ? 'account_manager' : rawRole;
    const attemptQuery = useQuery({
        queryKey: ['affiliate-dashboard-latest-attempt'],
        queryFn: async () => unwrap<AssessmentAttempt | null>((await apiClient.get('/assessment/latest-attempt')).data),
    });
    const resourcesQuery = useLearningResources(role);
    const learningProgressQuery = useLearningProgress(Boolean(userId && role));
    const hasTaskAccess = Boolean(profile?.verificationStatus === 'verified' && profile.isOnboarded && profile.isQuizPassed && profile.skills?.length);
    const tasksQuery = useTasks({ assignedAgentId: userId, limit: 50, enabled: Boolean(userId && hasTaskAccess) });

    const isLoading = profileQuery.isLoading || attemptQuery.isLoading || resourcesQuery.isLoading || learningProgressQuery.isLoading || (hasTaskAccess && tasksQuery.isLoading);
    const hasAssessmentPassed = Boolean(profile?.isQuizPassed) || ['pass', 'partial'].includes(attemptQuery.data?.band?.toLowerCase() || '');
    const verificationStatus = profile?.verificationStatus || 'unverified';
    const hasProfileSubmission = Boolean(profile?.verificationSubmission);
    const isQualified = Boolean(profile?.verificationStatus === 'verified' && profile?.isOnboarded && profile?.isQuizPassed && profile?.skills?.length);
    const latestAttempt = attemptQuery.data;
    const learningResources = resourcesQuery.data || [];
    const progress = learningProgressQuery.data || [];
    const progressByResource = new Map(progress.map((row) => [row.resourceId, row.status]));
    const completedResources = learningResources.filter((resource) => progressByResource.get(resource.id) === 'completed').length;
    const learningStatus: WorkflowStatus = learningResources.length > 0 && completedResources === learningResources.length
        ? 'completed'
        : progress.some((row) => row.status === 'in_progress' || row.status === 'completed')
            ? 'in_progress'
            : 'not_started';
    const tasks = tasksQuery.tasks || [];
    const revisionTasks = tasks.filter((task) => task.status === 'revision_requested');
    const assignedTaskStatus: WorkflowStatus = !isQualified
        ? 'blocked'
        : tasks.length === 0
            ? 'not_started'
            : tasks.every((task) => task.status === 'completed')
                ? 'completed'
                : 'in_progress';
    const profileStatus: WorkflowStatus = hasProfileSubmission
        ? 'completed'
        : profile?.bio || profile?.skills?.length || profile?.sectorId || profile?.categoryId
            ? 'in_progress'
            : 'not_started';
    const verificationStageStatus: WorkflowStatus = verificationStatus === 'verified'
        ? 'completed'
        : verificationStatus === 'pending' && hasProfileSubmission
            ? 'pending_review'
            : verificationStatus === 'pending'
                ? 'in_progress'
            : verificationStatus === 'rejected'
                ? 'blocked'
                : 'not_started';
    const assessmentStageStatus: WorkflowStatus = hasAssessmentPassed
        ? 'completed'
        : latestAttempt?.band?.toLowerCase() === 'fail'
            ? 'failed'
            : 'not_started';
    const qualificationStatus: WorkflowStatus = isQualified
        ? 'completed'
        : verificationStatus === 'rejected' || (verificationStatus === 'pending' && hasProfileSubmission)
            ? 'blocked'
            : profile?.isQuizPassed || hasProfileSubmission
                ? 'in_progress'
                : 'not_started';

    const missingQualificationRequirements = [
        verificationStatus !== 'verified' ? 'Admin verification' : null,
        !hasProfileSubmission ? 'Profile and identity submission' : null,
        !profile?.isQuizPassed ? 'Assessment pass' : null,
        !profile?.skills?.length ? 'Selected skills' : null,
        !profile?.isOnboarded ? 'Onboarding completion' : null,
    ].filter(Boolean) as string[];

    let nextAction = {
        eyebrow: 'Recommended next step',
        title: 'Complete your affiliate profile',
        description: 'Submit your profile information and identity document so an administrator can review your verification.',
        href: '/onboarding?edit-profile=1',
        action: 'Continue profile setup',
        icon: 'person_edit',
    };

    if (hasProfileSubmission && verificationStatus === 'rejected') {
        nextAction = { ...nextAction, title: 'Update your verification submission', description: profile?.verificationNotes || 'Review the feedback and resubmit your profile and identity document for administrator review.', action: 'Update submission' };
    } else if (hasProfileSubmission && verificationStatus === 'pending') {
        nextAction = { ...nextAction, title: 'Your identity verification is under review', description: 'You can continue learning while an administrator reviews your submission. We’ll show the persisted verification status here.', href: '/dashboard/agent/verification', action: 'View verification status', icon: 'hourglass_top' };
    } else if (verificationStatus === 'verified' && !hasAssessmentPassed && latestAttempt?.band?.toLowerCase() === 'fail') {
        nextAction = { ...nextAction, title: 'Review learning resources before retaking your assessment', description: 'Your latest assessment result was not a pass. Review the published learning materials, then return to the assessment when retake rules allow.', href: '/learning', action: 'Open Learning Hub', icon: 'school' };
    } else if (verificationStatus === 'verified' && !hasAssessmentPassed) {
        nextAction = { ...nextAction, title: 'Complete your assessment', description: 'Your profile is verified. Take the existing affiliate assessment to continue toward qualification.', href: '/dashboard/agent/assessment', action: 'Open assessment', icon: 'quiz' };
    } else if (!isQualified && hasAssessmentPassed) {
        nextAction = { ...nextAction, title: 'Complete the remaining qualification requirements', description: missingQualificationRequirements.length ? `Still required: ${missingQualificationRequirements.join(', ')}.` : 'Finish the remaining onboarding checks before taking on assigned work.', href: '/dashboard/agent/qualification', action: 'Review qualification', icon: 'workspace_premium' };
    } else if (isQualified && revisionTasks.length > 0) {
        nextAction = { ...nextAction, title: 'Changes requested on your work', description: `You have ${revisionTasks.length} task${revisionTasks.length === 1 ? '' : 's'} needing changes. Review the feedback and resubmit.`, href: '/dashboard/agent/tasks', action: 'Review changes', icon: 'rate_review' };
    } else if (isQualified && tasks.length > 0) {
        nextAction = { ...nextAction, title: 'Review your assigned tasks', description: `You have ${tasks.length} assigned task${tasks.length === 1 ? '' : 's'}. Check the instructions and current status in My Tasks.`, href: '/dashboard/agent/tasks', action: 'Open My Tasks', icon: 'assignment' };
    } else if (isQualified) {
        nextAction = { ...nextAction, title: 'Your profile is ready for assigned work', description: 'You have met the current qualification checks. Administrators assign tasks through the platform when work is available.', href: '/dashboard/agent/tasks', action: 'View My Tasks', icon: 'assignment' };
    }

    const greeting = getDisplayName(profile).split(/\s+/)[0];
    const stageItems = [
        { title: 'Profile', description: hasProfileSubmission ? 'Information submitted' : 'Profile information needed', status: profileStatus, href: '/dashboard/agent/profile' },
        { title: 'Verification', description: verificationStatus === 'verified' ? 'Admin review complete' : verificationStatus === 'pending' && hasProfileSubmission ? 'Awaiting admin review' : verificationStatus === 'rejected' ? 'Update submission' : 'Submit profile and identity details', status: verificationStageStatus, href: '/dashboard/agent/verification' },
        { title: 'Learning', description: learningResources.length ? `${completedResources} of ${learningResources.length} published resources complete` : 'No published resources for your role', status: learningStatus, href: '/learning' },
        { title: 'Assessment', description: latestAttempt ? `${latestAttempt.band} · ${latestAttempt.percentage}%` : hasAssessmentPassed ? 'Passed' : 'No result recorded', status: assessmentStageStatus, href: '/dashboard/agent/assessment' },
        { title: 'Qualification', description: isQualified ? 'Current requirements complete' : missingQualificationRequirements[0] || 'Requirements remain', status: qualificationStatus, href: '/dashboard/agent/qualification' },
        { title: 'Tasks', description: !isQualified ? 'Available after qualification' : tasks.length ? `${tasks.length} assigned task${tasks.length === 1 ? '' : 's'}` : 'Waiting for an admin assignment', status: assignedTaskStatus, href: '/dashboard/agent/tasks' },
    ] as const;

    if (isLoading) return <div className="mx-auto flex min-h-[55vh] max-w-6xl items-center justify-center gap-3 text-sm text-slate-500"><span className="size-6 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />Loading your dashboard…</div>;

    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-4 sm:space-y-7">
            {(profileQuery.isError || attemptQuery.isError) && <div role="alert" className="flex flex-wrap items-center justify-between gap-2 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-xs text-red-900">
                <span>Some account or assessment information could not be refreshed. Displayed values may be from your current signed-in profile.</span>
                <button type="button" onClick={() => { void profileQuery.refetch(); void attemptQuery.refetch(); }} className="font-semibold underline">Retry</button>
            </div>}

            <section className="flex flex-col justify-between gap-2 border-b border-slate-200 pb-3 sm:gap-4 sm:pb-5 sm:flex-row sm:items-end">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-blue-700">Overview</p>
                    <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-950 sm:mt-1 sm:text-[28px]">Welcome back, {greeting}</h1>
                    <p className="mt-1 hidden max-w-2xl text-sm leading-relaxed text-slate-600 sm:block">Track your profile, verification, learning and work assignments in one place.</p>
                </div>
            </section>

            <section aria-labelledby="lifecycle-heading">
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2 sm:mb-3">
                    <div><h2 id="lifecycle-heading" className="text-base font-semibold text-slate-950">Lifecycle progress</h2><p className="mt-0.5 hidden text-xs text-slate-500 sm:block">Statuses reflect your current saved account information.</p></div>
                </div>
                <div
                    ref={lifecycleSliderRef}
                    role="region"
                    aria-label="Lifecycle progress stages"
                    tabIndex={0}
                    onScroll={(event) => {
                        const slider = event.currentTarget;
                        if (window.matchMedia('(min-width: 640px)').matches) return;
                        const scrollInset = Number.parseFloat(window.getComputedStyle(slider).scrollPaddingLeft) || 24;
                        const snapLine = slider.getBoundingClientRect().left + slider.clientLeft + scrollInset;
                        const slides = slider.querySelectorAll<HTMLElement>('[data-lifecycle-slide]');
                        let nearestIndex = 0;
                        let nearestDistance = Number.POSITIVE_INFINITY;
                        slides.forEach((slide, index) => {
                            const distance = Math.abs(slide.getBoundingClientRect().left - snapLine);
                            if (distance < nearestDistance) {
                                nearestDistance = distance;
                                nearestIndex = index;
                            }
                        });
                        setActiveLifecycleStage(nearestIndex + 1);
                    }}
                    className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:scroll-px-0 sm:px-0 sm:pb-0 sm:snap-none md:grid-cols-3 2xl:grid-cols-6"
                >
                    {stageItems.map((stage, index) => <StageCard key={stage.title} number={index + 1} slideIndex={index} {...stage} />)}
                </div>
                <div className="mt-2 flex sm:hidden" role="group" aria-label="Lifecycle stage slider controls">
                    <span className="sr-only" aria-live="polite">Stage {activeLifecycleStage} of {stageItems.length}</span>
                    <div className="flex w-full items-center gap-1.5">
                        {stageItems.map((stage, index) => (
                            <button
                                key={stage.title}
                                type="button"
                                aria-label={`Show ${stage.title} stage, ${index + 1} of ${stageItems.length}`}
                                aria-current={activeLifecycleStage === index + 1 ? 'step' : undefined}
                                onClick={() => {
                                    const slider = lifecycleSliderRef.current;
                                    const slide = slider?.querySelector<HTMLElement>(`[data-lifecycle-slide="${index}"]`);
                                    if (!slider || !slide) return;
                                    const scrollInset = Number.parseFloat(window.getComputedStyle(slider).scrollPaddingLeft) || 24;
                                    const snapLine = slider.getBoundingClientRect().left + slider.clientLeft + scrollInset;
                                    slider.scrollBy({ left: slide.getBoundingClientRect().left - snapLine, behavior: 'smooth' });
                                }}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${index === activeLifecycleStage - 1 ? 'bg-blue-700' : 'bg-slate-200'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section aria-labelledby="next-action-heading" className="grid gap-3 rounded-lg bg-[#202b42] px-4 py-4 text-white shadow-sm sm:gap-4 sm:rounded-xl sm:px-7 sm:py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="max-w-3xl">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-blue-200">{nextAction.eyebrow}</p>
                    <h2 id="next-action-heading" className="mt-1.5 text-base font-semibold leading-snug sm:mt-2 sm:text-xl">{nextAction.title}</h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">{nextAction.description}</p>
                </div>
                <Link href={nextAction.href} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-blue-500 sm:px-5">
                    {nextAction.action}<span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
            </section>

            <section aria-labelledby="capabilities-heading">
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2 sm:mb-3">
                    <div><h2 id="capabilities-heading" className="text-base font-semibold text-slate-950">Your account at a glance</h2><p className="mt-0.5 text-xs text-slate-500">Current status and the next useful place to go.</p></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <CapabilityCard icon="person" title="Profile Completion" status={profileStatus} href="/dashboard/agent/profile" action="Manage profile">
                        {hasProfileSubmission ? 'Your profile information has been submitted for verification.' : 'Complete and submit your profile information to begin verification.'}
                    </CapabilityCard>
                    <CapabilityCard icon="verified_user" title="Identity & Verification" status={verificationStageStatus} href="/dashboard/agent/verification" action="View verification">
                        {verificationStatus === 'rejected' ? profile?.verificationNotes || 'Update your submission for another review.' : verificationStatus === 'pending' ? 'Your submitted identity information is awaiting administrator review.' : verificationStatus === 'verified' ? 'An administrator has verified your identity.' : 'Submit your identity document and profile for administrator review.'}
                    </CapabilityCard>
                    <CapabilityCard icon="school" title="Learning Hub" status={learningStatus} href="/learning" action="Open Learning Hub">
                        {resourcesQuery.isError || learningProgressQuery.isError ? 'Learning progress could not be loaded.' : learningResources.length ? `${completedResources} of ${learningResources.length} published resources completed.` : 'No published learning resources are currently available for your role.'}
                    </CapabilityCard>
                    <CapabilityCard icon="quiz" title="Assessment" status={assessmentStageStatus} href="/dashboard/agent/assessment" action="View assessment">
                        {latestAttempt ? `Latest result: ${latestAttempt.band}, ${latestAttempt.percentage}% on ${new Date(latestAttempt.createdAt).toLocaleDateString()}.` : hasAssessmentPassed ? 'Your account records a passed assessment.' : 'No assessment result has been recorded yet.'}
                    </CapabilityCard>
                    <CapabilityCard icon="workspace_premium" title="Qualification" status={qualificationStatus} href="/dashboard/agent/qualification" action="Review requirements">
                        {isQualified ? 'Your persisted verification, onboarding, assessment and skill requirements are complete.' : `Outstanding: ${missingQualificationRequirements.slice(0, 3).join(', ') || 'onboarding completion'}.`}
                    </CapabilityCard>
                    <CapabilityCard icon="assignment" title="Assigned Tasks" status={assignedTaskStatus} href="/dashboard/agent/tasks" action="Open My Tasks">
                        {!isQualified ? 'Task access becomes available after the current qualification requirements are met.' : tasksQuery.isError ? 'Assigned tasks could not be loaded.' : tasks.length ? `${tasks.length} administrator-assigned task${tasks.length === 1 ? '' : 's'} in your task list.` : 'There are no administrator-assigned tasks for your account yet.'}
                    </CapabilityCard>
                </div>
            </section>
        </div>
    );
}
