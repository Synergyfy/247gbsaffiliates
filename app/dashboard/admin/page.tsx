'use client';

import React from 'react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const { stats, isLoading } = useAdminStats();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full font-display">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-text-main">System Overview</h1>
                <p className="text-text-secondary font-medium mt-1">
                    Platform-wide metrics and user activity monitoring.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {/* Stat 1 */}
                <div className="bg-surface-light p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-text-secondary uppercase tracking-widest">
                            Total Registered Users
                        </span>
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-text-main">
                            {stats?.totalUsers || 0}
                        </span>
                        <span className="text-[10px] font-bold text-primary mb-1.5">+0%</span>
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-surface-light p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-text-secondary uppercase tracking-widest">
                            Active Tasks
                        </span>
                        <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <span className="material-symbols-outlined">assignment</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-text-main">
                            {stats?.activeTasks || 0}
                        </span>
                        <span className="text-[10px] font-bold text-orange-600 mb-1.5">+0%</span>
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-surface-light p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-text-secondary uppercase tracking-widest">
                            Platform Revenue (USD)
                        </span>
                        <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                            <span className="material-symbols-outlined">monetization_on</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-text-main">
                            ${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] font-bold text-green-600 mb-1.5">+0%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-200">
                        <h3 className="font-bold text-text-main">Recent Registrations</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">User</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats?.recentUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-text-main">{u.name}</span>
                                                <span className="text-[10px] text-text-secondary">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-slate-100 rounded">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`size-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                                <span className="text-[10px] font-bold capitalize">{u.status}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Alerts */}
                <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-sm p-8">
                    <h3 className="font-bold text-text-main mb-6">System Health</h3>
                    <div className="space-y-4">
                        {stats?.systemAlerts.map((alert, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl flex items-start gap-4 ${
                                alert.severity === 'error' ? 'bg-red-50 border border-red-100' : 
                                alert.severity === 'warning' ? 'bg-amber-50 border border-amber-100' : 
                                'bg-blue-50 border border-blue-100'
                            }`}>
                                <span className={`material-symbols-outlined ${
                                    alert.severity === 'error' ? 'text-red-500' : 
                                    alert.severity === 'warning' ? 'text-amber-500' : 
                                    'text-blue-500'
                                }`}>
                                    {alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
                                </span>
                                <div>
                                    <p className={`text-xs font-bold ${
                                        alert.severity === 'error' ? 'text-red-900' : 
                                        alert.severity === 'warning' ? 'text-amber-900' : 
                                        'text-blue-900'
                                    }`}>
                                        System Notification
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                                        {alert.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
