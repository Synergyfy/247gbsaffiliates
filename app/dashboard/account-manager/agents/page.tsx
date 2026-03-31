'use client';

import React from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { User } from '@/types/auth';

export default function AgentsPage() {
    const { users, isLoading } = useAdminUsers();
    
    // Filter for agents assigned to this manager or platform-wide (depending on backend implementation)
    // For now, filtering for 'agent' role platform-wide
    const agents = (users || []).filter(u => u.role.toLowerCase() === 'agent');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-10 font-display">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-text-main uppercase tracking-tighter italic">Strategic Assets</h1>
                    <p className="text-text-secondary text-sm font-medium italic">Command and oversee your deployed agent workforce.</p>
                </div>
            </header>

            <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Agent Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Operational Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Performance Index</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Yield Generated</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">Strategic Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {agents.length > 0 ? (
                                agents.map((agent: User) => (
                                    <tr key={agent.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-white italic shadow-inner">
                                                    {agent.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-main text-sm">{agent.name}</p>
                                                    <p className="text-[10px] text-text-secondary font-medium uppercase tracking-tighter italic">ID: #{agent.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1.5 w-fit ${
                                                agent.assessmentSkipped === false 
                                                ? 'bg-green-50 text-green-700 border-green-100' 
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                <span className={`size-1 rounded-full ${agent.assessmentSkipped === false ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                                {agent.assessmentSkipped === false ? 'Active' : 'Standby'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                                                <span className="text-sm font-black italic text-text-main">{agent.stats?.rating || '0.0'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black italic text-primary">£{agent.stats?.tasksCompleted ? agent.stats.tasksCompleted * 50 : 0}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-[9px] font-black uppercase tracking-[0.1em] text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all border border-primary/10">
                                                Strategic Reveal
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic opacity-50">
                                        No active strategic assets detected in this sector...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
