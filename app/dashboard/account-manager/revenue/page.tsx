"use client";

import React from 'react';
import { useAccountManagerRevenue } from '@/hooks/useAccountManagerRevenue';

export default function RevenuePage() {
    const { data: revenue, isLoading } = useAccountManagerRevenue();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

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
                        <h2 className="text-5xl font-black mb-4">
                            £{(revenue?.totalGeneratedRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h2>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                            {revenue?.lastMonthRevenueTrend} vs last month
                        </span>
                    </div>
                    <div className="absolute -right-10 -bottom-10 size-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="bg-white text-text-main p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-2">Pending Payouts</p>
                    <h2 className="text-4xl font-black mb-4">
                        £{(revenue?.pendingPayouts || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-xs text-text-secondary tracking-tighter uppercase font-bold">Managed Asset Liquidity</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-text-main mb-6">Recent Transactions</h3>
                <div className="space-y-4">
                    {revenue?.recentTransactions && revenue.recentTransactions.length > 0 ? (
                        revenue.recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined">
                                            {tx.type === 'deposit' ? 'arrow_downward' : 'payments'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-main">{tx.title}</p>
                                        <p className="text-xs text-text-secondary">
                                            {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-black text-text-main">
                                    +£{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                            No recent transactions recorded.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
