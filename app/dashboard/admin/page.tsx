"use client";

import React from 'react';

export default function AdminDashboardPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 mb-2">System Overview</h1>
                <p className="text-slate-500 font-medium">Monitoring platform health and user activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="p-2 bg-primary/10 text-primary rounded-lg material-symbols-outlined text-xl">group</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Users</span>
                    </div>
                    <p className="text-3xl font-black text-text-main">24,593</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="p-2 bg-green-50 text-green-600 rounded-lg material-symbols-outlined text-xl">payments</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Revenue</span>
                    </div>
                    <p className="text-3xl font-black text-text-main">£1.2M</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="p-2 bg-purple-50 text-purple-600 rounded-lg material-symbols-outlined text-xl">campaign</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Campaigns</span>
                    </div>
                    <p className="text-3xl font-black text-text-main">842</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="p-2 bg-amber-50 text-amber-600 rounded-lg material-symbols-outlined text-xl">report</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reports</span>
                    </div>
                    <p className="text-3xl font-black text-text-main">15</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-text-main mb-6 border-b border-slate-100 pb-4">Recent Registrations</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-slate-100"></div>
                                    <div>
                                        <p className="text-sm font-bold text-text-main">New User {i}</p>
                                        <p className="text-xs text-slate-500">Agent • Just now</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Verified</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-text-main mb-6 border-b border-slate-100 pb-4">System Alerts</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                            <span className="material-symbols-outlined text-red-500">warning</span>
                            <div>
                                <p className="text-sm font-bold text-red-700">High Server Load</p>
                                <p className="text-xs text-red-600">US-East region is experiencing higher than normal traffic.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <span className="material-symbols-outlined text-orange-500">notifications</span>
                            <div>
                                <p className="text-sm font-bold text-orange-700">Payment Gateway Maintenance</p>
                                <p className="text-xs text-orange-600">Scheduled for tonight at 2:00 AM UTC.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
