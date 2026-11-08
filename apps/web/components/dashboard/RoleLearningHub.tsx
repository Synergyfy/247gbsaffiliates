'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
    LearningHubResource,
    LearningProgressStatus,
    useLearningProgress,
    useLearningResources,
    useUpdateLearningProgress,
} from '@/hooks/useLearningResources';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';

type NormalizedRole = 'agent' | 'account_manager' | 'consultant';

type ProfileData = {
    id?: string;
    name?: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
    isQuizPassed?: boolean;
    isQualified?: boolean;
    isOnboarded?: boolean;
};

type AttemptData = {
    id?: string;
    score?: number;
    maxScore?: number;
    percentage?: number;
    band?: string;
    createdAt?: string;
} | null;

const RETAKE_DELAY_MS = 24 * 60 * 60 * 1000;

function unwrap<T>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const outer = (payload as { data?: unknown }).data;
        if (outer && typeof outer === 'object' && 'data' in outer) {
            return (outer as { data: T }).data;
        }
        return outer as T;
    }
    return payload as T;
}

function normalizeRole(raw?: string | null): NormalizedRole {
    const clean = (raw || 'agent').toLowerCase().replace('-', '_');
    if (clean === 'account_manager') return 'account_manager';
    if (clean === 'consultant') return 'consultant';
    return 'agent';
}

function getRoleMeta(role: NormalizedRole) {
    if (role === 'account_manager') {
        return {
            label: 'Account Manager',
            root: '/dashboard/account-manager',
            assessmentHref: '/dashboard/account-manager/assessment',
            retakeHref: '/dashboard/account-manager/assessment/retake',
        };
    }
    if (role === 'consultant') {
        return {
            label: 'Consultant',
            root: '/dashboard/consultant',
            assessmentHref: '/dashboard/consultant/assessment',
            retakeHref: '/dashboard/consultant/assessment/retake',
        };
    }
    return {
        label: 'Affiliate Agent',
        root: '/dashboard/agent',
        assessmentHref: '/dashboard/agent/assessment',
        retakeHref: '/dashboard/agent/assessment/retake',
    };
}

