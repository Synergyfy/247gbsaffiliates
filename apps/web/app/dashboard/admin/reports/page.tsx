'use client';

import React from 'react';
import { useAdminStats } from '@/hooks/useAdminStats';

export default function AdminReportsPage() {
    const { stats, isLoading } = useAdminStats();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-10 font-display">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-main uppercase tracking-tighter italic">Platform Intelligence</h1>
                    <p className="text-text-secondary text-sm font-medium italic">Deep-dive analytics and real-time operational logs.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-primary/10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">analytics</span>
                        Generate Intelligence Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-surface-light p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="size-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110 shadow-inner">
                        <span className="material-symbols-outlined text-3xl">query_stats</span>
                    </div>
                    <h3 className="text-4xl font-black text-text-main mb-2 italic">+{stats?.activeTasks || 0}%</h3>
                    <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] italic">Deployment Velocity</p>
                </div>
                <div className="bg-surface-light p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="size-16 rounded-3xl bg-green-50 flex items-center justify-center text-green-600 mb-6 transition-transform group-hover:scale-110 shadow-inner">
                        <span className="material-symbols-outlined text-3xl">verified_user</span>
                    </div>
                    <h3 className="text-4xl font-black text-text-main mb-2 italic">99.2%</h3>
                    <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] italic">Security Integrity</p>
                </div>
                <div className="bg-surface-light p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="size-16 rounded-3xl bg-slate-800 flex items-center justify-center text-white mb-6 transition-transform group-hover:scale-110 shadow-inner">
                        <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                    </div>
                    <h3 className="text-4xl font-black text-text-main mb-2 italic">£{(stats?.totalRevenue || 0).toLocaleString()}</h3>
                    <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] italic">Total Fiscal Yield</p>
                </div>
            </div>

            <div className="bg-surface-light rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-10">
                <h3 className="text-sm font-black text-text-main mb-10 uppercase tracking-widest italic border-b border-slate-100 pb-4">Operational Activity Log</h3>
                <div className="space-y-4">
                    {(stats?.recentUsers || []).map((reg: any, i: number) => (
                        <div key={i} className="flex gap-6 p-6 hover:bg-slate-50/50 rounded-3xl transition-all border border-transparent hover:border-slate-100 items-center group">
                            <div className="size-12 rounded-2xl bg-slate-100 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-lg">history</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-black text-text-main text-sm uppercase tracking-tighter">Strategic Enrollment Complete</p>
                                    <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-widest">Just Now</span>
                                </div>
                                <p className="text-[11px] text-text-secondary font-medium italic">New identity confirmed: <span className="text-text-main font-bold">{reg.name}</span> has joined as <span className="text-primary font-black uppercase tracking-widest text-[9px] border-b border-primary/20">{reg.role}</span>.</p>
                            </div>
                        </div>
                    ))}
                    {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                        <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px] italic">No tactical movements recorded in the last 24h.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
