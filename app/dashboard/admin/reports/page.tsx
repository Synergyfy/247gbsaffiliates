"use client";

import React from 'react';

export default function AdminReportsPage() {
    return (
        <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-main mb-2">System Reports</h1>
                    <p className="text-slate-500 font-medium">View detailed analytics and system logs.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold font-display hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">calendar_today</span>
                        Last 30 Days
                    </button>
                    <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold font-display hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span className="material-symbols-outlined">download</span>
                        Export Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <span className="material-symbols-outlined text-3xl">trending_up</span>
                    </div>
                    <h3 className="text-2xl font-black text-text-main mb-1">24%</h3>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Growth Rate</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="size-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4">
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h3 className="text-2xl font-black text-text-main mb-1">98.5%</h3>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Verfication Success</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <div className="size-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                        <span className="material-symbols-outlined text-3xl">schedule</span>
                    </div>
                    <h3 className="text-2xl font-black text-text-main mb-1">45m</h3>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Avg. Session</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-bold text-text-main mb-6">Activity Log</h3>
                <div className="space-y-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0 items-start">
                            <div className="size-10 rounded-full bg-slate-100 shrink-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-500 text-sm">history</span>
                            </div>
                            <div>
                                <p className="font-bold text-text-main text-sm">System Backup Completed</p>
                                <p className="text-xs text-slate-500 mt-1">Automated backup ran successfully.</p>
                            </div>
                            <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">2h ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
