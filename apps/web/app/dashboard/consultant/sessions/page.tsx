'use client';

import Link from 'next/link';
import { useTasks } from '@/hooks/useTasks';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';

export default function SessionsPage() {
    const query = useTasks({ limit: 50 });
    const sessions = (query.tasks || []).filter((task) => task.type?.toLowerCase() === 'consultancy');
    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-4 px-3 py-4 sm:px-5 lg:px-7">
            <header>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">Consultant work</p>
                <h1 className="mt-0.5 text-xl font-semibold text-slate-950 sm:text-2xl">Sessions</h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">Scheduled consultancy work recorded in your assignments.</p>
            </header>
            {query.isLoading && !query.isError ? (
                <p role="status" className="py-3 text-xs text-slate-500">Loading sessions…</p>
            ) : query.isError ? (
                <RequestErrorState
                    area="Consultant sessions"
                    label="Consultancy sessions"
                    error={query.error}
                    onRetry={() => void query.refetch()}
                    supportHref="/dashboard/consultant/messages"
                />
            ) : sessions.length ? (
                <section className="divide-y divide-slate-100 border-y border-slate-200 bg-white">
                    {sessions.map((session) => (
                        <Link key={session.id} href={`/dashboard/consultant/tasks/${session.id}`} className="grid grid-cols-1 gap-1 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-4">
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-slate-900">{session.title}</span>
                                <span className="mt-0.5 block text-xs text-slate-500">{session.dueDate ? `Due ${new Date(session.dueDate).toLocaleString()}` : 'No date recorded'}</span>
                            </span>
                            <span className="text-xs capitalize text-slate-600">{session.status.replaceAll('_', ' ')}</span>
                            <span className="text-xs font-medium text-blue-700">Open assignment</span>
                        </Link>
                    ))}
                </section>
            ) : (
                <section className="rounded-xl border border-slate-200 bg-white p-10 text-center sm:p-12">
                    <span className="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">
                        calendar_today
                    </span>
                    <h2 className="mt-2 text-sm font-semibold text-slate-800">No consultancy sessions recorded yet</h2>
                    <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                        When a business books an appointment or session with you, your scheduled assignments will appear here.
                    </p>
                </section>
            )}
        </div>
    );
}
