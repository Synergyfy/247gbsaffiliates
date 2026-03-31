'use client';

import React from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useWallet } from '@/hooks/useWallet';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuthStore } from '@/store/useAuthStore';

export default function AccountManagerDashboard() {
    const { user } = useAuthStore();
    const { tasks, isLoading: isLoadingTasks } = useTasks();
    const { wallet, isLoading: isLoadingWallet } = useWallet();
    const { conversations, messages, sendMessage, isSending } = useMessaging();
    const [selectedConvId, setSelectedConvId] = React.useState<string | null>(null);
    const [replyText, setReplyText] = React.useState('');

    const activeConversation = conversations?.find(c => c.id === selectedConvId);

    const handleSendReply = async () => {
        if (!selectedConvId || !replyText.trim()) return;
        try {
            await sendMessage({ id: selectedConvId, content: replyText });
            setReplyText('');
        } catch (error) {
            console.error('Failed to send message:', error);
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
        <div className="font-display">
            <header className="bg-surface-light border-b border-slate-200 px-8 py-6 sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-text-main">
                            Account Manager Dashboard
                        </h1>
                        <p className="text-text-secondary text-sm font-medium italic">
                            Welcome back, {user?.name || 'Manager'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-text-secondary hover:text-text-main transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">
                            New Campaign
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {/* Stat 1 */}
                    <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                Global Retention
                            </span>
                            <span className="material-symbols-outlined text-primary text-sm">
                                trending_up
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-text-main italic">
                                94.8%
                            </span>
                            <span className="text-[10px] font-bold text-primary mb-1">
                                +2.4%
                            </span>
                        </div>
                    </div>
                    {/* Stat 2 */}
                    <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                Total Managed Capital
                            </span>
                            <span className="material-symbols-outlined text-primary text-sm">
                                monetization_on
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-text-main italic">
                                £{(wallet?.balance || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-primary mb-1">
                                +12%
                            </span>
                        </div>
                    </div>
                    {/* Stat 3 */}
                    <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                Active Projects
                            </span>
                            <span className="material-symbols-outlined text-primary text-sm">
                                folder_open
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-text-main italic">
                                {tasks?.length || 0}
                            </span>
                        </div>
                    </div>
                    {/* Stat 4 */}
                    <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                User Service Level
                            </span>
                            <span className="material-symbols-outlined text-primary text-sm">
                                speed
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-text-main italic">
                                4.9/5
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 flex flex-col lg:flex-row gap-8">
                {/* Campaign Overview Table */}
                <div className="flex-2 bg-surface-light rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-bold text-text-main">Campaign Overview</h3>
                        <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
                            View All Projects
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                        Project Name
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                        Budget
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                        Assigned
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tasks && tasks.length > 0 ? (
                                    tasks.slice(0, 5).map((task: Task) => (
                                        <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-text-main text-sm">
                                                        {task.title}
                                                    </span>
                                                    <span className="text-[10px] text-text-secondary uppercase tracking-tighter">
                                                        ID: #{task.id.slice(0, 8)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-text-main italic">
                                                    £{Number(task.budget).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400 italic">
                                                {task.status === 'open' ? 'Awaiting Pickup' : 'Assigned'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                                                    task.status === 'open' ? 'bg-primary/10 text-primary' : 
                                                    task.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                                            No active projects found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Messaging Hub */}
                <div className="flex-1 bg-surface-light rounded-2xl shadow-sm border border-slate-200 flex flex-col min-w-[340px]">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-xl">
                                forum
                            </span>
                            <h3 className="font-black text-text-main text-sm uppercase tracking-widest">
                                Messaging Hub
                            </h3>
                        </div>
                        <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black rounded-full uppercase">
                            Live
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px]">
                        <div className="p-4 flex flex-col gap-3">
                            {conversations && conversations.length > 0 ? (
                                conversations.map((conv) => (
                                    <div 
                                        key={conv.id} 
                                        onClick={() => setSelectedConvId(conv.id)}
                                        className={`flex gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                            selectedConvId === conv.id ? 'bg-primary/5 border-primary/20 shadow-md ring-1 ring-primary/10' : 'bg-white border-transparent hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="size-10 rounded-full bg-slate-800 shrink-0 flex items-center justify-center text-white text-xs font-bold italic shadow-inner">
                                            {conv.participant?.name.slice(0, 2).toUpperCase() || '??'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-xs font-black text-text-main truncate">
                                                    {conv.participant?.name}
                                                </span>
                                                <span className="text-[10px] font-bold text-text-secondary italic">
                                                    {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-medium text-text-secondary truncate leading-relaxed">
                                                {conv.lastMessageContent || 'Start a conversation...'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center py-10 opacity-50">No active conversations</p>
                            )}
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                        <div className="relative">
                            <input
                                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-4 pr-10 text-[11px] font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                placeholder="Write a quick response..."
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                disabled={!selectedConvId || isSending}
                            />
                            <button 
                                onClick={handleSendReply}
                                disabled={!selectedConvId || isSending || !replyText.trim()}
                                className="absolute right-2.5 top-2 text-primary hover:scale-110 disabled:opacity-30 transition-transform"
                            >
                                <span className="material-symbols-outlined text-xl">send</span>
                            </button>
                        </div>
                        {!selectedConvId && (
                            <p className="text-[9px] text-center text-slate-400 font-bold uppercase mt-2 tracking-tighter">Select a conversation to reply</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
