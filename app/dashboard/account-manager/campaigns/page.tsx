'use client';

import React, { useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { CreateCampaignModal } from '@/components/dashboard/CreateCampaignModal';
import { toast } from 'react-toastify';

export default function CampaignsPage() {
    const { tasks, isLoading, createTask, isCreating } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const campaigns = (tasks || []).filter(t => {
        const catName = typeof t.category === 'string' ? t.category : t.category?.name;
        return t.type?.toLowerCase() === 'campaign' || catName?.toLowerCase() === 'campaign';
    });

    const handleCreateCampaign = async (values: any) => {
        try {
            await createTask(values);
            toast.success('Strategic campaign deployed to the grid.');
        } catch (error) {
            toast.error('Campaign deployment failed.');
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
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-text-main uppercase tracking-tighter italic">Tactical Campaigns</h1>
                    <p className="text-text-secondary text-sm font-medium italic">Command and track all active strategic marketing deployments.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    disabled={isCreating}
                    className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-lg">add_moderator</span>
                    {isCreating ? 'Deploying...' : 'New Strategic Campaign'}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-surface-light p-10 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-lg group">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 italic">Active Operations</p>
                    <p className="text-5xl font-black text-text-main italic tracking-tighter group-hover:text-primary transition-colors">{campaigns.length}</p>
                </div>
                <div className="bg-surface-light p-10 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-lg group">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 italic">Platform Reach</p>
                    <p className="text-5xl font-black text-text-main italic tracking-tighter group-hover:text-primary transition-colors">1.4M</p>
                </div>
                <div className="bg-surface-light p-10 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-lg group">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 italic">Conversion Index</p>
                    <div className="flex items-end gap-3">
                        <p className="text-5xl font-black text-text-main italic tracking-tighter group-hover:text-primary transition-colors">4.8</p>
                        <span className="text-xs font-black text-green-500 mb-2 uppercase tracking-widest italic">+0.2</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface-light rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Campaign Identity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Strategic Budget</th>
                                <th className="px-10 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Operational Yield</th>
                                <th className="px-10 py-6 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-right">Command</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic">
                            {campaigns.length > 0 ? (
                                campaigns.map((campaign: Task) => (
                                    <tr key={campaign.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-10 py-6">
                                            <p className="font-black text-text-main text-sm uppercase tracking-tighter">{campaign.title}</p>
                                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-0.5 opacity-60">ID: #CMP-{campaign.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="px-4 py-1.5 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-xl border border-green-100 flex items-center gap-2 w-fit">
                                                <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-sm font-black text-text-main">£{campaign.budget.toLocaleString()}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                                    <div className="h-full bg-primary shadow-sm" style={{ width: '75%' }}></div>
                                                </div>
                                                <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest italic opacity-60">75% Objective Completion</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-6 py-2.5 rounded-2xl transition-all border border-primary/10 hover:scale-105 active:scale-95">
                                                Analyze Data
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center text-slate-300 font-bold uppercase tracking-[0.3em] text-[10px] italic opacity-50">
                                        No active tactical campaigns in the sector.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateCampaignModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateCampaign}
                isSubmitting={isCreating}
            />
        </div>
    );
}
