"use client";

import React from 'react';

export default function AgentEarningsPage() {
    return (
        <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-text-main">Earnings Wallet</h1>
                <p className="text-text-secondary text-sm font-medium">Manage your balance and withdrawals.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-primary text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-2">Available Balance</p>
                        <h2 className="text-5xl font-black mb-6">£1,240.50</h2>
                        <div className="flex gap-4">
                            <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-50 transition-colors">
                                Withdraw Funds
                            </button>
                            <button className="bg-primary-dark/30 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark/50 transition-colors">
                                Transaction History
                            </button>
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 size-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-text-main mb-6">Monthly Overview</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-text-secondary">Tasks Completed</span>
                            <span className="text-sm font-bold text-text-main">42</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-medium text-text-secondary">Total Earned</span>
                            <span className="text-sm font-bold text-text-main">£850.00</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-bold text-text-main mb-4">Recent Transactions</h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="size-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined">arrow_downward</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-main">Task Payment</p>
                                    <p className="text-xs text-text-secondary">Ref: #TXN-8493{i}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm font-black text-text-main">+£{10 + i * 5}.00</span>
                                <span className="text-xs text-text-secondary">Oct {24 - i}, 2024</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
