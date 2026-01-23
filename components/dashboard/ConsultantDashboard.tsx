'use client';

import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export const ConsultantDashboard: React.FC = () => {
    return (
        <DashboardLayout roleTitle="Consultant">
            <div className="space-y-8">
                <div className="bg-amber-50 border border-amber-100 py-4 px-8 rounded-4xl flex items-center gap-4">
                    <span className="material-symbols-outlined text-amber-600 text-2xl">verified_user</span>
                    <p className="text-sm font-medium text-amber-800">
                        Your Consultant credentials are being verified by our compliance team. Some features may be currently limited.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                        <div className="size-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-primary/5">
                            <span className="material-symbols-outlined text-3xl">attach_money</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">Hourly Rate</p>
                            <p className="text-3xl font-bold text-text-main font-display">$185.00</p>
                            <p className="text-[10px] text-green-500 font-bold mt-1 uppercase tracking-widest font-display">+5% Trend</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                        <div className="size-16 rounded-[1.5rem] bg-text-main/5 flex items-center justify-center text-text-main transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-text-main/5">
                            <span className="material-symbols-outlined text-3xl">bolt</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">Impact Score</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-bold text-text-main font-display">94</p>
                                <span className="text-[10px] text-slate-400 font-bold font-display">/ 100</span>
                            </div>
                            <div className="w-full h-2 bg-slate-50 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '94%' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                        <div className="size-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-primary/5">
                            <span className="material-symbols-outlined text-3xl">event_available</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">Active Sessions</p>
                            <p className="text-3xl font-bold text-text-main font-display">12</p>
                            <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-widest font-display">Next: 2:00 PM</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="font-bold text-text-main flex items-center gap-3 font-display text-lg">
                                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                                    Session Calendar
                                </h3>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                                    <button className="p-1 hover:text-primary transition-colors hover:bg-white rounded-lg"><span className="material-symbols-outlined">chevron_left</span></button>
                                    <span className="text-sm font-bold text-text-main font-display">October 2026</span>
                                    <button className="p-1 hover:text-primary transition-colors hover:bg-white rounded-lg"><span className="material-symbols-outlined">chevron_right</span></button>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-3xl overflow-hidden">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <div key={day} className="p-3 border-r border-b border-slate-50 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center font-display">{day}</div>
                                    ))}
                                    {Array.from({ length: 14 }).map((_, i) => (
                                        <div key={i} className={`h-28 p-4 border-r border-b border-slate-50 text-sm font-bold font-display ${i === 8 ? 'bg-primary/5 ring-2 ring-inset ring-primary/20' : 'text-text-main'}`}>
                                            {i + 1}
                                            {i === 8 && <div className="mt-2 px-2.5 py-1.5 bg-primary text-[9px] text-white rounded-lg font-bold truncate shadow-lg shadow-primary/20">Strategy Call: Nike</div>}
                                            {i === 10 && <div className="mt-2 px-2.5 py-1.5 bg-text-main text-[9px] text-white rounded-lg font-bold truncate shadow-lg">Audit: Tesla</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                            <h3 className="font-bold text-text-main mb-8 flex items-center justify-between font-display text-lg">
                                <span>Upcoming Calls</span>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">View All</span>
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { name: "Marcus Aurelius", role: "Chief Strategy", time: "Today, 2:00 PM", btn: "Join Call", primary: true },
                                    { name: "Elena Rodriguez", role: "Founder", time: "Tomorrow, 10:00 AM", btn: "Details", primary: false }
                                ].map((call, i) => (
                                    <div key={i} className="group p-5 bg-slate-50/50 rounded-4xl border border-transparent hover:border-primary/20 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="size-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {call.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">{call.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{call.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-text-main font-bold text-[10px] uppercase tracking-widest font-display">
                                                <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                                                {call.time}
                                            </div>
                                            <button className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${call.primary ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105' : 'bg-white text-text-main border border-slate-100 hover:bg-slate-50'}`}>
                                                {call.btn}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-text-main rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="font-bold text-sm mb-6 flex items-center gap-2 font-display uppercase tracking-widest text-primary">
                                    <span className="material-symbols-outlined text-xl">bolt</span>
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex flex-col items-center gap-3 p-5 bg-white/5 rounded-2xl hover:bg-primary transition-all duration-500 group-hover:bg-white/10 ring-1 ring-white/10">
                                        <span className="material-symbols-outlined text-white text-3xl">add_box</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest font-display">New Session</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-3 p-5 bg-white/5 rounded-2xl hover:bg-primary transition-all duration-500 group-hover:bg-white/10 ring-1 ring-white/10">
                                        <span className="material-symbols-outlined text-white text-3xl">description</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest font-display">Reports</span>
                                    </button>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
