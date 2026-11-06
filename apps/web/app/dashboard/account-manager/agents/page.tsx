'use client';

import { useMemo, useState } from 'react';
import { useManagedAgents } from '@/hooks/useAgents';

export default function AccountManagerAgentsPage() {
    const [search, setSearch] = useState('');
    const query = useManagedAgents();
    const agents = useMemo(
        () =>
            (query.data || []).filter((agent) =>
                `${agent.name} ${agent.skills?.join(' ') || ''} ${agent.email || ''}`
                    .toLowerCase()
                    .includes(search.trim().toLowerCase()),
            ),
        [query.data, search],
    );

    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-4 px-3 py-4 sm:px-5 lg:px-7">
            <header>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">Account Manager work</p>
                <h1 className="mt-0.5 text-xl font-semibold text-slate-950 sm:text-2xl">Agents</h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                    Agents assigned to the businesses and projects you coordinate.
                </p>
            </header>

            <label className="flex max-w-xl items-center gap-2 border border-slate-200 bg-white px-3">
                <span className="material-symbols-outlined text-base text-slate-400">search</span>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-10 min-w-0 flex-1 text-sm outline-none"
                    placeholder="Search names, emails or skills"
                    aria-label="Search agents"
                />
            </label>

            {query.isLoading ? (
                <p role="status" className="py-3 text-xs text-slate-500">Loading agents…</p>
            ) : query.isError ? (
                <div role="alert" className="bg-rose-50 px-3 py-2 text-xs text-rose-800">
                    The agent directory could not be loaded.{' '}
                    <button type="button" onClick={() => void query.refetch()} className="font-semibold underline">
                        Try again
                    </button>
                </div>
            ) : agents.length ? (
                <section className="grid gap-x-5 divide-y divide-slate-100 border-y border-slate-200 bg-white md:grid-cols-2 md:divide-y-0">
                    {agents.map((agent) => (
                        <article key={agent.id} className="min-w-0 border-b border-slate-100 px-3 py-3 md:px-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="truncate text-sm font-semibold text-slate-900">{agent.name}</h2>
                                    <p className="truncate text-[11px] text-slate-500">{agent.email}</p>
                                </div>
                                <div className="flex shrink-0 gap-2 text-center text-[10px]">
                                    <span className="rounded bg-blue-50 px-2 py-1 font-bold text-blue-800">
                                        {agent.activeTasksCount ?? 0} active
                                    </span>
                                    <span className="rounded bg-emerald-50 px-2 py-1 font-bold text-emerald-800">
                                        {agent.completedTasksCount ?? 0} done
                                    </span>
                                </div>
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                                {agent.skills?.length ? agent.skills.join(', ') : 'No skills listed'}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Verification: {agent.verificationStatus || 'not recorded'}
                                {' · '}Onboarding: {agent.isOnboarded === true ? 'Complete' : agent.isOnboarded === false ? 'Incomplete' : 'Not recorded'}
                                {' · '}Assessment: {agent.isQuizPassed === true ? 'Passed' : agent.isQuizPassed === false ? 'Not passed' : 'Not recorded'}
                                {agent.assessmentScore != null ? ` (${agent.assessmentScore}%)` : ''}
                            </p>
                        </article>
                    ))}
                </section>
            ) : (
                <p className="py-3 text-xs text-slate-500">
                    {search
                        ? 'No agents match that search.'
                        : 'No agents are assigned to your managed work yet. Use Find Affiliates to discover verified agents and assign them work.'}
                </p>
            )}
        </div>
    );
}
