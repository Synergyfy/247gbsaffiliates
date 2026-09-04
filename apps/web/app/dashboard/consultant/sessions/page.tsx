'use client';

import React from 'react';
import { useTasks } from '@/hooks/useTasks';

export default function SessionsPage() {
    const { tasks, isLoading } = useTasks();
    const sessions = (tasks || []).filter(t => t.type?.toLowerCase() === 'consultancy');

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
                    <h1 className="text-3xl font-black text-text-main uppercase tracking-tighter italic">Strategic Sessions</h1>
                    <p className="text-text-secondary text-sm font-medium italic">Manage and execute your elite consulting engagements.</p>
                </div>
                <button className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                    Set Tactical Availability
                </button>
            </header>

            <div className="bg-surface-light rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <h3 className="font-black text-xl text-text-main uppercase tracking-tighter italic">Upcoming Engagements</h3>
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
                            {sessions.length} Active Sessions
                        </span>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {sessions.length > 0 ? (
                        sessions.map((session, i) => (
                            <div key={session.id} className="p-8 flex items-center justify-between hover:bg-white transition-all group border-l-4 border-transparent hover:border-primary">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-3xl bg-slate-800 flex flex-col items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">OCT</span>
                                        <span className="text-2xl font-black italic mt-0.5">{20 + i}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg text-text-main uppercase tracking-tighter italic">{session.title}</h4>
                                        <p className="text-[11px] text-text-secondary font-medium italic mt-1">Strategic topic: <span className="text-text-main font-bold">{(typeof session.category === 'object' ? session.category?.name : session.category) || 'Expert Advisory'}</span> • <span className="text-primary font-black uppercase tracking-widest text-[9px]">{session.priority || 'Critical'}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="block text-[10px] font-black text-text-main uppercase tracking-widest mb-1 italic">Status Report</span>
                                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] italic border ${
                                            session.status === 'in-progress' 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {session.status}
                                        </span>
                                    </div>
                                    <button className="p-3 text-slate-300 hover:text-primary transition-all hover:bg-slate-50 rounded-2xl">
                                        <span className="material-symbols-outlined text-2xl">settings_intelligence</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center text-slate-300 font-bold uppercase tracking-[0.3em] text-[10px] italic opacity-50">
                            No upcoming strategic sessions detected.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
