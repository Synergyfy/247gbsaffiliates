'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';

type Profile = { isQualified?: boolean; isQuizPassed?: boolean; verificationStatus?: string; isOnboarded?: boolean; skills?: string[] | null };
type Attempt = { id?: string; band?: string; percentage?: number; score?: number; maxScore?: number; createdAt?: string } | null;
type Assignment = { id: string; title: string; dueAt?: string | null; questionCount: number; status: string; percentage?: number | null };

const RETAKE_DELAY_MS = 24 * 60 * 60 * 1000;

function unwrap<T,>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const outer = (payload as { data?: unknown }).data;
        if (outer && typeof outer === 'object' && 'data' in outer) return (outer as { data: T }).data;
        return outer as T;
    }
    return payload as T;
}

export function RoleReadinessPage({ role, root }: { role: 'Account Manager' | 'Consultant'; root: string }) {
    const { retakeAvailableAt, clearQuizAnswers } = useOnboardingStore();
    const { user } = useAuthStore();
    const [now, setNow] = useState(() => Date.now());
    const profileQuery = useQuery({
        queryKey: ['assessment-profile'],
        queryFn: async () => unwrap<Profile>((await apiClient.get('/auth/profile')).data),
    });
    const attemptQuery = useQuery({
        queryKey: ['assessment-latest-attempt'],
        queryFn: async () => unwrap<Attempt>((await apiClient.get('/assessment/latest-attempt')).data),
    });
    const assignmentsQuery = useQuery({
        queryKey: ['my-assessment-assignments'],
        queryFn: async () => unwrap<Assignment[]>((await apiClient.get('/assessment/assignments')).data),
    });

    useEffect(() => {
        const interval = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    const profile = profileQuery.data || user as Profile | null;
    const attempt = attemptQuery.data;
    const band = attempt?.band?.toLowerCase();
    const hasPassedAssessment = Boolean(profile?.isQuizPassed) || band === 'pass' || band === 'partial';
    const failed = band === 'fail';
    const assessmentLabel = attempt ? (band === 'pass' ? 'Passed' : band === 'fail' ? 'Failed' : attempt.band || 'Result recorded') : hasPassedAssessment ? 'Passed' : 'Not Started';
    const qualificationKnown = typeof profile?.isQualified === 'boolean';
    const qualificationLabel = qualificationKnown ? (profile?.isQualified ? 'Complete' : 'In progress') : 'Not recorded';
    const storeCooldown = failed ? retakeAvailableAt ?? 0 : 0;
    const attemptCooldown = failed && attempt?.createdAt ? new Date(attempt.createdAt).getTime() + RETAKE_DELAY_MS : 0;
    const retakeAvailableTime = Math.max(storeCooldown, attemptCooldown) || null;
    const retakeLocked = Boolean(retakeAvailableTime && retakeAvailableTime > now);
    const remainingHours = retakeLocked && retakeAvailableTime ? Math.ceil((retakeAvailableTime - now) / (60 * 60 * 1000)) : 0;
    const hasError = profileQuery.isError || attemptQuery.isError;
    const loading = profileQuery.isLoading || attemptQuery.isLoading;

    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-4 px-3 py-4 sm:px-5 lg:px-7">
            <header><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">{role} workspace</p><h1 className="mt-0.5 text-xl font-semibold text-slate-950 sm:text-2xl">Assessment &amp; Qualification</h1><p className="mt-1 text-xs text-slate-600 sm:text-sm">Review your quiz result, assigned assessments and qualification status.</p></header>

            {hasError && <div role="alert" className="bg-rose-50 px-3 py-2 text-xs text-rose-800">Some assessment information could not be loaded. <button type="button" onClick={() => { void profileQuery.refetch(); void attemptQuery.refetch(); void assignmentsQuery.refetch(); }} className="font-semibold underline">Try again</button></div>}

            <section className="border border-slate-200 bg-white p-3 sm:p-4" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold text-slate-900">Your current status</h2></div>
                {loading ? <p className="mt-3 text-xs text-slate-500">Loading your assessment status…</p> : !hasError ? <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"><div className="bg-slate-50 p-3"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Onboarding assessment</p><p className={`mt-1 text-sm font-semibold ${failed ? 'text-rose-700' : hasPassedAssessment ? 'text-emerald-700' : 'text-slate-900'}`}>{assessmentLabel}</p></div><div className="bg-slate-50 p-3"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Qualification</p><p className="mt-1 text-sm font-semibold text-slate-900">{qualificationLabel}</p></div><div className="col-span-2 bg-slate-50 p-3 sm:col-span-1"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Latest result</p><p className="mt-1 text-sm font-semibold text-slate-900">{attempt ? `${attempt.percentage ?? 0}% · ${attempt.score ?? 0}/${attempt.maxScore ?? 0}` : hasPassedAssessment ? 'Passed' : 'No result yet'}</p>{attempt?.createdAt && <p className="mt-0.5 text-[10px] text-slate-500">{new Date(attempt.createdAt).toLocaleDateString()}</p>}</div></div> : null}
            </section>

            <section className="border border-slate-200 bg-white p-3 sm:p-4">
                <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-sm font-semibold text-slate-900">Assessments assigned to you</h2><p className="mt-0.5 text-xs text-slate-600">Separate assessments assigned directly by an administrator.</p></div>{assignmentsQuery.data?.length ? <span className="text-[11px] text-slate-500">{assignmentsQuery.data.length} assigned</span> : null}</div>
                {assignmentsQuery.isLoading ? <p className="mt-3 text-xs text-slate-500">Loading assigned assessments…</p> : assignmentsQuery.isError ? <div role="alert" className="mt-3 bg-rose-50 px-3 py-2 text-xs text-rose-800">Assigned assessments could not be loaded. <button type="button" onClick={() => void assignmentsQuery.refetch()} className="font-semibold underline">Try again</button></div> : assignmentsQuery.data?.length ? <ul className="mt-2 divide-y divide-slate-100">{assignmentsQuery.data.map((assignment) => { const final = ['pass', 'partial', 'fail'].includes(assignment.status); return <li key={assignment.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5"><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{assignment.title}</span><span className="mt-0.5 block text-[11px] text-slate-500">{assignment.questionCount} questions{assignment.dueAt ? ` · Due ${new Date(assignment.dueAt).toLocaleDateString()}` : ''}{assignment.percentage != null ? ` · ${assignment.percentage}%` : ''}</span></span><span className="flex items-center gap-3"><span className="text-[11px] capitalize text-slate-600">{assignment.status.replaceAll('_', ' ')}</span><Link href={`${root}/assessment/${assignment.id}`} className="inline-flex min-h-8 items-center text-xs font-semibold text-blue-700 hover:underline">{final ? 'View result' : assignment.status === 'in_progress' ? 'Continue' : 'Start'}</Link></span></li>; })}</ul> : <p className="mt-2 py-2 text-xs text-slate-500">No standalone assessments have been assigned to you.</p>}
            </section>

            <section className="flex flex-col gap-3 bg-slate-900 p-4 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-blue-200">Next step</p><p className="mt-1 text-sm font-semibold">{failed ? 'Review and retake the quiz' : hasPassedAssessment ? 'Review your qualification status' : 'Take the onboarding quiz'}</p><p className="mt-1 text-xs text-slate-300">{failed ? 'The quiz uses the existing onboarding questions and scoring rules.' : hasPassedAssessment ? 'Passing the quiz does not automatically complete qualification.' : 'Complete the quiz using the existing onboarding assessment.'}</p>{failed && retakeLocked && <p className="mt-1 text-[11px] font-medium text-amber-200">Retake available in about {remainingHours} hour{remainingHours === 1 ? '' : 's'}.</p>}</div><div className="flex shrink-0 flex-wrap gap-2"><Link href={`${root}/learning`} className="inline-flex min-h-9 items-center justify-center gap-1 border border-slate-500 px-3 text-xs font-semibold text-white hover:bg-slate-800"><span className="material-symbols-outlined text-base">school</span>Learning Hub</Link><button type="button" onClick={() => { clearQuizAnswers(); window.location.assign(`${root}/assessment/retake`); }} disabled={loading || hasError || hasPassedAssessment || retakeLocked} className="inline-flex min-h-9 items-center justify-center gap-1 bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"><span className="material-symbols-outlined text-base">quiz</span>Retake Quiz</button></div></section>

            <section className="grid gap-3 sm:grid-cols-2"><article className="border border-slate-200 bg-white p-3"><h2 className="text-xs font-semibold text-slate-900">Why the assessment matters</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">The onboarding quiz checks understanding of the role and programme requirements. Its result is saved through the existing assessment workflow.</p></article><article className="border border-slate-200 bg-white p-3"><h2 className="text-xs font-semibold text-slate-900">Qualification status</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">Qualification depends on applicable requirements and administrator review. It is shown as complete only when the profile provides a persisted decision.</p></article></section>
        </div>
    );
}

export function RoleNotificationsPage({ role }: { role: string }) {
    return <div className="mx-auto w-full max-w-[1500px] space-y-3 px-3 py-4 sm:px-5 lg:px-7"><header><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">{role} workspace</p><h1 className="mt-0.5 text-xl font-semibold text-slate-950 sm:text-2xl">Notifications</h1><p className="mt-1 text-xs text-slate-600 sm:text-sm">Updates about your account and assigned work.</p></header><section className="py-3 text-xs text-slate-500">A notification feed is not available from the current backend contract. Messages remain available in your inbox.</section></div>;
}
