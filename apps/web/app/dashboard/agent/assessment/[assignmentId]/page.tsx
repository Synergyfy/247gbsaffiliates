'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { QuizStep } from '@/components/onboarding/QuizStep';

type AssignedAssessmentDetail = {
    id: string;
    title: string;
    instructions?: string | null;
    dueAt?: string | null;
    status: string;
    questions: Array<{ id: string; text: string; type: string; options: string[] }>;
    result?: { answers: Array<{ questionId: string; selectedOptionIndex: number }>; score: number; maxScore: number; percentage: number } | null;
};

export default function AssignedAssessmentPage() {
    const params = useParams<{ assignmentId: string }>();
    const pathname = usePathname();
    const dashboardRoot = pathname.split('/').slice(0, 2).join('/');
    const queryClient = useQueryClient();
    const assignmentQuery = useQuery({
        queryKey: ['assigned-assessment', params.assignmentId],
        queryFn: async () => (await apiClient.get<AssignedAssessmentDetail>(`/assessment/assignments/${params.assignmentId}`)).data,
        enabled: Boolean(params.assignmentId),
    });
    const submit = useMutation({
        mutationFn: async (answers: Array<{ questionId: string; selectedOptionIndex: number }>) => apiClient.post(`/assessment/assignments/${params.assignmentId}/submit`, { answers }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['assigned-assessment', params.assignmentId] });
            await queryClient.invalidateQueries({ queryKey: ['my-assessment-assignments'] });
        },
    });

    if (assignmentQuery.isLoading) return <div className="mx-auto max-w-3xl py-12 text-center text-sm text-slate-500">Loading assigned assessment…</div>;
    if (assignmentQuery.isError || !assignmentQuery.data) return <main className="mx-auto max-w-3xl py-8"><section className="rounded-xl border border-red-200 bg-white p-5"><h1 className="font-bold text-red-900">Assessment unavailable</h1><p className="mt-1 text-sm text-red-800">This assessment could not be loaded. It may have been removed or assigned to another account.</p><button onClick={() => assignmentQuery.refetch()} className="mt-3 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-800">Try again</button><Link href={`${dashboardRoot}/assessment`} className="ml-3 text-sm font-semibold text-blue-700">Back to assessments</Link></section></main>;

    const assessment = assignmentQuery.data;
    const submitted = ['pass', 'partial', 'fail'].includes(assessment.status);
    const bandColor = assessment.status === 'pass' ? 'text-emerald-700' : assessment.status === 'fail' ? 'text-red-700' : 'text-amber-700';

    return (
        <main className="mx-auto w-full max-w-4xl py-1 font-display sm:py-5 lg:py-8">
            <Link href={`${dashboardRoot}/assessment`} className="inline-flex min-h-7 items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline sm:min-h-9 sm:text-xs"><span className="material-symbols-outlined text-sm sm:text-base">arrow_back</span>Assessments</Link>
            <header className="mt-1 border-b border-slate-200 pb-2 sm:mt-3 sm:pb-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-700 sm:text-[10px]">Administrator-assigned assessment</p>
                <h1 className="mt-0.5 text-lg font-bold leading-tight text-slate-950 sm:mt-1 sm:text-xl lg:text-2xl">{assessment.title}</h1>
                {assessment.instructions && <p className="mt-1 whitespace-pre-wrap text-xs leading-4 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{assessment.instructions}</p>}
                {assessment.dueAt && <p className="mt-1 text-[10px] text-slate-500 sm:mt-2 sm:text-xs">Due {new Date(assessment.dueAt).toLocaleString()}</p>}
            </header>

            {submitted ? (
                <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5" aria-live="polite">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Result</p>
                    <h2 className={`mt-1 text-xl font-bold capitalize ${bandColor}`}>{assessment.status}</h2>
                    <p className="mt-2 text-sm text-slate-700">{assessment.result?.percentage}% · {assessment.result?.score}/{assessment.result?.maxScore} points</p>
                    <p className="mt-3 text-xs text-slate-600">Your result has been recorded for the administrator. This standalone assessment does not by itself alter your onboarding quiz or qualification status.</p>
                </section>
            ) : (
                <div className="mt-2 sm:mt-5">
                    <QuizStep
                        questionsOverride={assessment.questions}
                        onStandaloneSubmit={async (answers) => { await submit.mutateAsync(answers); }}
                    />
                </div>
            )}
        </main>
    );
}
