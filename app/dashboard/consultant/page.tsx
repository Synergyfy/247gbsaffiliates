'use client';

import React from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/store/useAuthStore';

export default function ConsultantDashboard() {
    const { user } = useAuthStore();
    const { tasks, isLoading: isLoadingTasks } = useTasks();
    const { wallet, isLoading: isLoadingWallet } = useWallet();

    if (isLoadingTasks || isLoadingWallet) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    // Filter tasks for 'audit' or 'review' types which are common for consultants
    const consultancySessions = tasks?.filter(t => t.type === 'audit' || t.type === 'review') || [];

    return (
        <div className="font-display">
            <div className="bg-amber-50 border-b border-amber-100 py-3 px-6 flex items-center justify-center gap-3">
                <span className="material-symbols-outlined text-amber-600 text-sm">
                    verified_user
                </span>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                    Your Consultant credentials are being verified by our compliance team.
                </p>
            </div>
            <header className="h-20 bg-surface-light border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
                <h1 className="text-xl font-black text-text-main italic uppercase tracking-tighter">
                    Consultant <span className="text-primary tracking-normal not-italic">Portal</span>
                </h1>
                <div className="flex items-center gap-6">
                    <button className="relative p-2 text-text-secondary hover:text-text-main transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-1.5 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                        <div className="text-right">
                            <p className="text-sm font-black text-text-main">{user?.name || 'Consultant'}</p>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                                Senior Strategic Consultant
                            </p>
                        </div>
                        <div className="size-10 rounded-full bg-slate-200 overflow-hidden border-2 border-primary/20 shadow-sm">
                            <img
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"}
                            />
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        <div className="bg-surface-light p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <span className="material-symbols-outlined text-3xl">
                                    payments
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">
                                    Account Balance
                                </p>
                                <p className="text-2xl font-black text-text-main italic">
                                    £{(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        <div className="bg-surface-light p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                            <div className="size-14 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-lg">
                                <span className="material-symbols-outlined text-3xl">bolt</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">
                                    Strategic Influence
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-2xl font-black text-text-main italic">94</p>
                                    <span className="text-[10px] text-text-secondary font-black italic">/ 100</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface-light p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md lg:col-span-1">
                            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <span className="material-symbols-outlined text-3xl">
                                    event_available
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">
                                    Upcoming Audits
                                </p>
                                <p className="text-2xl font-black text-text-main italic">
                                    {consultancySessions.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Session List */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                    <h3 className="font-black text-text-main uppercase tracking-widest flex items-center gap-2 text-sm">
                                        <span className="material-symbols-outlined text-primary">
                                            assignment_turned_in
                                        </span>
                                        Available Consultations
                                    </h3>
                                    <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full uppercase">
                                        Live Feed
                                    </span>
                                </div>
                                <div className="p-6 space-y-4">
                                    {consultancySessions.length > 0 ? (
                                        consultancySessions.map((session: Task) => (
                                            <div key={session.id} className="p-5 border border-slate-100 rounded-2xl hover:border-primary/20 transition-all flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                        <span className="material-symbols-outlined">analytics</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-text-main text-sm">{session.title}</h4>
                                                        <p className="text-[10px] text-text-secondary font-medium uppercase tracking-tighter mt-0.5">
                                                            {(typeof session.category === 'string' ? session.category : session.category?.name) || 'General Finance'} • {session.estimatedTime || '60m'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-text-main italic">£{Number(session.budget).toLocaleString()}</p>
                                                    <button className="text-[9px] font-black text-primary uppercase tracking-widest mt-1 hover:underline">
                                                        Accept Session
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No active consultancy sessions found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Performance Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-sm p-8">
                                <h3 className="font-black text-text-main uppercase tracking-widest text-sm mb-6">Expertise Level</h3>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <span className="text-5xl font-black italic text-primary">T-1</span>
                                        <p className="text-[10px] text-text-secondary font-black uppercase mt-1">Tier Ranking</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-text-secondary uppercase block">Experience</span>
                                        <span className="text-sm font-black text-text-main italic">4.9/5.0 Stars</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: '92%' }}></div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h3 className="font-black text-sm uppercase tracking-widest mb-6">Consultant Actions</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10">
                                            <span className="material-symbols-outlined text-primary text-2xl">add_box</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter">New Slot</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10">
                                            <span className="material-symbols-outlined text-primary text-2xl">description</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter">Reports</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 size-40 bg-primary/20 rounded-full blur-3xl group-hover:scale-125 transition-transform"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
