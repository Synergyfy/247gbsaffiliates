'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';
import { stabilizeErrorRetry } from '@/lib/requestErrors';

type Resource = { id: string; title: string; description: string; targetRoles: string[]; slug?: string | null; videoUrl?: string | null; articleUrl?: string | null; thumbnailUrl?: string | null; priority: number; isPublished: boolean; tags?: string[] | null; categoryId?: string | null; category?: { id: string; name: string } | null };
type Category = { id: string; name: string; children?: Category[] };
type ResourceForm = Omit<Resource, 'id' | 'category'> & { id?: string; tagsText: string };

const getSaveErrorMessage = (error: unknown) => {
    const responseData = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data;
    const message = responseData?.message;
    if (Array.isArray(message)) return message.join(' ');
    if (typeof message === 'string' && message.trim()) return message;
    return 'The resource could not be saved. Check the required fields and try again.';
};

const blankForm: ResourceForm = { title: '', description: '', targetRoles: ['agent'], slug: '', videoUrl: '', articleUrl: '', thumbnailUrl: '', priority: 0, isPublished: false, tags: [], tagsText: '', categoryId: '' };
const flattenCategories = (items: Category[] = []): Category[] => items.flatMap((item) => [item, ...flattenCategories(item.children || [])]);

export default function AdminLearningPage() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ResourceForm>(blankForm);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const resourcesQuery = stabilizeErrorRetry(useQuery({
        queryKey: ['admin-learning-resources'],
        queryFn: async () => {
            const response = await apiClient.get('/learning/admin/resources');
            return (response.data?.data ?? response.data) as Resource[];
        },
    }));
    const saveMutation = useMutation({
        mutationFn: async (payload: ResourceForm) => {
            const { id, tagsText, category, ...body } = payload as ResourceForm & { category?: unknown };
            const normalized = { ...body, priority: Number(body.priority) || 0, tags: tagsText.split(',').map((tag) => tag.trim()).filter(Boolean), categoryId: body.categoryId || null };
            return id ? apiClient.patch(`/learning/admin/resources/${id}`, normalized) : apiClient.post('/learning/admin/resources', normalized);
        },
        onSuccess: async () => {
            setErrorMessage('');
            setSuccessMessage('Learning resource saved.');
            setForm(blankForm);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['admin-learning-resources'] }),
                queryClient.invalidateQueries({ queryKey: ['learning-resources'] }),
            ]);
        },
        onError: (error) => { setSuccessMessage(''); setErrorMessage(getSaveErrorMessage(error)); },
    });
    const edit = (resource: Resource) => {
        setSuccessMessage('');
        setErrorMessage('');
        setForm({ ...blankForm, ...resource, tagsText: resource.tags?.join(', ') || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleRole = (role: string) => setForm((current) => ({ ...current, targetRoles: current.targetRoles.includes(role) ? current.targetRoles.filter((item) => item !== role) : [...current.targetRoles, role] }));

    return (
        <div className="mx-auto max-w-6xl font-display">
            <header className="mb-3 sm:mb-5">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary">Learning Hub</p>
                <h1 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-black text-text-main">Learning Materials</h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-text-secondary">Create and maintain resources that appear in the affiliate Learning Hub when published.</p>
            </header>
            <form onSubmit={(event) => { event.preventDefault(); setErrorMessage(''); setSuccessMessage(''); if (!form.targetRoles.length) { setErrorMessage('Choose at least one audience role.'); return; } saveMutation.mutate(form); }} className="mb-4 sm:mb-5 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-5">
                <div className="mb-3 sm:mb-4 flex items-center justify-between"><h2 className="text-sm sm:text-base font-bold text-slate-900">{form.id ? 'Edit learning resource' : 'Create learning resource'}</h2>{form.id && <button type="button" onClick={() => setForm(blankForm)} className="text-xs font-semibold text-slate-600 underline">Cancel edit</button>}</div>
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-700">Title <span className="text-red-600" aria-hidden="true">*</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Slug<input value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">Description <span className="text-red-600" aria-hidden="true">*</span><textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Article URL<input type="url" value={form.articleUrl || ''} onChange={(e) => setForm({ ...form, articleUrl: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Video URL<input type="url" value={form.videoUrl || ''} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Thumbnail URL<input type="url" value={form.thumbnailUrl || ''} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Tags (comma separated)<input value={form.tagsText} onChange={(e) => setForm({ ...form, tagsText: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <fieldset className="md:col-span-2" aria-required="true"><legend className="text-xs font-semibold text-slate-700">Audience roles <span className="text-red-600" aria-hidden="true">*</span></legend><p className="mt-1 text-xs font-normal text-slate-500">Choose at least one role.</p><div className="mt-2 flex flex-wrap gap-4">{[['agent', 'Agent'], ['account_manager', 'Account manager'], ['consultant', 'Consultant']].map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.targetRoles.includes(value)} onChange={() => toggleRole(value)} />{label}</label>)}</div></fieldset>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 md:col-span-2"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />Published and visible in the Learning Hub</label>
                </div>
                {errorMessage && <p className="mt-3 text-sm text-red-700" role="alert">{errorMessage}</p>}{successMessage && <p className="mt-3 text-sm text-emerald-700" role="status">{successMessage}</p>}
                <button disabled={saveMutation.isPending} className="mt-3 sm:mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs sm:text-sm font-bold text-white disabled:opacity-50">{saveMutation.isPending ? 'Saving…' : form.id ? 'Save changes' : 'Create resource'}</button>
            </form>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-3.5 py-3 sm:px-4"><h2 className="text-sm sm:text-base font-bold text-slate-900">All resources</h2></div>
                {resourcesQuery.isLoading && !resourcesQuery.isError ? <p className="p-6 text-sm text-slate-500">Loading resources…</p> : resourcesQuery.isError ? <div className="p-4"><RequestErrorState area="Admin learning resources" label="Learning resources" error={resourcesQuery.error} onRetry={() => void resourcesQuery.refetch()} supportHref="/dashboard/admin" /></div> : resourcesQuery.data?.length ? <div className="divide-y divide-slate-100">{resourcesQuery.data.map((resource) => <article key={resource.id} className="flex flex-wrap items-start justify-between gap-3 p-3.5 sm:p-4"><div className="min-w-0"><h3 className="font-semibold text-slate-900 text-sm sm:text-base">{resource.title}</h3><p className="mt-1 line-clamp-2 text-xs sm:text-sm text-slate-600">{resource.description}</p><p className="mt-1.5 sm:mt-2 text-xs text-slate-500">{resource.targetRoles.join(', ').replaceAll('_', ' ')}</p></div><div className="flex items-center gap-2 shrink-0"><span className={`rounded-full px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold ${resource.isPublished ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{resource.isPublished ? 'Published' : 'Draft'}</span><button onClick={() => edit(resource)} className="rounded-md border border-slate-200 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-8">Edit</button></div></article>)}</div> : <p className="p-8 text-center text-sm text-slate-500">No learning resources exist yet.</p>}
            </section>
        </div>
    );
}
