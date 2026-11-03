'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';

type AssessmentAttempt = {
    id: string;
    score: number;
    maxScore: number;
    percentage: number;
    band: string;
    createdAt: string;
};

type AssessmentProfile = {
    isQuizPassed?: boolean;
    isOnboarded?: boolean;
    skills?: string[] | null;
};

const RETAKE_DELAY_MS = 24 * 60 * 60 * 1000;

export default function AssessmentQualificationPage() {
    const { retakeAvailableAt } = useOnboardingStore();
    const { user } = useAuthStore();
    const [now, setNow] = useState(0);

    const profileQuery = useQuery({
        queryKey: ['assessment-profile'],
        queryFn: async () => (await apiClient.get<AssessmentProfile>('/auth/profile')).data,
    });
    const attemptQuery = useQuery({
        queryKey: ['assessment-latest-attempt'],
        queryFn: async () => (await apiClient.get<AssessmentAttempt | null>('/assessment/latest-attempt')).data,
    });

    useEffect(() => {
        const interval = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    const latestAttempt = attemptQuery.data;
    const band = latestAttempt?.band?.toLowerCase();
    const hasPassedAssessment = Boolean(profileQuery.data?.isQuizPassed)
        || band === 'pass'
        || band === 'partial';
    const hasRequiredSkills = Boolean(profileQuery.data?.skills?.length);
    const isQualified = Boolean(profileQuery.data?.isOnboarded && profileQuery.data?.isQuizPassed && hasRequiredSkills);
    const isFailed = band === 'fail';
    const assessmentStatus = latestAttempt
        ? band === 'pass' ? 'Passed' : band === 'fail' ? 'Failed' : latestAttempt.band
        : hasPassedAssessment ? 'Passed' : 'Not Started';
    const qualificationStatus = isQualified
        ? 'Complete'
        : hasPassedAssessment
            ? 'In progress'
            : 'Pending assessment';

    const retakeAvailableTime = useMemo(() => {
        if (!isFailed) return null;
        const savedCooldown = retakeAvailableAt ?? 0;
        const attemptCooldown = latestAttempt ? new Date(latestAttempt.createdAt).getTime() + RETAKE_DELAY_MS : 0;
        return Math.max(savedCooldown, attemptCooldown) || null;
    }, [isFailed, latestAttempt, retakeAvailableAt]);
    const isRetakeLocked = Boolean(retakeAvailableTime && retakeAvailableTime > now);
    const remainingHours = retakeAvailableTime && isRetakeLocked
        ? Math.ceil((retakeAvailableTime - now) / (60 * 60 * 1000))
        : 0;
    const isLoading = profileQuery.isLoading || attemptQuery.isLoading;
    const hasError = profileQuery.isError || attemptQuery.isError;

    const handleRetake = () => {
        window.location.assign('/onboarding?retake=1');
    };

    return (
        <div className="min-h-[calc(100vh-7rem)] bg-[#f7f8fc] px-3.5 py-4 font-display text-slate-950 sm:px-6 sm:py-7">
            <div className="mx-auto max-w-4xl space-y-4">
                <header>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-700">Affiliate qualification</p>
                    <h1 className="mt-1 text-xl font-bold sm:text-2xl">Assessment &amp; Qualification</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                        Your assessment helps confirm you’re ready to represent 247GBS and match you with suitable affiliate opportunities.
                    </p>
                </header>

                <section className="grid gap-3 sm:grid-cols-2">
                    <article className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                        <h2 className="text-sm font-bold">Why the assessment matters</h2>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                            The quiz checks your understanding of the affiliate role, client care, and programme requirements. Its result is recorded with your account and informs your qualification status.
                        </p>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                        <h2 className="text-sm font-bold">What qualification unlocks</h2>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                            Completing the applicable onboarding requirements and passing the assessment can qualify your profile for eligible affiliate roles and assignments. Access remains subject to the platform’s other checks.
                        </p>
                    </article>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5" aria-live="polite">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold">Your current status</h2>
                            <p className="mt-1 text-[11px] text-slate-500">Assessment and qualification information from your account.</p>
                        </div>
                        {!isLoading && !hasError && (
                            <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${isQualified ? 'bg-emerald-100 text-emerald-800' : isFailed ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}>
                                {qualificationStatus}
                            </span>
                        )}
                    </div>

                    {isLoading ? (
                        <p className="mt-4 text-xs text-slate-500">Loading your assessment status…</p>
                    ) : hasError ? (
                        <div className="mt-4 rounded-md bg-red-50 p-3 text-xs text-red-800">
                            We couldn’t load your assessment status. Refresh the page to try again.
                        </div>
                    ) : (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <div className="rounded-md bg-slate-50 p-3">
                                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Assessment</p>
                                <p className={`mt-1 text-sm font-bold ${isFailed ? 'text-red-700' : hasPassedAssessment ? 'text-emerald-700' : 'text-slate-900'}`}>{assessmentStatus}</p>
                            </div>
                            <div className="rounded-md bg-slate-50 p-3">
                                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Qualification</p>
                                <p className="mt-1 text-sm font-bold text-slate-900">{qualificationStatus}</p>
                            </div>
                            <div className="col-span-2 rounded-md bg-slate-50 p-3 sm:col-span-1">
                                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Latest result</p>
                                <p className="mt-1 text-sm font-bold text-slate-900">
                                    {latestAttempt
                                        ? `${latestAttempt.percentage}% · ${latestAttempt.score}/${latestAttempt.maxScore}`
                                        : hasPassedAssessment ? 'Passed' : 'No result yet'}
                                </p>
                                {latestAttempt && <p className="mt-0.5 text-[9px] text-slate-500">{new Date(latestAttempt.createdAt).toLocaleDateString()}</p>}
                            </div>
                        </div>
                    )}
                </section>

                <section className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
                    <h2 className="text-sm font-bold">What to do next</h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                        {isQualified
                            ? 'Your qualification requirements are complete. Use the Learning Hub to keep your knowledge current.'
                            : isFailed
                                ? 'Review the learning materials, then retake the quiz when it becomes available.'
                                : hasPassedAssessment
                                    ? 'Your assessment is passed. Finish any remaining onboarding requirements to complete qualification.'
                                    : 'Start by reviewing the learning materials, then take the assessment through your onboarding flow.'}
                    </p>
                    {isFailed && isRetakeLocked && <p className="mt-2 text-[10px] font-semibold text-amber-800">Retake available in about {remainingHours} hour{remainingHours === 1 ? '' : 's'}.</p>}
                </section>

                <div className="grid gap-2 sm:grid-cols-2">
                    <Link href="/learning" className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-blue-700 bg-white px-4 py-3 text-xs font-bold text-blue-800 hover:bg-blue-50">
                        <span className="material-symbols-outlined text-base">school</span>
                        Go to Learning Hub
                    </Link>
                    <button
                        type="button"
                        onClick={handleRetake}
        disabled={isLoading || hasError || hasPassedAssessment || isRetakeLocked}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <span className="material-symbols-outlined text-base">quiz</span>
                        Retake Quiz
                    </button>
                </div>
                {hasPassedAssessment && !isQualified && (
                    <p className="text-center text-[10px] text-slate-500">Your assessment result alone does not complete qualification. Required profile and onboarding checks still apply.</p>
                )}
                {!isLoading && hasError && (
                    <button type="button" onClick={() => { void profileQuery.refetch(); void attemptQuery.refetch(); }} className="mx-auto block text-[10px] font-semibold text-blue-700 underline">
                        Refresh status
                    </button>
                )}
                <p className="text-center text-[9px] text-slate-500">Signed in as {user?.email || 'your account'}</p>
            </div>
        </div>
    );
}
