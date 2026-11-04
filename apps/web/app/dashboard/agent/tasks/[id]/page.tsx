"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTask, useTasks } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/useAuthStore';

const formatDate = (value?: string | null) => {
    if (!value) return 'Not specified';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Not specified' : new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date);
};

const getErrorMessage = (error: unknown) => {
    if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) return response.data.message;
    }
    return error instanceof Error ? error.message : 'The task could not be updated. Please try again.';
};

export default function AgentTaskDetailsPage() {
    const params = useParams<{ id: string }>();
    const taskId = params.id;
    const { user } = useAuthStore();
    const { data: task, isLoading, isError, error, refetch } = useTask(taskId, Boolean(user?.id));
    const { acceptTask, declineTask, updateTaskStatus, isAccepting, isDeclining, isUpdatingStatus } = useTasks({ enabled: false });
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const isQualified = user?.verificationStatus === 'verified' && user?.isOnboarded === true;

    const performAction = async (action: 'accept' | 'decline' | 'submit') => {
        setActionMessage('');
        setActionError('');
        try {
            if (action === 'accept') {
                await acceptTask(taskId);
                setActionMessage('Task accepted. You can now work on it and submit it for review when ready.');
            } else if (action === 'decline') {
                await declineTask(taskId);
                setActionMessage('Task declined.');
            } else {
                await updateTaskStatus({ taskId, status: 'submitted' });
                setActionMessage('Task submitted for review.');
            }
        } catch (err) {
            setActionError(getErrorMessage(err));
        }
    };

    if (isLoading) {
        return <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500" role="status"><span className="size-5 animate-spin rounded-full border-2 border-blue-100 border-b-blue-700" />Loading task…</div>;
    }

    if (isError || !task) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-8">
                <Link href="/dashboard/agent/tasks" className="text-sm font-semibold text-blue-700 hover:underline">← Back to tasks</Link>
                <section className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
                    <h1 className="font-semibold text-red-900">Task details couldn’t be loaded</h1>
                    <p className="mt-1 text-sm text-red-800">{getErrorMessage(error)}</p>
                    <p className="mt-1 text-xs text-red-700">If this task isn’t assigned to your account, it won’t be available here.</p>
                    <button type="button" onClick={() => refetch()} className="mt-3 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white">Try again</button>
                </section>
            </div>
        );
    }

    const canRespond = task.status === 'assigned';
    const canSubmit = task.status === 'accepted';

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Link href="/dashboard/agent/tasks" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
                <span className="material-symbols-outlined text-base">arrow_back</span> Back to tasks
            </Link>

            <article className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Assigned task</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-950">{task.title}</h1>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{task.status.replaceAll('_', ' ')}</span>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
                    <div><dt className="text-xs text-slate-500">Task created</dt><dd className="mt-1 font-semibold text-slate-900">{formatDate(task.createdAt)}</dd></div>
                    <div><dt className="text-xs text-slate-500">Deadline</dt><dd className="mt-1 font-semibold text-slate-900">{formatDate(task.dueDate)}</dd></div>
                    <div><dt className="text-xs text-slate-500">Estimate</dt><dd className="mt-1 font-semibold text-slate-900">{task.estimatedTime || 'Not specified'}</dd></div>
                    {task.budget != null && <div><dt className="text-xs text-slate-500">Budget</dt><dd className="mt-1 font-semibold text-slate-900">{new Intl.NumberFormat(undefined, { style: 'currency', currency: task.currency || 'USD' }).format(Number(task.budget))}</dd></div>}
                    {task.taskType && <div><dt className="text-xs text-slate-500">Task type</dt><dd className="mt-1 font-semibold text-slate-900">{task.taskType.replaceAll('_', ' ')}</dd></div>}
                    {task.originSystem && <div><dt className="text-xs text-slate-500">Source</dt><dd className="mt-1 font-semibold text-slate-900">{task.originSystem.replaceAll('_', ' ')}</dd></div>}
                </dl>

                <section className="mt-6">
                    <h2 className="text-base font-semibold text-slate-950">Instructions</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{task.description || 'No additional instructions were provided.'}</p>
                    {task.executionUrl && <a href={task.executionUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">Open work link<span className="material-symbols-outlined text-base">open_in_new</span></a>}
                </section>

                <section className="mt-6 border-t border-slate-100 pt-5">
                    <h2 className="text-base font-semibold text-slate-950">Requirements</h2>
                    {task.requiredSkills?.length ? (
                        <ul className="mt-2 flex flex-wrap gap-2">
                            {task.requiredSkills.map((skill) => <li key={skill} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">{skill}</li>)}
                        </ul>
                    ) : <p className="mt-2 text-sm text-slate-600">No additional requirements were listed.</p>}
                </section>

                {!isQualified && (canRespond || canSubmit) && (
                    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        Your account needs verified status and completed onboarding before you can accept or submit work. <Link href="/dashboard/agent/assessment" className="font-semibold underline">Review qualification</Link>.
                    </div>
                )}
                {actionError && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{actionError}</p>}
                {actionMessage && <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{actionMessage}</p>}

                {(canRespond || canSubmit) && (
                    <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                        {canRespond && <>
                            <button type="button" onClick={() => performAction('accept')} disabled={!isQualified || isAccepting || isDeclining} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{isAccepting ? 'Accepting…' : 'Accept task'}</button>
                            <button type="button" onClick={() => performAction('decline')} disabled={isAccepting || isDeclining} className="min-h-11 rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{isDeclining ? 'Declining…' : 'Decline'}</button>
                        </>}
                        {canSubmit && <button type="button" onClick={() => performAction('submit')} disabled={!isQualified || isUpdatingStatus} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{isUpdatingStatus ? 'Submitting…' : 'Submit for review'}</button>}
                    </div>
                )}
            </article>
        </div>
    );
}
