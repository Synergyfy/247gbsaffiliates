"use client";

import React, { useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { toast } from 'react-toastify';

export default function AgentTasksPage() {
    const { tasks, isLoading, acceptTask } = useTasks();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAcceptTask = async (taskId: string) => {
        setProcessingId(taskId);
        try {
            await acceptTask(taskId);
            toast.success('Task accepted successfully!');
        } catch (error) {
            toast.error('Failed to accept task. It might have been taken.');
        } finally {
            setProcessingId(null);
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
        <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full font-display">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-text-main">Available Tasks</h1>
                    <p className="text-text-secondary text-sm font-medium">Browse and accept new opportunities across the platform.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-surface-light border border-slate-200 text-text-secondary px-4 py-2 rounded-xl font-bold text-xs hover:border-primary hover:text-primary transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">filter_list</span>
                        Sort by Reward
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks && tasks.length > 0 ? (
                    tasks.map((task: Task) => (
                        <div key={task.id} className="bg-white p-6 rounded-2xl border border-slate-200 transition-all cursor-pointer flex flex-col justify-between group hover:shadow-lg hover:-translate-y-0.5 min-h-[200px]">
                            <div className="flex items-start justify-between">
                                <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">
                                        {task.type === 'writing' ? 'description' : 
                                         task.type === 'campaign' ? 'campaign' : 
                                         task.type === 'audit' ? 'rate_review' : 'work'}
                                    </span>
                                </div>
                                <span className="text-lg font-black text-text-main">
                                    {task.currency === 'GBP' ? '£' : '$'}{Number(task.budget).toLocaleString()}
                                </span>
                            </div>

                            <div className="mt-4">
                                <h3 className="font-bold text-text-main text-lg mb-1 group-hover:text-primary transition-colors leading-tight">{task.title}</h3>
                                <p className="text-xs text-text-secondary font-medium italic">
                                    {(typeof task.category === 'string' ? task.category : task.category?.name) || 'General Category'} • {task.estimatedTime || 'Flexible'}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Status: {task.status}
                                </span>
                                <button 
                                    onClick={() => handleAcceptTask(task.id)}
                                    disabled={processingId !== null}
                                    className="px-4 py-2 bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all text-[10px] font-black uppercase tracking-widest rounded-lg disabled:opacity-50"
                                >
                                    {processingId === task.id ? 'Processing...' : 'Accept Task'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">work_off</span>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No active tasks available in the sector.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
