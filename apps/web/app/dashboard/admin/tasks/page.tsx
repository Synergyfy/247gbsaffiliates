'use client';

import { FormEvent, useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useAdminUsers } from '@/hooks/useAdminUsers';

type TaskForm = { title: string; description: string; executionUrl: string; budget: string; type: 'one_time' | 'recurring'; dueDate: string; requiredSkills: string };
const blankForm: TaskForm = { title: '', description: '', executionUrl: '', budget: '5', type: 'one_time', dueDate: '', requiredSkills: '' };
const statusLabel = (status: string) => status.replaceAll('_', ' ');
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : 'Not set';

export default function AdminTasksPage() {
    const [form, setForm] = useState<TaskForm>(blankForm);
    const [agentSelection, setAgentSelection] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { tasks = [], isLoading, isError, error, refetch, createTask, isCreating, assignTask, isAssigning, updateTaskStatus, isUpdatingStatus } = useTasks({ limit: 100 });
    const { users: eligibleAffiliates = [], isLoading: isLoadingAffiliates } = useAdminUsers({ page: 1, limit: 100, qualification: 'qualified' });

    const saveTask = async (event: FormEvent) => {
        event.preventDefault(); setFeedback(''); setErrorMessage('');
        try {
            await createTask({ ...form, executionUrl: form.executionUrl.trim() || undefined, budget: Number(form.budget), dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined, requiredSkills: form.requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean) } as Partial<Task>);
            setForm(blankForm); setFeedback('Task created. Assign an eligible affiliate from the task list below.');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'The task could not be created.');
        }
    };

    const assign = async (taskId: string) => {
        const agentId = agentSelection[taskId];
        if (!agentId) return;
        setFeedback(''); setErrorMessage('');
        try { await assignTask({ taskId, agentId }); setFeedback('Task assigned.'); }
        catch (err) { setErrorMessage(err instanceof Error ? err.message : 'The task could not be assigned. Confirm the affiliate is still eligible.'); }
    };

    const updateStatus = async (task: Task, status: string) => {
        setFeedback(''); setErrorMessage('');
        try { await updateTaskStatus({ taskId: task.id, status }); setFeedback(`Task marked ${statusLabel(status)}.`); }
        catch (err) { setErrorMessage(err instanceof Error ? err.message : 'The task status could not be updated.'); }
    };

    return (
        <div className="mx-auto max-w-7xl font-display">
            <header className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-primary">Affiliate operations</p><h1 className="mt-1 text-2xl font-black text-text-main">Task Management</h1><p className="mt-1 text-sm text-text-secondary">Create tasks, assign qualified affiliates, and review their work status.</p></header>

            <form onSubmit={(event) => void saveTask(event)} className="mb-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                <h2 className="mb-4 font-bold text-slate-900">Create task</h2>
                <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-700">Title <span className="text-red-600" aria-hidden="true">*</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Budget ($) <span className="text-red-600" aria-hidden="true">*</span><span className="mt-1 flex w-full overflow-hidden rounded-md border border-slate-200 bg-white text-sm font-normal"><span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-slate-500">$</span><input required type="number" min="5" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="min-w-0 flex-1 px-3 py-2 outline-none" /></span></label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">Instructions / description <span className="text-red-600" aria-hidden="true">*</span><textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">Work link <span className="font-normal text-slate-500">(optional)</span><input type="url" value={form.executionUrl} onChange={(e) => setForm({ ...form, executionUrl: e.target.value })} placeholder="https://…" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /><span className="mt-1 block font-normal text-slate-500">Link directly to the account, page, or workspace where the affiliate should work.</span></label>
                    <label className="text-xs font-semibold text-slate-700">Task type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TaskForm['type'] })} className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal"><option value="one_time">One time</option><option value="recurring">Recurring</option></select></label>
                    <label className="text-xs font-semibold text-slate-700">Deadline<input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                    <label className="text-xs font-semibold text-slate-700">Required skills (comma separated)<input value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                </div>
                {feedback && <p className="mt-3 text-sm text-emerald-700" role="status">{feedback}</p>}{errorMessage && <p className="mt-3 text-sm text-red-700" role="alert">{errorMessage}</p>}
                <button disabled={isCreating} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{isCreating ? 'Creating…' : 'Create task'}</button>
            </form>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="font-bold text-slate-900">Tasks and assignments</h2><button onClick={() => void refetch()} className="text-xs font-semibold text-primary hover:underline">Refresh</button></div>
                {isLoading ? <p className="p-6 text-sm text-slate-500">Loading tasks…</p> : isError ? <p className="p-6 text-sm text-red-700">Tasks could not be loaded: {error instanceof Error ? error.message : 'Unknown error'}</p> : tasks.length ? <div className="divide-y divide-slate-100">{tasks.map((task) => {
                    const assignedAgent = task.assignedAgent;
                    const agentLabel = assignedAgent ? `${assignedAgent.firstName || ''} ${assignedAgent.lastName || ''}`.trim() || assignedAgent.email : '';
                    return <article key={task.id} className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold text-slate-900">{task.title}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{task.description}</p>{task.executionUrl && <a href={task.executionUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">Open work link<span className="material-symbols-outlined text-sm">open_in_new</span></a>}<p className="mt-2 text-xs text-slate-500">Created {formatDate(task.createdAt)} · Deadline {formatDate(task.dueDate)} · {task.currency} {Number(task.budget || 0).toFixed(2)}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{statusLabel(task.status)}</span></div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                            {assignedAgent ? <span className="text-xs text-slate-700">Assigned to <strong>{agentLabel}</strong></span> : <>
                                <select aria-label={`Choose affiliate for ${task.title}`} value={agentSelection[task.id] || ''} onChange={(e) => setAgentSelection((current) => ({ ...current, [task.id]: e.target.value }))} className="min-w-56 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs"><option value="">{isLoadingAffiliates ? 'Loading qualified affiliates…' : eligibleAffiliates.length ? 'Select qualified affiliate' : 'No qualified affiliates'}</option>{eligibleAffiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.name} · {affiliate.email}</option>)}</select>
                                <button disabled={!agentSelection[task.id] || isAssigning} onClick={() => void assign(task.id)} className="rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{isAssigning ? 'Assigning…' : 'Assign task'}</button>
                            </>}
                            {task.status === 'submitted' && <button disabled={isUpdatingStatus} onClick={() => void updateStatus(task, 'approved')} className="rounded-md border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800 disabled:opacity-50">Approve submission</button>}
                            {task.status === 'approved' && <button disabled={isUpdatingStatus} onClick={() => void updateStatus(task, 'completed')} className="rounded-md border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-800 disabled:opacity-50">Mark completed</button>}
                        </div>
                    </article>;
                })}</div> : <p className="p-8 text-center text-sm text-slate-500">No tasks exist yet. Create one above.</p>}
            </section>
        </div>
    );
}
