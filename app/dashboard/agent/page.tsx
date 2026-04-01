'use client';

import React from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useWallet, Transaction } from '@/hooks/useWallet';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';

export default function AgentDashboard() {
    const { user } = useAuthStore();
    const { tasks, isLoading: isLoadingTasks, acceptTask, isAccepting } = useTasks({ status: 'open' });
    const { wallet, transactions, isLoading: isLoadingWallet } = useWallet();

    const availableTasks = (tasks || []).filter(t => t.status === 'open');
    
    const campaigns = availableTasks.filter(t => {
        const catName = typeof t.category === 'object' ? t.category?.name : t.category;
        return t.type?.toLowerCase() === 'campaign' || catName?.toLowerCase() === 'campaign';
    });

    const handleAcceptTask = async (taskId: string) => {
        try {
            await acceptTask(taskId);
            toast.success('Task accepted successfully!');
        } catch (error) {
            toast.error('Failed to accept task. It might have been taken.');
        }
    };

    if (isLoadingTasks || isLoadingWallet) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <header className="h-20 bg-surface-light border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 font-display">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-text-main">Agent Dashboard</h1>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-wider">
                        Online
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <button className="relative text-text-secondary hover:text-text-main transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="flex flex-col text-right">
                        <span className="text-xs text-text-secondary font-semibold uppercase tracking-tighter">
                            Current Balance
                        </span>
                        <span className="text-sm font-black text-text-main">
                            {wallet?.currency === 'GBP' ? '£' : wallet?.currency === 'USD' ? '$' : '€'}
                            {wallet?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full font-display">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-text-main flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    dynamic_feed
                                </span>
                                Task Feed
                            </h2>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-surface-light border border-slate-200 rounded-lg text-xs font-bold hover:border-primary transition-colors text-text-secondary hover:text-primary">
                                    Recent
                                </button>
                                <button className="px-3 py-1.5 bg-surface-light border border-slate-200 rounded-lg text-xs font-bold hover:border-primary transition-colors text-text-secondary hover:text-primary">
                                    High Value
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {availableTasks && availableTasks.length > 0 ? (
                                availableTasks.map((task: Task) => (
                                    <div key={task.id} className="bg-surface-light p-6 rounded-2xl border border-slate-200 transition-all cursor-pointer flex items-center justify-between group hover:shadow-lg hover:-translate-y-0.5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-xl bg-background-light flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <span className="material-symbols-outlined">
                                                    {task.type === 'writing' ? 'description' : 
                                                     task.type === 'translation' ? 'translate' : 
                                                     task.type === 'audit' ? 'rate_review' : 'work'}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-text-main">
                                                    {task.title}
                                                </h3>
                                                <p className="text-xs text-text-secondary font-medium mt-0.5">
                                                    {(typeof task.category === 'string' ? task.category : task.category?.name) || 'General Task'} • {task.estimatedTime || 'Flexible time'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <span className="text-lg font-black text-text-main">
                                                {task.currency === 'GBP' ? '£' : task.currency === 'USD' ? '$' : '€'}
                                                {Number(task.budget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptTask(task.id);
                                                }}
                                                disabled={isAccepting}
                                                className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-surface-light p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">work_off</span>
                                    <p className="text-slate-400 font-bold">No tasks available right now</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Check back later for new opportunities</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">
                                    Tasks Completed
                                </p>
                                <div className="flex items-end justify-between">
                                    <span className="text-3xl font-black text-text-main">
                                        {user?.stats?.tasksCompleted || 0}
                                    </span>
                                    <span className="text-[10px] font-bold text-primary mb-1">
                                        +0%
                                    </span>
                                </div>
                            </div>
                            <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">
                                    Rating
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-black text-text-main">
                                        {user?.stats?.rating || '0.0'}
                                    </span>
                                    <div className="flex flex-col">
                                        <div className="flex text-primary">
                                            <span className="material-symbols-outlined text-sm fill-1">
                                                star
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-text-secondary">
                                            / 5.0
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background-dark rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                                    Path to Account Manager
                                </h3>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <span className="text-4xl font-black italic">
                                            {user?.roles?.includes('account-manager') ? '100%' : '15%'}
                                        </span>
                                        <p className="text-xs text-gray-400 font-bold mt-1">
                                            Progress to Promotion
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                            Current Rank
                                        </span>
                                        <span className="text-sm font-black text-white">
                                            {user?.stats?.rank || 'New Agent'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                        style={{ width: user?.roles?.includes('account-manager') ? '100%' : '15%' }}
                                    ></div>
                                </div>
                                <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span className="size-1.5 bg-primary rounded-full"></span>
                                        Continue earning to level up
                                    </div>
                                    <a className="text-primary hover:underline" href="#">
                                        View Roadmap
                                    </a>
                                </div>
                            </div>
                            <div className="absolute -bottom-12 -right-12 size-48 bg-primary/10 rounded-full blur-3xl"></div>
                        </div>

                        <div className="bg-surface-light rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-xs font-black text-text-main uppercase tracking-widest mb-4">
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {transactions && transactions.length > 0 ? (
                                    transactions.slice(0, 5).map((tx: Transaction) => (
                                        <div key={tx.id} className="flex items-start gap-3">
                                            <div className={`size-2 mt-1.5 rounded-full ${tx.type === 'deposit' ? 'bg-primary' : 'bg-orange-400'}`}></div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-text-main capitalize">
                                                    {tx.type} {tx.status}
                                                </p>
                                                <p className="text-[10px] text-text-secondary font-medium">
                                                    {tx.description || 'System transaction'} • £{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
