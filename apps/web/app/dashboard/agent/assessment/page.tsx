'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

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
type AssignedAssessment = { id: string; title: string; instructions?: string | null; dueAt?: string | null; questionCount: number; status: string; score?: number | null; maxScore?: number | null; percentage?: number | null; createdAt: string };

const RETAKE_DELAY_MS = 24 * 60 * 60 * 1000;

export default function AssessmentQualificationPage() {
    const { retakeAvailableAt, clearQuizAnswers } = useOnboardingStore();
    const { user } = useAuthStore();
    const [now, setNow] = useState(0);

    const profileQuery = stabilizeErrorRetry(
        useQuery({
            queryKey: ['assessment-profile'],
            queryFn: async () => (await apiClient.get<AssessmentProfile>('/auth/profile')).data,
        }),
    );
    const attemptQuery = stabilizeErrorRetry(
        useQuery({
            queryKey: ['assessment-latest-attempt'],
            queryFn: async () => (await apiClient.get<AssessmentAttempt | null>('/assessment/latest-attempt')).data,
        }),
    );
    const assignmentsQuery = stabilizeErrorRetry(
        useQuery({
            queryKey: ['my-assessment-assignments'],
            queryFn: async () => (await apiClient.get<AssignedAssessment[]>('/assessment/assignments')).data,
        }),
    );

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

    const savedCooldown = isFailed ? retakeAvailableAt ?? 0 : 0;
    const attemptCooldown = isFailed && latestAttempt ? new Date(latestAttempt.createdAt).getTime() + RETAKE_DELAY_MS : 0;
    const retakeAvailableTime = isFailed ? Math.max(savedCooldown, attemptCooldown) || null : null;
    const isRetakeLocked = Boolean(retakeAvailableTime && retakeAvailableTime > now);
    const remainingHours = retakeAvailableTime && isRetakeLocked
        ? Math.ceil((retakeAvailableTime - now) / (60 * 60 * 1000))
        : 0;
    const isLoading = profileQuery.isLoading || attemptQuery.isLoading;
    const hasError = profileQuery.isError || attemptQuery.isError;

    const handleRetake = () => {
        clearQuizAnswers();
        window.location.assign('/dashboard/agent/assessment/retake');
    };

    return (
        <div className="min-h-[calc(100vh-7rem)] bg-[#f7f8fc] font-display text-slate-950">
            <div className="mx-auto w-full max-w-[1500px] space-y-3 py-2 sm:space-y-4 sm:py-4 lg:py-5">
                <header className="mb-1">
                    <h1 className="text-lg font-bold leading-tight sm:text-2xl">Assessment &amp; Qualification</h1>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-600 sm:text-sm">Track your results and assessments assigned by an administrator.</p>
                </header>

                <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5" aria-live="polite">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-bold">Your current status</h2>
                            <p className="mt-0.5 text-[10px] text-slate-500">Your onboarding assessment and qualification progress.</p>
                        </div>
                        {!isLoading && !hasError && (
                            <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${isQualified ? 'bg-emerald-100 text-emerald-800' : isFailed ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}>
                                {qualificationStatus}
                            </span>
                        )}
                    </div>

                    {isLoading && !hasError ? (
                        <p className="mt-2 text-xs text-slate-500">Loading your assessment status…</p>
                    ) : hasError ? (
                        <div className="mt-2">
                            <RequestErrorState
                                area="Assessment status"
                                label="Assessment status"
                                error={profileQuery.error ?? attemptQuery.error}
                                onRetry={() => {
                                    void profileQuery.refetch();
                                    void attemptQuery.refetch();
                                }}
                                supportHref="/dashboard/agent/messages"
                            />
                        </div>
                    ) : (
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <div className="rounded-md bg-slate-50 p-2.5 sm:p-3">
                                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Assessment</p>
                                <p className={`mt-1 text-sm font-bold ${isFailed ? 'text-red-700' : hasPassedAssessment ? 'text-emerald-700' : 'text-slate-900'}`}>{assessmentStatus}</p>
                            </div>
                            <div className="rounded-md bg-slate-50 p-2.5 sm:p-3">
                                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Qualification</p>
                                <p className="mt-1 text-sm font-bold text-slate-900">{qualificationStatus}</p>
                            </div>
                            <div className="col-span-2 rounded-md bg-slate-50 p-2.5 sm:col-span-1 sm:p-3">
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

                <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                        <div><h2 className="text-sm font-bold">Assessments assigned to you</h2><p className="mt-1 text-xs text-slate-600">These are separate assessments assigned directly by an administrator.</p></div>
                        {assignmentsQuery.data?.length ? <span className="text-[10px] text-slate-500">{assignmentsQuery.data.length} assigned</span> : null}
                    </div>
                    {assignmentsQuery.isLoading && !assignmentsQuery.isError ? <p className="mt-3 text-xs text-slate-500">Loading assigned assessments…</p> : assignmentsQuery.isError ? <div className="mt-3"><RequestErrorState area="Assigned assessments" label="Assigned assessments" error={assignmentsQuery.error} onRetry={() => void assignmentsQuery.refetch()} supportHref="/dashboard/agent/messages" /></div> : assignmentsQuery.data?.length ? (
                        <div className="mt-3 divide-y divide-slate-100">
                            {assignmentsQuery.data.map((assignment) => {
                                const isFinal = ['pass', 'partial', 'fail'].includes(assignment.status);
                                const statusColor = assignment.status === 'pass' ? 'text-emerald-700' : assignment.status === 'fail' ? 'text-red-700' : assignment.status === 'partial' ? 'text-amber-700' : 'text-blue-700';
                                return <article key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><h3 className="text-sm font-semibold text-slate-900">{assignment.title}</h3><p className="mt-1 text-[11px] text-slate-500">{assignment.questionCount} questions{assignment.dueAt ? ` · Due ${new Date(assignment.dueAt).toLocaleDateString()}` : ''}{assignment.percentage != null ? ` · ${assignment.percentage}%` : ''}</p></div><div className="flex items-center gap-3"><span className={`text-[10px] font-bold capitalize ${statusColor}`}>{assignment.status.replaceAll('_', ' ')}</span><Link href={`/dashboard/agent/assessment/${assignment.id}`} className="inline-flex min-h-9 items-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50">{isFinal ? 'View result' : assignment.status === 'in_progress' ? 'Continue' : 'Start'}</Link></div></article>;
                            })}
                        </div>
                    ) : <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-600">No standalone assessments have been assigned to you.</p>}
                </section>

                <section className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 sm:p-4">
                    <h2 className="text-sm font-bold">What to do next</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700">
                        {isQualified
                            ? 'Your qualification requirements are complete. Use the Learning Hub to keep your knowledge current.'
                            : isFailed
                                ? 'Review the learning materials, then retake the quiz when it becomes available.'
                                : hasPassedAssessment
                                    ? 'Your assessment is passed. Finish any remaining onboarding requirements to complete qualification.'
                                    : 'Start by reviewing the learning materials, then take the assessment through your onboarding flow.'}
                    </p>
                    {isFailed && isRetakeLocked && <p className="mt-1 text-[10px] font-semibold text-amber-800">Retake available in about {remainingHours} hour{remainingHours === 1 ? '' : 's'}.</p>}
                </section>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Link href="/dashboard/agent/learning" className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-blue-700 bg-white px-4 py-2.5 text-xs font-bold text-blue-800 hover:bg-blue-50">
                        <span className="material-symbols-outlined text-base">school</span>
                        Go to Learning Hub
                    </Link>
                    <button
                        type="button"
                        onClick={handleRetake}
                        disabled={isLoading || hasError || hasPassedAssessment || isRetakeLocked}
                        className="flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <span className="material-symbols-outlined text-base">quiz</span>
                        Retake Quiz
                    </button>
                </div>

                <section className="grid grid-cols-1 gap-2 border-t border-slate-200 pt-3 sm:grid-cols-2">
                    <article className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
                        <h2 className="text-xs font-bold sm:text-sm">Why the assessment matters</h2>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                            The onboarding quiz checks your understanding of the affiliate role, client care, and programme requirements. Its result informs your qualification status.
                        </p>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
                        <h2 className="text-xs font-bold sm:text-sm">What qualification unlocks</h2>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                            Qualification depends on the applicable onboarding requirements and verification checks, not an assessment result alone.
                        </p>
                    </article>
                </section>
                {hasPassedAssessment && !isQualified && (
                    <p className="text-center text-[10px] text-slate-500">Your assessment result alone does not complete qualification. Required profile and onboarding checks still apply.</p>
                )}
                <p className="text-center text-[9px] text-slate-500">Signed in as {user?.email || 'your account'}</p>
            </div>
        </div>
    );
}
