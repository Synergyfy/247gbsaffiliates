"use client";

import React from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { FaUsers, FaHammer, FaTasks, FaDollarSign, FaChartLine, FaShieldAlt, FaCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const stats = [
        {
            icon: <FaUsers size={24} />,
            label: 'Total Users',
            value: '1,234',
            trend: { value: '+12%', isPositive: true },
            color: 'blue' as const,
            description: 'New registrations this month'
        },
        {
            icon: <FaHammer size={24} />,
            label: 'Verified Artisans',
            value: '456',
            trend: { value: '+8%', isPositive: true },
            color: 'green' as const,
            description: 'Professionals ready for jobs'
        },
        {
            icon: <FaTasks size={24} />,
            label: 'Active Tasks',
            value: '89',
            trend: { value: '-3%', isPositive: false },
            color: 'purple' as const,
            description: 'Jobs currently in progress'
        },
        {
            icon: <FaDollarSign size={24} />,
            label: 'Revenue (MTD)',
            value: '₦2.4M',
            trend: { value: '+15%', isPositive: true },
            color: 'orange' as const,
            description: 'Platform transaction volume'
        },
    ];

    const recentActivity = [
        { id: 1, action: 'New artisan application', user: 'Chidi Okonkwo', time: '5 minutes ago', status: 'pending', type: 'Artisan' },
        { id: 2, action: 'Verification approved', user: 'Amina Bello', time: '15 minutes ago', status: 'success', type: 'Artisan' },
        { id: 3, action: 'Large project completed', user: 'Tunde Adeyemi', time: '1 hour ago', status: 'info', type: 'Task' },
        { id: 4, action: 'Payment dispute resolved', user: 'Sarah Williams', time: '2 hours ago', status: 'warning', type: 'Payment' },
    ];

    const systemHealth = [
        { label: 'API Gateway', status: 'Operational', color: 'bg-green-500' },
        { label: 'Database Service', status: 'Operational', color: 'bg-green-500' },
        { label: 'Verification Engine', status: 'Under Maintenance', color: 'bg-amber-500' },
    ];

    return (
        <div className="w-full min-h-full bg-white animate-fade-in-up p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                            Admin Interface
                        </h1>
                        <p className="text-gray-500 font-medium">Monitoring Artisans platform metrics and ecosystem health.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm shadow-lg shadow-gray-200 hover:bg-black transition-all">
                            Generate Report
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="group bg-white p-6 rounded-3xl border border-gray-100 hover:border-brand-green/30 shadow-sm hover:shadow-xl hover:shadow-brand-green/5 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                        {stat.icon}
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${stat.trend.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {stat.trend.value}
                                    </div>
                                </div>
                                <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                                <div className="text-3xl font-black text-gray-900 mb-2">{stat.value}</div>
                                <p className="text-xs text-gray-400 font-medium">{stat.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Analytics Center */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8 pb-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">User Growth Analytics</h3>
                                <div className="flex gap-2">
                                    {['7D', '30D', '1Y'].map(t => (
                                        <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${t === '30D' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400 hover:text-gray-900 border border-gray-100'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-72 flex flex-col items-center justify-center bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-linear-to-b from-transparent to-white/20 pointer-events-none"></div>
                                <FaChartLine size={64} className="text-gray-100 group-hover:text-brand-green/10 transition-colors" />
                                <p className="text-gray-400 mt-4 font-black text-[10px] uppercase tracking-widest">Dynamic Engine Initializing...</p>

                                {/* Fake Chart Line purely with CSS */}
                                <div className="absolute bottom-20 left-10 right-10 h-32 flex items-end gap-2 px-10">
                                    {[40, 70, 45, 90, 65, 80, 55, 100].map((h, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 bg-brand-green/10 rounded-t-xl transition-all duration-1000"
                                            style={{ height: `${h}%`, transitionDelay: `${i * 100}ms` }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity List */}
                        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Real-time Activity</h3>
                                <button className="text-brand-green text-[10px] font-black hover:underline uppercase tracking-widest">View Stream &rarr;</button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="p-6 hover:bg-gray-50/50 transition-all flex items-center gap-6 group">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all shadow-sm">
                                            {activity.user[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm text-gray-900 font-black">{activity.action}</p>
                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-black uppercase text-gray-400 border border-gray-200">{activity.type}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">{activity.user} • {activity.time}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${activity.status === 'success' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' :
                                                activity.status === 'warning' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' :
                                                    activity.status === 'info' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-gray-300'
                                                }`}></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panels */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* System Health */}
                        <div className="bg-white rounded-4xl border border-gray-100 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 rounded-2xl bg-gray-900 text-brand-green shadow-xl shadow-gray-200">
                                    <FaShieldAlt />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">System Health</h3>
                            </div>

                            <div className="space-y-6">
                                {systemHealth.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-gray-900 transition-colors">{item.label}</p>
                                            <p className="text-sm font-black text-gray-900">{item.status}</p>
                                        </div>
                                        <div className={`${item.color} w-2.5 h-2.5 rounded-full shadow-lg`}></div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-8 py-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 transition-all">
                                View Full Diagnostics
                            </button>
                        </div>

                        {/* Quick Settings/Actions */}
                        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8">
                            <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tight">Master Controls</h3>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-gray-50/50 hover:bg-brand-green/5 border border-gray-50 hover:border-brand-green/20 group transition-all">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-900">Verify Pending Experts</span>
                                    <span className="px-3 py-1.5 rounded-xl bg-white border border-gray-100 text-[10px] font-black text-brand-green shadow-sm">12</span>
                                </button>
                                <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-gray-50/50 hover:bg-brand-green/5 border border-gray-50 hover:border-brand-green/20 group transition-all">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-900">Task Audit Trail</span>
                                    <FaCircle className="text-[10px] text-gray-200" />
                                </button>
                                <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-red-50/30 hover:bg-red-50 border border-red-50 group transition-all">
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Maintenance Mode</span>
                                    <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all"></div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
