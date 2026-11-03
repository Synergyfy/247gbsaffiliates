'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

type Question = { id: string; text: string; type: string; options: string[]; correctOptionIndex: number; weight: number; targetingLevel: string; targetingType: string; categories?: { id: string; name: string }[]; sectors?: { id: string; name: string }[] };
type Attempt = { id: string; userId: string; user?: { email: string; firstName?: string; lastName?: string } | null; score: number; maxScore: number; percentage: number; band: string; createdAt: string };
type TargetItem = { id: string; name: string; children?: TargetItem[] };
type QuestionForm = Omit<Question, 'id' | 'categories' | 'sectors'> & { id?: string; optionsText: string; categoryIds: string[]; sectorIds: string[] };
const emptyForm: QuestionForm = { text: '', type: 'multiple_choice', options: [], optionsText: '', correctOptionIndex: 0, weight: 1, targetingLevel: 'global', targetingType: 'all', categoryIds: [], sectorIds: [] };
const flatten = (items: TargetItem[] = []): TargetItem[] => items.flatMap((item) => [item, ...flatten(item.children || [])]);

export default function AdminAssessmentsPage() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<QuestionForm>(emptyForm);
    const [feedback, setFeedback] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const questionsQuery = useQuery({ queryKey: ['admin-assessment-questions'], queryFn: async () => (await apiClient.get('/assessment/admin/questions')).data as Question[] });
    const attemptsQuery = useQuery({ queryKey: ['admin-assessment-attempts'], queryFn: async () => (await apiClient.get('/assessment/admin/attempts')).data as Attempt[] });
    const categoriesQuery = useQuery({ queryKey: ['assessment-categories'], queryFn: async () => { const r = await apiClient.get('/categories'); return flatten(r.data?.data ?? r.data); } });
    const sectorsQuery = useQuery({ queryKey: ['assessment-sectors'], queryFn: async () => { const r = await apiClient.get('/sectors'); return (r.data?.data ?? r.data) as TargetItem[]; } });
    const saveQuestion = useMutation({
        mutationFn: async (payload: QuestionForm) => {
            const { id, categories, sectors, optionsText, ...data } = payload as QuestionForm & { categories?: unknown; sectors?: unknown };
            const body = { ...data, options: optionsText.split('\n').map((option) => option.trim()).filter(Boolean), correctOptionIndex: Number(data.correctOptionIndex), weight: Number(data.weight) };
            return id ? apiClient.patch(`/assessment/questions/${id}`, body) : apiClient.post('/assessment/questions', body);
        },
        onSuccess: async () => { setForm(emptyForm); setFeedback('Question saved.'); setErrorMessage(''); await queryClient.invalidateQueries({ queryKey: ['admin-assessment-questions'] }); },
        onError: () => { setFeedback(''); setErrorMessage('The question could not be saved. Check that the correct answer index is valid.'); },
    });
    const deleteQuestion = useMutation({ mutationFn: async (id: string) => apiClient.delete(`/assessment/questions/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-assessment-questions'] }) });

    const editQuestion = (question: Question) => {
        setForm({ ...question, optionsText: question.options.join('\n'), categoryIds: question.categories?.map((item) => item.id) || [], sectorIds: question.sectors?.map((item) => item.id) || [] });
        setFeedback(''); setErrorMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const toggleTarget = (key: 'categoryIds' | 'sectorIds', id: string) => setForm((current) => ({ ...current, [key]: current[key].includes(id) ? current[key].filter((item) => item !== id) : [...current[key], id] }));

    return (
        <div className="mx-auto max-w-7xl font-display">
            <header className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-primary">Assessment</p><h1 className="mt-1 text-2xl font-black text-text-main">Questions and Results</h1><p className="mt-1 text-sm text-text-secondary">Manage the existing affiliate quiz bank and review persisted attempts.</p></header>
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">Current scoring uses the existing 85% Pass and 50% Partial bands. Pass thresholds and retake rules are not configurable in the current system. Qualification still requires verification and completed onboarding.</div>

            <form onSubmit={(event) => { event.preventDefault(); setFeedback(''); setErrorMessage(''); const options = form.optionsText.split('\n').map((item) => item.trim()).filter(Boolean); if (options.length < 2) { setErrorMessage('Add at least two answer options.'); return; } if (form.correctOptionIndex < 0 || form.correctOptionIndex >= options.length) { setErrorMessage(`Correct answer index must be between 0 and ${options.length - 1}.`); return; } if (form.targetingLevel === 'category' && !form.categoryIds.length) { setErrorMessage('Choose at least one category for category targeting.'); return; } if (form.targetingLevel === 'sector' && !form.sectorIds.length) { setErrorMessage('Choose at least one sector for sector targeting.'); return; } saveQuestion.mutate(form); }} className="mb-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-900">{form.id ? 'Edit question' : 'Add question'}</h2>{form.id && <button type="button" onClick={() => setForm(emptyForm)} className="text-xs font-semibold underline">Cancel</button>}</div>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">Question<textarea required rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Question type<input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Weight<input type="number" min="1" value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">Answer options (one per line)<textarea required rows={4} value={form.optionsText} onChange={(e) => setForm({ ...form, optionsText: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Correct option index (zero-based)<input type="number" min="0" value={form.correctOptionIndex} onChange={(e) => setForm({ ...form, correctOptionIndex: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Target level<select value={form.targetingLevel} onChange={(e) => setForm({ ...form, targetingLevel: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-sm font-normal"><option value="global">Global</option><option value="sector">Sector</option><option value="category">Category</option><option value="sub_category">Sub-category</option></select></label>
                    <label className="text-xs font-semibold text-slate-700">Target type<select value={form.targetingType} onChange={(e) => setForm({ ...form, targetingType: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-sm font-normal"><option value="all">All</option><option value="include">Include selected</option><option value="exclude">Exclude selected</option></select></label>
                    {(form.targetingLevel === 'sector' || form.targetingLevel === 'sub_category') && <fieldset className="rounded-md border border-slate-200 p-3"><legend className="px-1 text-xs font-semibold text-slate-700">Sectors</legend><div className="max-h-32 space-y-1 overflow-auto">{(sectorsQuery.data || []).map((sector) => <label key={sector.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.sectorIds.includes(sector.id)} onChange={() => toggleTarget('sectorIds', sector.id)} />{sector.name}</label>)}</div></fieldset>}
                    {(form.targetingLevel === 'category' || form.targetingLevel === 'sub_category') && <fieldset className="rounded-md border border-slate-200 p-3"><legend className="px-1 text-xs font-semibold text-slate-700">Categories</legend><div className="max-h-32 space-y-1 overflow-auto">{(categoriesQuery.data || []).map((category: TargetItem) => <label key={category.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.categoryIds.includes(category.id)} onChange={() => toggleTarget('categoryIds', category.id)} />{category.name}</label>)}</div></fieldset>}
                </div>
                {errorMessage && <p className="mt-3 text-sm text-red-700" role="alert">{errorMessage}</p>}{feedback && <p className="mt-3 text-sm text-emerald-700" role="status">{feedback}</p>}
                <button disabled={saveQuestion.isPending} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saveQuestion.isPending ? 'Saving…' : form.id ? 'Save question' : 'Create question'}</button>
            </form>

            <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-4 py-3"><h2 className="font-bold text-slate-900">Question bank</h2></div>{questionsQuery.isLoading ? <p className="p-5 text-sm text-slate-500">Loading questions…</p> : questionsQuery.isError ? <p className="p-5 text-sm text-red-700">Question bank could not be loaded.</p> : questionsQuery.data?.length ? <div className="divide-y divide-slate-100">{questionsQuery.data.map((question) => <article key={question.id} className="flex flex-wrap items-start justify-between gap-3 p-4"><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{question.text}</p><p className="mt-1 text-xs text-slate-600">{question.options.map((option, index) => `${index === question.correctOptionIndex ? '✓ ' : ''}${index}: ${option}`).join(' · ')}</p><p className="mt-1 text-[11px] text-slate-500">Weight {question.weight} · {question.targetingLevel} / {question.targetingType} · {(question.sectors || []).map((item) => item.name).join(', ')} {(question.categories || []).map((item) => item.name).join(', ')}</p></div><div className="flex gap-2"><button onClick={() => editQuestion(question)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold">Edit</button><button disabled={deleteQuestion.isPending} onClick={() => { if (window.confirm('Remove this question from future quizzes? Existing results will remain.')) deleteQuestion.mutate(question.id); }} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50">Remove</button></div></article>)}</div> : <p className="p-8 text-center text-sm text-slate-500">No assessment questions found.</p>}</section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-4 py-3"><h2 className="font-bold text-slate-900">Affiliate assessment results</h2></div>{attemptsQuery.isLoading ? <p className="p-5 text-sm text-slate-500">Loading results…</p> : attemptsQuery.isError ? <p className="p-5 text-sm text-red-700">Assessment results could not be loaded.</p> : attemptsQuery.data?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-4 py-2">Affiliate</th><th className="px-4 py-2">Result</th><th className="px-4 py-2">Score</th><th className="px-4 py-2">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{attemptsQuery.data.map((attempt) => <tr key={attempt.id}><td className="px-4 py-3 text-sm">{attempt.user?.email || attempt.userId}</td><td className="px-4 py-3 text-sm capitalize">{attempt.band}</td><td className="px-4 py-3 text-sm">{attempt.percentage}% · {attempt.score}/{attempt.maxScore}</td><td className="px-4 py-3 text-xs text-slate-500">{new Date(attempt.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div> : <p className="p-8 text-center text-sm text-slate-500">No assessment attempts recorded.</p>}</section>
        </div>
    );
}
