"use client";

import React, { useState } from 'react';

const users = [
    { id: 1, name: "Sarah Johnson", role: "Agent", status: "Verified", email: "sarah@example.com", joined: "2 days ago" },
    { id: 2, name: "Michael Chen", role: "Landlord", status: "Pending", email: "michael@example.com", joined: "5 days ago" },
    { id: 3, name: "Emma Wilson", role: "Tenant", status: "Active", email: "emma@example.com", joined: "1 week ago" },
    { id: 4, name: "David Brown", role: "Agent", status: "Suspended", email: "david@example.com", joined: "2 weeks ago" },
    { id: 5, name: "Lisa Anderson", role: "Investor", status: "Verified", email: "lisa@example.com", joined: "3 weeks ago" },
];

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-main mb-2">User Management</h1>
                    <p className="text-slate-500 font-medium">Manage user accounts, roles, and verification status.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold font-display hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span className="material-symbols-outlined">add</span>
                        Add User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-main text-sm">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${user.status === 'Verified' ? 'bg-primary/10 text-primary border-primary/20' :
                                                user.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    user.status === 'Suspended' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            <span className={`size-1.5 rounded-full ${user.status === 'Verified' ? 'bg-primary' :
                                                    user.status === 'Active' ? 'bg-green-500' :
                                                        user.status === 'Suspended' ? 'bg-red-500' :
                                                            'bg-amber-500'
                                                }`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-500 font-medium">
                                        {user.joined}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                                            <span className="material-symbols-outlined text-xl">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