function formatCountdown(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

export function RoleLearningHub({
    roleOverride,
    standalone = false,
}: {
    roleOverride?: NormalizedRole;
    standalone?: boolean;
}) {
    const {
        role: onboardingRole,
        quizResult,
        retakeAvailableAt,
        clearQuizAnswers,
    } = useOnboardingStore();
    const { user } = useAuthStore();

    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | LearningProgressStatus>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [now, setNow] = useState<number>(() => Date.now());

    const profileQuery = useQuery({
        queryKey: ['learning-hub-profile'],
        queryFn: async () => unwrap<ProfileData>((await apiClient.get('/auth/profile')).data),
    });

    const attemptQuery = useQuery({
        queryKey: ['learning-hub-latest-attempt'],
        queryFn: async () => unwrap<AttemptData>((await apiClient.get('/assessment/latest-attempt')).data),
    });

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const profile = profileQuery.data || (user as ProfileData | null);
    const activeRole = roleOverride || normalizeRole(profile?.role || user?.role || onboardingRole);
    const roleMeta = getRoleMeta(activeRole);

    const {
        data: resources = [],
        isLoading: isResourcesLoading,
        isError: isResourcesError,
        error: resourcesError,
        refetch: refetchResources,
    } = useLearningResources(activeRole);

    const {
        data: progress = [],
        isLoading: isProgressLoading,
        isError: isProgressError,
        error: progressError,
        refetch: refetchProgress,
    } = useLearningProgress(Boolean(activeRole));

    const updateProgress = useUpdateLearningProgress();

    const progressByResource = useMemo(
        () => new Map<string, LearningProgressStatus>(progress.map((item) => [item.resourceId, item.status])),
        [progress],
    );

    const attempt = attemptQuery.data || (quizResult ? {
        score: quizResult.score,
        maxScore: quizResult.maxScore,
        percentage: quizResult.percentage,
        band: quizResult.band,
    } : null);

    const band = attempt?.band?.toLowerCase();
    const hasPassedAssessment =
        Boolean(profile?.isQuizPassed) ||
        Boolean(user?.isQuizPassed) ||
        band === 'pass' ||
        band === 'partial';
    const isFailed = band === 'fail';

    const storeCooldown = isFailed ? retakeAvailableAt ?? 0 : 0;
    const attemptCooldown =
        isFailed && attempt?.createdAt ? new Date(attempt.createdAt).getTime() + RETAKE_DELAY_MS : 0;
    const retakeTargetTimestamp = Math.max(storeCooldown, attemptCooldown) || null;

    const isRetakeLocked = Boolean(retakeTargetTimestamp && retakeTargetTimestamp > now);
    const timeRemainingMs = isRetakeLocked && retakeTargetTimestamp ? retakeTargetTimestamp - now : 0;

    const categories = useMemo(() => {
        return Array.from(
            new Map(
                resources
                    .filter((resource) => resource.category)
                    .map((resource) => [resource.category!.id, resource.category!]),
            ).values(),
        );
    }, [resources]);

    const completedCount = useMemo(
        () => resources.filter((r) => progressByResource.get(r.id) === 'completed').length,
        [resources, progressByResource],
    );
    const inProgressCount = useMemo(
        () => resources.filter((r) => progressByResource.get(r.id) === 'in_progress').length,
        [resources, progressByResource],
    );
    const completionPct = resources.length > 0 ? Math.round((completedCount / resources.length) * 100) : 0;

    const filteredResources = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return resources.filter((resource) => {
            const status = progressByResource.get(resource.id) || 'not_started';
            if (categoryFilter !== 'all' && resource.category?.id !== categoryFilter) {
                return false;
            }
            if (statusFilter !== 'all' && status !== statusFilter) {
                return false;
            }
            if (q) {
                const hay = [
                    resource.title,
                    resource.description,
                    resource.category?.name,
                    ...(resource.tags || []),
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [resources, progressByResource, categoryFilter, statusFilter, searchQuery]);

    const handleStartResource = (resourceId: string) => {
        if (!progressByResource.has(resourceId) || progressByResource.get(resourceId) === 'not_started') {
            updateProgress.mutate({ resourceId, status: 'in_progress' });
        }
    };

    const handleCompleteResource = (resourceId: string) => {
        updateProgress.mutate({ resourceId, status: 'completed' });
    };

    const handleRetakeQuiz = () => {
        clearQuizAnswers();
        window.location.assign(roleMeta.retakeHref);
    };

    const isLoading = isResourcesLoading || isProgressLoading;
    const isError = isResourcesError || isProgressError;

    const assessmentStatusLabel = attempt
        ? band === 'pass'
            ? 'Passed'
            : band === 'fail'
              ? 'Failed'
              : attempt.band || 'Recorded'
        : hasPassedAssessment
          ? 'Passed'
          : 'Not started';

    return (
        <div className={standalone ? 'min-h-screen bg-[#f7f8fc] px-3 py-4 sm:px-6 sm:py-6 font-display text-slate-950' : 'mx-auto w-full max-w-[1500px] space-y-4 px-3 py-3 sm:px-5 sm:py-4 lg:px-7 font-display text-slate-950'}>
            <div className={standalone ? 'mx-auto w-full max-w-[1500px] space-y-4' : 'space-y-4'}>
                {/* Header */}
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                            {roleMeta.label} workspace · Advancement
                        </p>
                        <h1 className="mt-0.5 text-lg font-bold leading-tight text-slate-950 sm:text-2xl">
                            Learning Hub
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
                            Complete role-specific training modules to strengthen your skills and prepare for your assessment.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {standalone && (
                            <Link
                                href={roleMeta.root}
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                Dashboard
                            </Link>
                        )}
                        <Link
                            href={roleMeta.assessmentHref}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
                        >
                            <span className="material-symbols-outlined text-[16px]">quiz</span>
                            Assessment &amp; Qualification
                        </Link>
                    </div>
                </header>

                {/* Error Alert */}
                {isError && (
                    <RequestErrorState
                        area="Learning Hub"
                        label="Learning materials"
                        error={resourcesError ?? progressError}
                        onRetry={() => {
                            void refetchResources();
                            void refetchProgress();
                        }}
                        supportHref={`${roleMeta.root}/messages`}
                    />
                )}

                {/* Top Readiness & Progress Summary Card */}
                <section className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Your learning &amp; assessment progress</h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Track completed training modules alongside your onboarding quiz status.
                            </p>
                        </div>
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                completionPct === 100 && resources.length > 0
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : completedCount > 0 || inProgressCount > 0
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {completionPct}% complete
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {/* KPI 1: Module Completion */}
                        <div className="rounded-lg bg-slate-50 p-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                    Modules completed
                                </p>
                                <span className="text-xs font-bold tabular-nums text-blue-700">
                                    {completedCount} / {resources.length}
                                </span>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        completionPct === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${completionPct}%` }}
                                />
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-500">
                                {inProgressCount > 0
                                    ? `${inProgressCount} module${inProgressCount === 1 ? '' : 's'} in progress`
                                    : resources.length === 0
                                      ? 'No published modules yet'
                                      : completedCount === resources.length
                                        ? 'All published modules completed'
                                        : `${resources.length - completedCount} remaining`}
                            </p>
                        </div>

                        {/* KPI 2: Assessment Status */}
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                Onboarding assessment
                            </p>
                            <p
                                className={`mt-1 text-sm font-bold ${
                                    isFailed
                                        ? 'text-rose-700'
                                        : hasPassedAssessment
                                          ? 'text-emerald-700'
                                          : 'text-slate-900'
                                }`}
                            >
                                {assessmentStatusLabel}
                                {attempt?.percentage != null ? ` · ${attempt.percentage}%` : ''}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                                {attempt?.score != null && attempt?.maxScore != null
                                    ? `Raw score: ${attempt.score}/${attempt.maxScore} (50% required)`
                                    : hasPassedAssessment
                                      ? 'Passing threshold met'
                                      : 'Complete modules before taking the quiz'}
                            </p>
                        </div>

                        {/* KPI 3: Next Step / Cooldown */}
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                {isFailed && isRetakeLocked ? 'Retake cooldown' : 'Assessment readiness'}
                            </p>
                            {isFailed && isRetakeLocked ? (
                                <>
                                    <p className="mt-1 text-sm font-bold tabular-nums text-amber-800">
                                        {formatCountdown(timeRemainingMs)}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        Review modules below until retake unlocks.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {hasPassedAssessment
                                            ? 'Qualification passed'
                                            : isFailed
                                              ? 'Retake unlocked'
                                              : 'Ready when you are'}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        {hasPassedAssessment
                                            ? 'Keep your skills sharp with new modules.'
                                            : 'You can launch the role assessment anytime.'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Workflow Action Banner */}
                <section className="flex flex-col gap-3 rounded-xl bg-slate-900 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-300">
                            Workflow next step
                        </p>
                        <p className="mt-0.5 text-sm font-semibold">
                            {hasPassedAssessment
                                ? 'Your onboarding assessment is passed'
                                : isFailed
                                  ? isRetakeLocked
                                      ? 'Review training modules while your retake cooldown completes'
                                      : 'Completed your review? Retake the role assessment now'
                                  : 'Finish reviewing your role modules, then take the assessment'}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-300">
                            {hasPassedAssessment
                                ? 'Check your qualification status or continue to your assigned tasks.'
                                : 'You need a score of 50% or higher on the onboarding quiz to qualify.'}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Link
                            href={roleMeta.assessmentHref}
                            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-slate-600 px-3 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            View Status
                        </Link>
                        {!hasPassedAssessment && (
                            <button
                                type="button"
                                onClick={handleRetakeQuiz}
                                disabled={isRetakeLocked}
                                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                            >
                                <span className="material-symbols-outlined text-[16px]">quiz</span>
                                {isRetakeLocked
                                    ? 'Retake Locked'
                                    : isFailed
                                      ? 'Retake Quiz'
                                      : 'Take Quiz'}
                            </button>
                        )}
                    </div>
                </section>

                {/* Filters Bar */}
                <section className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Category Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {[{ id: 'all', name: 'All Modules' }, ...categories].map((category) => {
                                const active = categoryFilter === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => setCategoryFilter(category.id)}
                                        className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                                            active
                                                ? 'bg-blue-700 text-white'
                                                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Status Filter + Search */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-semibold">
                                {(
                                    [
                                        { id: 'all', label: 'All' },
                                        { id: 'in_progress', label: 'In progress' },
                                        { id: 'completed', label: 'Completed' },
                                        { id: 'not_started', label: 'Not started' },
                                    ] as const
                                ).map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setStatusFilter(tab.id)}
                                        className={`rounded px-2 py-1 transition-colors ${
                                            statusFilter === tab.id
                                                ? 'bg-white text-slate-900 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative min-w-[180px] flex-1 sm:flex-initial">
                                <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                                    search
                                </span>
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search modules…"
                                    aria-label="Search learning modules"
                                    className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resources Grid */}
                {isLoading && !isError ? (
                    <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                        <p className="text-xs font-medium text-slate-500">Loading learning modules…</p>
                    </section>
                ) : filteredResources.length === 0 ? (
                    <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300">school</span>
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No learning modules found</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            {resources.length === 0
                                ? 'No published learning resources are available for your role yet.'
                                : 'No modules match your current category or status filter.'}
                        </p>
                        {resources.length > 0 && (categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCategoryFilter('all');
                                    setStatusFilter('all');
                                    setSearchQuery('');
                                }}
                                className="mt-3 inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                            >
                                Clear filters
                            </button>
                        )}
                    </section>
                ) : (
                    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 sm:gap-4">
                        {filteredResources.map((resource) => (
                            <ResourceModuleCard
                                key={resource.id}
                                resource={resource}
                                status={progressByResource.get(resource.id) || 'not_started'}
                                isUpdating={updateProgress.isPending}
                                onStart={handleStartResource}
                                onComplete={handleCompleteResource}
                            />
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
}

function ResourceModuleCard({
    resource,
    status,
    isUpdating,
    onStart,
    onComplete,
}: {
    resource: LearningHubResource;
    status: LearningProgressStatus;
    isUpdating: boolean;
    onStart: (id: string) => void;
    onComplete: (id: string) => void;
}) {
    const link = resource.articleUrl || resource.videoUrl;
    const isVideo = Boolean(resource.videoUrl && !resource.articleUrl);
    const statusBadge =
        status === 'completed'
            ? { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600' }
            : status === 'in_progress'
              ? { label: 'In progress', className: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600' }
              : { label: 'Not started', className: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' };

    return (
        <article
            className={`flex flex-col justify-between rounded-xl border bg-white p-4 transition-colors ${
                status === 'completed'
                    ? 'border-emerald-200/80'
                    : 'border-slate-200 hover:border-blue-300'
            }`}
        >
            <div>
                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        <span className="material-symbols-outlined text-[13px] text-blue-700">
                            {isVideo ? 'play_circle' : 'menu_book'}
                        </span>
                        {resource.category?.name || (isVideo ? 'Video Module' : 'Reading Module')}
                    </span>
                    <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadge.className}`}
                    >
                        <span className={`size-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                    </span>
                </div>

                <h3 className="mt-2.5 text-sm font-semibold leading-snug text-slate-950 sm:text-[15px]">
                    {resource.title}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {resource.description}
                </p>

                {resource.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {resource.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                {link ? (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onStart(resource.id)}
                        className="inline-flex min-h-8 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                    >
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        Open module
                    </a>
                ) : (
                    <span className="text-[11px] text-slate-400">Resource link pending</span>
                )}

                {status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Completed
                    </span>
                ) : (
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onComplete(resource.id)}
                        className="inline-flex min-h-8 items-center gap-1 rounded-md bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[15px]">done</span>
                        {isUpdating ? 'Saving…' : 'Mark complete'}
                    </button>
                )}
            </div>
        </article>
    );
}

