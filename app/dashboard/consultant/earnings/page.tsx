"use client";

import React from 'react';

export default function ConsultantEarningsPage() {
    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-text-main">Earnings</h1>
                <p className="text-text-secondary text-sm font-medium">Track your consulting revenue.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Total Earnings</p>
                    <p className="text-3xl font-black text-text-main">£4,250.00</p>
                    <p className="text-xs text-green-600 font-bold mt-1">+12% this month</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Pending Payout</p>
                    <p className="text-3xl font-black text-text-main">£850.00</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Completed Sessions</p>
                    <p className="text-3xl font-black text-text-main">24</p>
                </div>
            </div>
        </div>
    );
}
