'use client';

import React from 'react';
import { DashboardLayout } from './DashboardLayout';

export const AccountManagerDashboard: React.FC = () => {
    const stats = [
        { label: "Retention Rate", value: "94.8%", trend: "+2.4%", icon: "trending_up" },
        { label: "Total Revenue", value: "$1.24M", trend: "+12%", icon: "monetization_on" },
        { label: "Active Projects", value: "24", trend: "0%", icon: "folder_open" },
        { label: "Response Time", value: "1.2h", trend: "-15m", icon: "speed" },
    ];

    const projects = [
        { name: "Fintech UI Redesign", id: "#1024", deadline: "Oct 24, 2024", agents: ["JD", "SK", "+2"], status: "On Track", color: "text-primary bg-primary/10" },
        { name: "Crypto Wallet App", id: "#1028", deadline: "Nov 02, 2024", agents: ["AM", "TH"], status: "Needs Review", color: "text-orange-500 bg-orange-50" },
        { name: "HealthTech Marketplace", id: "#1035", deadline: "Nov 15, 2024", agents: ["RB"], status: "On Track", color: "text-primary bg-primary/10" },
        { name: "SaaS Landing Page", id: "#1041", deadline: "Nov 28, 2024", agents: ["LC", "MK"], status: "Planning", color: "text-slate-500 bg-slate-100" },
    ];

    return (
        <DashboardLayout roleTitle="Account Manager">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">{stat.label}</span>
                                <div className="size-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                                </div>
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-text-main font-display leading-none">{stat.value}</span>
                                <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-slate-400'} mb-1`}>{stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-text-main font-display text-lg">Campaign Overview</h3>
                            <button className="text-xs font-bold text-primary hover:underline font-display tracking-widest uppercase">View All Projects</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-50">
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Project Name</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Deadline</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Agents</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {projects.map((proj, i) => (
                                        <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-text-main text-sm group-hover:text-primary transition-colors">{proj.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold font-display uppercase mt-1">{proj.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-text-main transition-colors">{proj.deadline}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex -space-x-2">
                                                    {proj.agents.map((ag, j) => (
                                                        <div key={j} className="size-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary shadow-sm">
                                                            {ag}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1.5 ${proj.color} text-[10px] font-bold uppercase tracking-widest rounded-full font-display`}>
                                                    {proj.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="xl:col-span-4 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">forum</span>
                                <h3 className="font-bold text-text-main font-display text-sm">Messaging Hub</h3>
                            </div>
                            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full font-display uppercase tracking-tighter">3 New</span>
                        </div>
                        <div className="flex-1 p-6 space-y-4">
                            {[
                                { name: "Alex Klein", role: "Agent", msg: "I've completed the initial wireframes.", time: "2m ago", initial: "AK" },
                                { name: "Modern Soft", role: "Client", msg: "Can we schedule a sync tomorrow?", time: "1h ago", initial: "MS" }
                            ].map((m, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                                    <div className="size-10 rounded-full bg-primary/10 shrink-0 flex items-center justify-center text-primary font-bold text-xs">
                                        {m.initial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-text-main truncate font-display">{m.name}</span>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{m.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium truncate">{m.msg}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 pt-0">
                            <div className="relative">
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-xs focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium" placeholder="Quick reply..." type="text" />
                                <button className="absolute right-3 top-1.5 text-primary hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
