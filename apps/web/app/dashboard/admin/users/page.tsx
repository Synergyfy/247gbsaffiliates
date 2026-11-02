'use client';

import React, { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { User } from '@/types/auth';
import { toast } from 'react-toastify';

export default function UserManagementPage() {
    const { users, isLoading, updateStatus, isUpdating } = useAdminUsers();
    const [searchTerm, setSearchTerm] = useState("");

    const getUserDisplayName = (user: User) => {
        const combined = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        return combined || user.name || user.email || 'Affiliate User';
    };

    const getUserInitials = (user: User) => {
        const name = getUserDisplayName(user);
        return name.slice(0, 2).toUpperCase();
    };

    const filteredUsers = (users || []).filter(user => {
        const name = getUserDisplayName(user).toLowerCase();
        const email = (user.email || '').toLowerCase();
        const role = (user.role || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term) || role.includes(term);
    });

    const handleStatusUpdate = async (userId: string, newStatus: string) => {
        try {
            await updateStatus({ userId, status: newStatus });
            toast.success(`User status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update user status:', error);
            toast.error('Failed to update user status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-10 font-display">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-text-main mb-2">User Management</h1>
                    <p className="text-text-secondary font-medium italic">Manage user accounts, roles, and verification status across the platform.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-surface-light focus:outline-none focus:ring-2 focus:ring-primary/10 w-full md:w-64 text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="py-5 px-8 text-[10px] font-black text-text-secondary uppercase tracking-widest">User Details</th>
                                <th className="py-5 px-8 text-[10px] font-black text-text-secondary uppercase tracking-widest">Role</th>
                                <th className="py-5 px-8 text-[10px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                                <th className="py-5 px-8 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user: User) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs italic shadow-inner">
                                                    {getUserInitials(user)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-main text-sm">{getUserDisplayName(user)}</p>
                                                    <p className="text-[10px] text-text-secondary font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-2">
                                                <span className={`size-2 rounded-full ${
                                                    user.status === 'active' ? 'bg-emerald-500' :
                                                    user.status === 'suspended' ? 'bg-red-500' : 'bg-amber-400'
                                                }`}></span>
                                                <span className="text-[10px] font-black uppercase tracking-wider">
                                                    {user.status || (user.assessmentSkipped === false ? 'active' : 'pending')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleStatusUpdate(user.id, 'suspended')}
                                                        disabled={isUpdating}
                                                        className="px-3 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-[11px] font-bold"
                                                        title="Suspend User"
                                                    >
                                                        <span className="material-symbols-outlined text-base">block</span>
                                                        <span>Suspend</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusUpdate(user.id, 'active')}
                                                        disabled={isUpdating}
                                                        className="px-3 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-[11px] font-bold shadow-sm"
                                                        title="Approve User"
                                                    >
                                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                                        <span>Approve</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400 font-bold italic uppercase tracking-widest text-[10px]">
                                        No platform users found...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
