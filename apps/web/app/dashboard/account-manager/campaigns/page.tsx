'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Task, useManagedProjects, useTasks } from '@/hooks/useTasks';
import { CreateCampaignModal } from '@/components/dashboard/CreateCampaignModal';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';
import { toast } from 'react-toastify';

const terminalStatuses = ['completed', 'approved', 'cancelled', 'declined'];
const campaignCurrency = (task: Task) => (task.currency || 'GBP').toUpperCase();
const formatBudget = (amount: number, currency: string) => {
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString()}`;
    }
};

export default function CampaignsPage() {
    const { tasks, isLoading, isError, error, refetch, createTask, isCreating } = useTasks({ limit: 100 });
    const {
        data: managedProjects = [],
        isLoading: isLoadingProjects,
    } = useManagedProjects({ status: 'ACTIVE', limit: 100 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const campaigns = useMemo(() => (tasks || []).filter((task) => {
        const category = typeof task.category === 'string' ? task.category : '';
        return task.type?.toLowerCase() === 'campaign' || category.toLowerCase() === 'campaign';
    }), [tasks]);
    const activeCampaigns = campaigns.filter((campaign) => !terminalStatuses.includes(campaign.status));
    const completedCampaigns = campaigns.filter((campaign) => ['completed', 'approved'].includes(campaign.status));
    const budgetTotals = campaigns.reduce<Record<string, number>>((totals, campaign) => {
        const currency = campaignCurrency(campaign);
        totals[currency] = (totals[currency] || 0) + Number(campaign.budget || 0);
        return totals;
    }, {});

    const handleCreateCampaign = async (values: Partial<Task> & { centralProjectId?: string }) => {
        try {
            await createTask(values);
            toast.success(values.centralProjectId ? 'Client task created in Central Hub and linked to the affiliate board.' : 'Campaign created.');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Campaign could not be created. Check the details and try again.',
            );
        }
    };

    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-4 px-3 py-4 sm:px-5 sm:py-5 lg:px-7">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Account Manager workspace</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Campaigns</h1>
                    <p className="mt-1 max-w-2xl text-sm text-slate-600">Create campaigns and track their actual task status, budget and assignments.</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(true)} disabled={isCreating} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                    <span className="material-symbols-outlined text-lg">add</span>{isCreating ? 'Creating…' : 'Create campaign'}
                </button>
            </header>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Campaign summary">
                <article className="border border-slate-200 bg-white p-3"><p className="text-xs font-medium text-slate-500">Active campaigns</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">{isLoading ? '…' : isError ? '—' : activeCampaigns.length}</p><p className="mt-1 text-[11px] text-slate-500">Campaign tasks not yet completed or closed</p></article>
                <article className="border border-slate-200 bg-white p-3"><p className="text-xs font-medium text-slate-500">Completed campaigns</p><p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">{isLoading ? '…' : isError ? '—' : completedCampaigns.length}</p><p className="mt-1 text-[11px] text-slate-500">Campaign tasks marked completed or approved</p></article>
                <article className="border border-slate-200 bg-white p-3"><p className="text-xs font-medium text-slate-500">Campaign budget total</p>{isLoading ? <p className="mt-1.5 text-base font-bold text-slate-950">Loading…</p> : isError ? <p className="mt-1.5 text-base font-bold text-slate-950">Unavailable</p> : Object.keys(budgetTotals).length ? <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">{Object.entries(budgetTotals).map(([currency, total]) => <span key={currency} className="text-base font-bold text-slate-950">{formatBudget(total, currency)}</span>)}</div> : <p className="mt-1.5 text-base font-bold text-slate-950">—</p>}<p className="mt-1 text-[11px] text-slate-500">Totals kept separate by currency</p></article>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
                    <div><h2 className="text-sm font-semibold text-slate-950">Campaign work</h2><p className="mt-0.5 text-xs text-slate-500">Status and assignment from each campaign task record</p></div>
                    {!isLoading && !isError && <span className="text-xs text-slate-500">{campaigns.length} record{campaigns.length === 1 ? '' : 's'}</span>}
                </div>
                {isLoading && !isError ? (
                    <div className="space-y-3 p-4 sm:p-5" aria-label="Loading campaigns"><div className="h-16 animate-pulse rounded-lg bg-slate-100" /><div className="h-16 animate-pulse rounded-lg bg-slate-100" /><div className="h-16 animate-pulse rounded-lg bg-slate-100" /></div>
                ) : isError ? (
                    <div className="p-4 sm:p-5">
                        <RequestErrorState
                            area="Campaigns"
                            label="Campaigns"
                            error={error}
                            onRetry={() => void refetch()}
                            supportHref="/dashboard/account-manager/messages"
                        />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="px-4 py-5"><h3 className="text-sm font-semibold text-slate-800">No campaigns yet</h3><p className="mt-1 text-xs text-slate-500">Create a campaign to add its task record to this list.</p><button type="button" onClick={() => setIsModalOpen(true)} className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white hover:bg-blue-800">Create campaign</button></div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {campaigns.map((campaign) => (
                            <li key={campaign.id}>
                                <Link href={`/dashboard/account-manager/tasks/${campaign.id}`} className="grid grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-5">
                                    <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-950">{campaign.title}</span><span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-slate-600">{campaign.description || 'No description provided.'}</span><span className="mt-1 block text-xs text-slate-500">{campaign.assignedAgent ? `Assigned to ${[campaign.assignedAgent.firstName, campaign.assignedAgent.lastName].filter(Boolean).join(' ') || campaign.assignedAgent.email}` : 'No agent listed'}</span></span>
                                    <span className="flex items-center gap-2 text-xs text-slate-600"><span className="text-slate-400">Status</span><span className="capitalize">{campaign.status.replaceAll('_', ' ')}</span></span>
                                    <span className="flex items-center justify-between gap-4 text-xs sm:justify-end"><span className="font-semibold text-slate-900">{formatBudget(Number(campaign.budget || 0), campaignCurrency(campaign))}</span><span className="material-symbols-outlined text-base text-blue-700">arrow_forward</span></span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <CreateCampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateCampaign}
                isSubmitting={isCreating}
                projects={managedProjects}
                isLoadingProjects={isLoadingProjects}
            />
        </div>
    );
}
