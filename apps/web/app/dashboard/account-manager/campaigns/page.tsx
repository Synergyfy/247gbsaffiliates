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

function CampaignCard({ campaign }: { campaign: Task }) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <article className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:border-blue-400 hover:shadow-xs sm:p-5">
            <div className="min-w-0 flex-1">
                {/* Header row - clickable toggle on mobile */}
                <div
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="flex cursor-pointer md:cursor-default items-start justify-between gap-3 select-none"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsCollapsed((prev) => !prev);
                        }
                    }}
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold tracking-tight text-slate-950 group-hover:text-blue-700 transition-colors">
                                {campaign.title}
                            </h3>
                            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                                {campaign.status.replaceAll('_', ' ')}
                            </span>
                        </div>
                        {/* Mobile preview line when collapsed */}
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 md:hidden">
                            <span className="font-bold text-emerald-700">
                                {formatBudget(Number(campaign.budget || 0), campaignCurrency(campaign))}
                            </span>
                            {campaign.assignedAgent ? (
                                <>
                                    <span className="text-slate-300">·</span>
                                    <span className="truncate max-w-[150px]">
                                        {[campaign.assignedAgent.firstName, campaign.assignedAgent.lastName].filter(Boolean).join(' ') || campaign.assignedAgent.email}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-slate-300">·</span>
                                    <span className="text-slate-400">No agent listed</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <span className="hidden md:inline text-base font-bold tracking-tight text-emerald-700">
                            {formatBudget(Number(campaign.budget || 0), campaignCurrency(campaign))}
                        </span>
                        <span
                            aria-label={isCollapsed ? 'Expand campaign card' : 'Collapse campaign card'}
                            className="inline-flex size-7 md:hidden items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined !text-base">
                                {isCollapsed ? 'expand_more' : 'expand_less'}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Collapsible content: hidden on mobile when collapsed, always visible on desktop */}
                <div className={`${isCollapsed ? 'hidden md:block' : 'block'} mt-2.5`}>
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {campaign.description || 'No description provided.'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <span className="material-symbols-outlined !text-sm text-slate-400">person</span>
                            {campaign.assignedAgent ? [campaign.assignedAgent.firstName, campaign.assignedAgent.lastName].filter(Boolean).join(' ') || campaign.assignedAgent.email : 'No agent listed'}
                        </span>
                        {campaign.dueDate && (
                            <>
                                <span className="text-slate-300">·</span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="material-symbols-outlined !text-sm text-slate-400">calendar_today</span>
                                    Due {new Date(campaign.dueDate).toLocaleDateString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer with View Campaign CTA: hidden on mobile when collapsed, always visible on desktop */}
            <div className={`${isCollapsed ? 'hidden md:flex' : 'flex'} mt-4 items-center justify-end border-t border-slate-100 pt-3`}>
                <Link
                    href={`/dashboard/account-manager/tasks/${campaign.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
                >
                    <span>View campaign</span>
                    <span className="material-symbols-outlined !text-base transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                </Link>
            </div>
        </article>
    );
}

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
            await refetch();
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
            <header className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">Account Manager workspace</p>
                    <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Campaigns</h1>
                    <p className="mt-0.5 text-xs text-slate-500">Manage promotional campaigns and client tasks.</p>
                </div>
                <div className="flex w-full justify-end sm:w-auto">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isCreating}
                        className="inline-flex h-8 sm:h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 shadow-xs"
                    >
                        <span className="material-symbols-outlined !text-base">add</span>
                        <span>{isCreating ? 'Creating…' : 'Create campaign'}</span>
                    </button>
                </div>
            </header>

            <section
                className="-mx-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-3 px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none"
                aria-label="Campaign summary"
            >
                {/* 1. Active Campaigns */}
                <article className="min-w-[210px] flex-1 shrink-0 snap-start rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-xs sm:min-w-0 sm:shrink">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Active campaigns</span>
                        <span className="material-symbols-outlined !text-lg text-blue-600 shrink-0">campaign</span>
                    </div>
                    <p className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                        {isLoading ? '…' : isError ? '—' : activeCampaigns.length}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">Open or in-flight</p>
                </article>

                {/* 2. Completed Campaigns */}
                <article className="min-w-[210px] flex-1 shrink-0 snap-start rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-xs sm:min-w-0 sm:shrink">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Completed campaigns</span>
                        <span className="material-symbols-outlined !text-lg text-emerald-600 shrink-0">task_alt</span>
                    </div>
                    <p className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                        {isLoading ? '…' : isError ? '—' : completedCampaigns.length}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">Completed or approved</p>
                </article>

                {/* 3. Campaign Budget Total */}
                <article className="min-w-[210px] flex-1 shrink-0 snap-start rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-xs sm:min-w-0 sm:shrink">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Campaign budget total</span>
                        <span className="material-symbols-outlined !text-lg text-violet-600 shrink-0">payments</span>
                    </div>
                    <div className="mt-1">
                        {isLoading ? (
                            <p className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Loading…</p>
                        ) : isError ? (
                            <p className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Unavailable</p>
                        ) : Object.keys(budgetTotals).length ? (
                            Object.entries(budgetTotals).map(([currency, total]) => (
                                <span key={currency} className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                                    {formatBudget(total, currency)}
                                </span>
                            ))
                        ) : (
                            <p className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">—</p>
                        )}
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">Totals by currency</p>
                </article>
            </section>

            <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div>
                        <h2 className="text-sm font-bold text-slate-950">Campaign work</h2>
                        <p className="mt-0.5 text-xs text-slate-500">Status and assignment from each campaign task record</p>
                    </div>
                    {!isLoading && !isError && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                            {campaigns.length} record{campaigns.length === 1 ? '' : 's'}
                        </span>
                    )}
                </div>

                {isLoading && !isError ? (
                    <div className="space-y-3" aria-label="Loading campaigns">
                        <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
                        <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
                        <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
                    </div>
                ) : isError ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                        <RequestErrorState
                            area="Campaigns"
                            label="Campaigns"
                            error={error}
                            onRetry={() => void refetch()}
                            supportHref="/dashboard/account-manager/messages"
                        />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300">campaign</span>
                        <h3 className="mt-2 text-sm font-semibold text-slate-800">No campaigns yet</h3>
                        <p className="mt-1 text-xs text-slate-500">Create a campaign to add its task record to this list.</p>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 text-xs font-semibold text-white hover:bg-blue-800"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Create campaign
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {campaigns.map((campaign) => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
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
