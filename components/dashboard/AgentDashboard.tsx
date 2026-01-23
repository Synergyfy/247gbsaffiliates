'use client';

import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export const AgentDashboard: React.FC = () => {
    const tasks = [
        { title: "Write 5 Product Descriptions", category: "E-commerce", time: "45m", reward: "$25.00", icon: "description" },
        { title: "Translate Support Email Template", category: "Localization", time: "English to Spanish", reward: "$12.00", icon: "translate" },
        { title: "Audit 10 User Comments", category: "Moderation", time: "Policy Compliance", reward: "$35.00", icon: "rate_review" },
    ];

    return (
        <DashboardLayout roleTitle="Agent">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-text-main flex items-center gap-2 font-display">
                            <span className="material-symbols-outlined text-primary">dynamic_feed</span>
                            Available Task Feed
                        </h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:border-primary transition-colors font-display tracking-widest uppercase">Recent</button>
                            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:border-primary transition-colors font-display tracking-widest uppercase text-primary">High Value</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {tasks.map((task, i) => (
                            <div
                                key={i}
                                className="group bg-white p-6 rounded-4xl border border-slate-100 transition-all cursor-pointer flex items-center justify-between hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <span className="material-symbols-outlined text-2xl">{task.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main group-hover:text-primary transition-colors leading-tight">{task.title}</h3>
                                        <p className="text-xs text-slate-400 font-medium mt-1">{task.category} • {task.time}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-3">
                                    <span className="text-xl font-bold text-text-main font-display">{task.reward}</span>
                                    <button className="px-6 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">Accept</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display group-hover:text-primary transition-colors">Tasks Done</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-bold text-text-main font-display leading-none">142</span>
                                <span className="text-[10px] font-bold text-green-500 mb-1">+12%</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display group-hover:text-primary transition-colors">Rating</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold text-text-main font-display leading-none">4.8</span>
                                <div className="flex flex-col">
                                    <span className="material-symbols-outlined text-sm text-yellow-400 fill-1">star</span>
                                    <span className="text-[10px] font-bold text-slate-400 font-display">/ 5.0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-text-main rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6 font-display">Milestone Progress</h3>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <span className="text-5xl font-bold italic font-display leading-none">65%</span>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest font-display">To Elite Member</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Rank</span>
                                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">Master Agent</span>
                                </div>
                            </div>
                            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
                            </div>
                            <div className="mt-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 font-display">
                                <div className="flex items-center gap-2">
                                    <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                                    8 tasks to next level
                                </div>
                                <button className="text-primary hover:underline">Roadmap</button>
                            </div>
                        </div>
                        <div className="absolute -bottom-12 -right-12 size-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
                    </div>

                    <div className="bg-white rounded-4xl border border-slate-100 p-8 space-y-6">
                        <h3 className="text-[10px] font-bold text-text-main uppercase tracking-[0.2em] font-display border-b border-slate-50 pb-4">Recent Activity</h3>
                        <div className="space-y-6">
                            {[
                                { title: "Payment processed", desc: "Data Entry Project • $15.00", time: "2h ago", color: "bg-primary" },
                                { title: "Task submitted", desc: "Logo Design Feedback", time: "5h ago", color: "bg-slate-200" }
                            ].map((act, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className={`size-2.5 mt-1.5 ${act.color} rounded-full`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="text-sm font-bold text-text-main leading-tight">{act.title}</p>
                                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{act.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">{act.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
