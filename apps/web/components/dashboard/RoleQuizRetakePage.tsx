'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { QuizStep } from '@/components/onboarding/QuizStep';
import { useOnboardingStore } from '@/store/useOnboardingStore';

type Profile = { isQuizPassed?: boolean };
type Attempt = { band?: string; createdAt?: string } | null;
const RETAKE_DELAY_MS = 24 * 60 * 60 * 1000;

function unwrap<T,>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const outer = (payload as { data?: unknown }).data;
        if (outer && typeof outer === 'object' && 'data' in outer) return (outer as { data: T }).data;
        return outer as T;
    }
    return payload as T;
}

export function RoleQuizRetakePage({ root, role }: { root: string; role: string }) {
    const { clearQuizAnswers, setStep, retakeAvailableAt } = useOnboardingStore();
    const [now, setNow] = useState(0);
    const profileQuery = useQuery({
        queryKey: ['assessment-profile'],
        queryFn: async () => unwrap<Profile>((await apiClient.get('/auth/profile')).data),
    });
    const attemptQuery = useQuery({
        queryKey: ['assessment-latest-attempt'],
        queryFn: async () => unwrap<Attempt>((await apiClient.get('/assessment/latest-attempt')).data),
    });

    useEffect(() => {
        clearQuizAnswers();
        setStep('quiz');
    }, [clearQuizAnswers, setStep]);

    useEffect(() => {
        const interval = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    const attempt = attemptQuery.data;
    const failed = attempt?.band?.toLowerCase() === 'fail';
    const passed = Boolean(profileQuery.data?.isQuizPassed) || ['pass', 'partial'].includes(attempt?.band?.toLowerCase() || '');
    const attemptCooldown = failed && attempt?.createdAt ? new Date(attempt.createdAt).getTime() + RETAKE_DELAY_MS : 0;
    const cooldownUntil = failed ? Math.max(retakeAvailableAt ?? 0, attemptCooldown) : 0;
    const locked = Boolean(cooldownUntil && (!now || cooldownUntil > now));
    const remainingHours = locked ? Math.ceil((cooldownUntil - now) / (60 * 60 * 1000)) : 0;
    const backHref = `${root}/assessment`;

    if (profileQuery.isLoading || attemptQuery.isLoading) {
        return <main className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5"><p className="text-sm text-slate-500">Preparing your assessment…</p></main>;
    }

    if (profileQuery.isError || attemptQuery.isError) {
        return <main className="mx-auto w-full max-w-3xl space-y-3 px-3 py-4 sm:px-5"><Link href={backHref} className="text-xs font-semibold text-blue-700">← Back to assessment</Link><div role="alert" className="bg-rose-50 p-3 text-sm text-rose-800">Your assessment status could not be verified. Try again before starting a retake.<button type="button" onClick={() => { void profileQuery.refetch(); void attemptQuery.refetch(); }} className="ml-2 font-semibold underline">Retry</button></div></main>;
    }

    if (passed || locked) {
        return <main className="mx-auto w-full max-w-3xl space-y-3 px-3 py-4 sm:px-5"><Link href={backHref} className="text-xs font-semibold text-blue-700">← Back to assessment</Link><section className="border border-slate-200 bg-white p-4"><h1 className="text-base font-semibold text-slate-950">{passed ? 'Assessment already passed' : 'Retake unavailable yet'}</h1><p className="mt-1 text-sm text-slate-600">{passed ? 'Your assessment is recorded as passed, so a retake is not available.' : `You can retake the quiz in about ${remainingHours} hour${remainingHours === 1 ? '' : 's'}.`}</p></section></main>;
    }

    return (
        <main className="mx-auto w-full max-w-4xl space-y-2 px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-3">
                <div><Link href={backHref} className="text-xs font-semibold text-blue-700 hover:underline">← Back to assessment</Link><p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-blue-700">{role} assessment</p><h1 className="mt-0.5 text-lg font-bold text-slate-950">Retake the quiz</h1><p className="mt-0.5 text-xs text-slate-600">Use the existing timed quiz. Your answers are scored and saved through the current assessment workflow.</p></div>
            </div>
            <QuizStep isRetake returnPath={backHref} />
        </main>
    );
}
