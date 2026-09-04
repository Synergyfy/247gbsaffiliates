"use client";

import React, { useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';

export default function MyMissionsPage() {
    const { user } = useAuthStore();
    // Fetch tasks specifically assigned to the current user
    const { tasks, isLoading } = useTasks({ 
        assignedAgentId: user?.id 
    });

    // Filter for accepted/active tasks that aren't completed yet
    const activeMissions = (tasks || []).filter(t => 
        ['accepted', 'in_progress', 'submitted'].includes(t.status)
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full font-display">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-text-main">My Active Missions</h1>
                    <p className="text-text-secondary text-sm font-medium">Manage and track your claimed tactical operations.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1">
                        <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
                        {activeMissions.length} Active
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeMissions.length > 0 ? (
                    activeMissions.map((task: Task) => (
                        <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-2xl">
                                            {task.type === 'writing' ? 'description' : 
                                             task.type === 'campaign' ? 'campaign' : 
                                             task.type === 'audit' ? 'rate_review' : 'rocket_launch'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-text-main text-lg tracking-tight leading-none group-hover:text-primary transition-colors">
                                            {task.title}
                                        </h3>
                                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mt-2 italic opacity-60">
                                            Mission ID: #OP-{task.id.slice(0, 8)}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xl font-black text-primary italic">
                                    {task.currency === 'GBP' ? '£' : '$'}{Number(task.budget).toLocaleString()}
                                </span>
                            </div>

                            <p className="text-sm text-text-secondary font-medium leading-relaxed mb-6 line-clamp-2">
                                {task.description}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</span>
                                        <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 flex items-center gap-2">
                                            <span className="size-1 bg-slate-400 rounded-full"></span>
                                            {task.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Estimated</span>
                                        <span className="text-xs font-bold text-text-main">{task.estimatedTime || 'Flexible'}</span>
                                    </div>
                                </div>
                                <button className="px-6 py-3 bg-text-main text-white hover:bg-primary transition-all text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg">
                                    Start Mission
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="size-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-slate-200">rocket</span>
                        </div>
                        <h3 className="text-xl font-black text-text-main italic mb-2">No Active Missions</h3>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">
                            Your operational queue is empty. Visit the Available Tasks pool to claim new tactical missions.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
