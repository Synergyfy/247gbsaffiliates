"use client";

import React from 'react';

export default function RevenuePage() {
    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-text-main">Revenue Overview</h1>
                <p className="text-text-secondary text-sm font-medium">Financial performance and analysis.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-primary text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-2">Total Generated Revenue</p>
                        <h2 className="text-5xl font-black mb-4">£124,500.00</h2>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">+18% vs last month</span>
                    </div>
                    <div className="absolute -right-10 -bottom-10 size-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="bg-white text-text-main p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-2">Pending Payouts</p>
                    <h2 className="text-4xl font-black mb-4">£12,340.00</h2>
                    <p className="text-xs text-text-secondary">Next payout scheduled for Oct 31, 2024</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-text-main mb-6">Recent Transactions</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="size-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined">arrow_downward</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-main">Campaign Payment - Nike Q4</p>
                                    <p className="text-xs text-text-secondary">Oct {24 - i}, 2024</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-text-main">+£2,500.00</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
