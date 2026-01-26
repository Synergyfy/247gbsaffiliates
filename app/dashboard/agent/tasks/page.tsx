"use client";

import React from 'react';

export default function AgentTasksPage() {
    return (
        <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-text-main">Available Tasks</h1>
                    <p className="text-text-secondary text-sm font-medium">Browse and accept new opportunities.</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">filter_list</span>
                    Filter
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'Write 5 Product Descriptions', category: 'E-commerce', reward: '£25.00', icon: 'description' },
                    { title: 'Translate Support Email Template', category: 'Localization', reward: '£12.00', icon: 'translate' },
                    { title: 'Audit 10 User Comments', category: 'Moderation', reward: '£35.00', icon: 'rate_review' },
                    { title: 'Data Entry - Q4 Sales', category: 'Data Entry', reward: '£18.50', icon: 'table_view' },
                    { title: 'Logo Design Feedback', category: 'Design', reward: '£15.00', icon: 'palette' },
                    { title: 'Social Media Post Plan', category: 'Marketing', reward: '£40.00', icon: 'share' },
                ].map((task, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 transition-all cursor-pointer flex flex-col justify-between group hover:shadow-lg hover:-translate-y-0.5 min-h-[180px]">
                        <div className="flex items-start justify-between">
                            <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">{task.icon}</span>
                            </div>
                            <span className="text-lg font-black text-text-main">{task.reward}</span>
                        </div>

                        <div>
                            <h3 className="font-bold text-text-main text-lg mb-1">{task.title}</h3>
                            <p className="text-xs text-text-secondary font-medium">{task.category} • Estimated: 45m</p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                            <button className="px-4 py-2 bg-slate-100 text-text-main hover:bg-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest rounded-lg">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
