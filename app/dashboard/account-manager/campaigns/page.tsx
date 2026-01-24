"use client";

import React from 'react';

export default function CampaignsPage() {
    return (
        <div className="p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-text-main">Campaigns</h1>
                    <p className="text-text-secondary text-sm font-medium">Manage and track all active marketing campaigns.</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">add</span>
                    New Campaign
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Stats */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Active Campaigns</p>
                    <p className="text-3xl font-black text-text-main">12</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Total Reach</p>
                    <p className="text-3xl font-black text-text-main">1.2M</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Avg. Conversion</p>
                    <p className="text-3xl font-black text-text-main">3.4%</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Budget</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Performance</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <tr key={item} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-text-main text-sm">Summer Sale Promo {item}</p>
                                    <p className="text-xs text-text-secondary">ID: #CMP-202{item}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">Active</span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-text-main">£{1000 * item}</td>
                                <td className="px-6 py-4">
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${60 + item * 5}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-text-secondary mt-1 font-bold">{60 + item * 5}% Goal Reached</p>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-primary font-bold text-xs hover:underline">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
