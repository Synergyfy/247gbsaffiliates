"use client";

import React from 'react';

export default function AgentsPage() {
    return (
        <div className="p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-text-main">Agents</h1>
                    <p className="text-text-secondary text-sm font-medium">Oversee your team of agents and their performance.</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Agent</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Revenue Generated</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[
                            { name: 'John Doe', role: 'Sales Specialist', status: 'Online', rating: 4.8, revenue: '£12,450' },
                            { name: 'Alice Smith', role: 'Support Agent', status: 'Offline', rating: 4.9, revenue: '£8,200' },
                            { name: 'Bob Johnson', role: 'Marketing Lead', status: 'Busy', rating: 4.7, revenue: '£15,100' },
                        ].map((agent, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                                            {agent.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-main text-sm">{agent.name}</p>
                                            <p className="text-xs text-text-secondary">ID: #AGT-{100 + index}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-text-main">{agent.role}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${agent.status === 'Online' ? 'bg-green-100 text-green-700' :
                                            agent.status === 'Busy' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-500'
                                        }`}>
                                        {agent.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-text-main flex items-center gap-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                    {agent.rating}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-text-main">{agent.revenue}</td>
                                <td className="px-6 py-4">
                                    <button className="text-primary font-bold text-xs hover:underline">View Profile</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
