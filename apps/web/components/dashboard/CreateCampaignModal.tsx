'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAgents } from '@/hooks/useAgents';
import type { ManagedProject } from '@/hooks/useTasks';

const campaignSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    budget: z.coerce.number().min(0, 'Budget cannot be negative'),
    currency: z.string().default('EUR'),
    type: z.string().min(1),
    isConsultancy: z.boolean().default(false),
    assignedAgentId: z.string().optional(),
    centralProjectId: z.string().optional(),
});

type CampaignFormInput = z.input<typeof campaignSchema>;
type CampaignFormValues = z.output<typeof campaignSchema>;

export type CampaignCreateInput = {
    title: string;
    description: string;
    budget: number;
    currency: string;
    type: string;
    assignedAgentId?: string;
    centralProjectId?: string;
};

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: CampaignCreateInput) => Promise<void>;
    isSubmitting: boolean;
    projects?: ManagedProject[];
    isLoadingProjects?: boolean;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isSubmitting,
    projects = [],
    isLoadingProjects = false,
}) => {
    const { data: agents } = useAgents();
    const [budgetString, setBudgetString] = useState('0.00');
    
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CampaignFormInput, unknown, CampaignFormValues>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            currency: 'EUR',
            budget: 0,
            type: 'campaign',
            isConsultancy: false,
            centralProjectId: '',
        }
    });

    useEffect(() => {
        if (isOpen) {
            setBudgetString('0.00');
            setValue('budget', 0);
            setValue('currency', 'EUR');
        }
    }, [isOpen, setValue]);

    if (!isOpen) return null;

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const filtered = raw.replace(/[^0-9.]/g, '');
        const parts = filtered.split('.');
        const clean = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
        setBudgetString(clean);
        const num = parseFloat(clean);
        setValue('budget', isNaN(num) ? 0 : num, { shouldValidate: true });
    };

    const handleBudgetBlur = () => {
        if (!budgetString || budgetString.trim() === '' || isNaN(parseFloat(budgetString))) {
            setBudgetString('0.00');
            setValue('budget', 0, { shouldValidate: true });
        } else {
            const num = parseFloat(budgetString);
            setBudgetString(num.toFixed(2));
            setValue('budget', num, { shouldValidate: true });
        }
    };

    const handleFormSubmit = async (data: CampaignFormValues) => {
        const payload: CampaignCreateInput = {
            title: data.title,
            description: data.description,
            budget: data.budget,
            currency: 'EUR',
            type: data.isConsultancy ? 'consultancy' : data.type,
            ...(data.assignedAgentId ? { assignedAgentId: data.assignedAgentId } : {}),
            ...(data.centralProjectId ? { centralProjectId: data.centralProjectId } : {}),
        };
        await onSubmit(payload);
        reset();
        setBudgetString('0.00');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200 flex flex-col max-h-[92vh]">
                
                {/* Compact Executive Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold font-display text-slate-900 tracking-tight">Create Campaign</h2>
                        <p className="text-[11px] text-slate-500 font-medium">Set up a promotional campaign or client marketing task</p>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        aria-label="Close modal"
                        className="size-7 rounded-md hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Form Body - Information Dense & Compact */}
                <form id="campaign-form" onSubmit={handleSubmit(handleFormSubmit)} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
                    
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            Campaign Title <span className="text-red-600" aria-hidden="true">*</span>
                        </label>
                        <input
                            {...register('title')}
                            type="text"
                            placeholder="e.g., Summer Promotional Launch"
                            className={`w-full h-9 rounded-lg border bg-white px-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all ${
                                errors.title 
                                    ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100' 
                                    : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20'
                            }`}
                        />
                        {errors.title && <p className="text-[10px] text-red-600 font-medium">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            Campaign Description <span className="text-red-600" aria-hidden="true">*</span>
                        </label>
                        <textarea 
                            {...register('description')}
                            placeholder="Detail campaign objectives, deliverables, and requirements..."
                            rows={3}
                            className={`w-full rounded-lg border bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all resize-y min-h-[70px] ${
                                errors.description 
                                    ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100' 
                                    : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20'
                            }`}
                        />
                        {errors.description && <p className="text-[10px] text-red-600 font-medium">{errors.description.message}</p>}
                    </div>

                    {/* Budget & Type - 2 col compact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                Campaign Budget <span className="text-red-600" aria-hidden="true">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-xs font-bold text-slate-500 select-none">€</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={budgetString}
                                    onChange={handleBudgetChange}
                                    onBlur={handleBudgetBlur}
                                    placeholder="0.00"
                                    className={`w-full h-9 rounded-lg border bg-white pl-7 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition-all ${
                                        errors.budget 
                                            ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100' 
                                            : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20'
                                    }`}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400">Fixed currency: EUR (€)</p>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                Campaign Type <span className="text-red-600" aria-hidden="true">*</span>
                            </label>
                            <select
                                {...register('type')}
                                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                            >
                                <option value="campaign">Standard Campaign</option>
                                <option value="one_time">One-Time Promotion</option>
                                <option value="recurring">Recurring Campaign</option>
                                <option value="consultancy">Consultancy Session</option>
                            </select>
                        </div>
                    </div>

                    {/* Client Project */}
                    <div className="rounded-lg border border-blue-200/70 bg-blue-50/40 p-3 space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-900">
                            Client Project (Central Hub)
                        </label>
                        <select
                            {...register('centralProjectId')}
                            className="w-full h-9 rounded-md border border-blue-200 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-primary"
                        >
                            <option value="">None (Internal operational campaign)</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.business?.businessName ? `${p.title} — ${p.business.businessName}` : p.title}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-blue-700">
                            {isLoadingProjects ? 'Loading managed projects...' : 'Links this campaign to Central Hub with full review and business attribution.'}
                        </p>
                    </div>

                    {/* Assigned Specialist */}
                    <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            Assigned Specialist / Agent
                        </label>
                        <select
                            {...register('assignedAgentId')}
                            className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        >
                            <option value="">Unassigned (Available to claim)</option>
                            {(agents || []).map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Consultancy Toggle */}
                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="isConsultancy"
                            {...register('isConsultancy')}
                            className="size-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer" 
                        />
                        <span className="text-xs font-semibold text-slate-700 select-none">
                            High Level Consultancy (Requires certified consultant review)
                        </span>
                    </label>
                </form>

                {/* Compact Footer */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-2">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        form="campaign-form"
                        disabled={isSubmitting}
                        className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <span>Create Campaign</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
