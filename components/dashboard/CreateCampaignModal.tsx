'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormInput, FormSelect } from '@/components/ui/FormComponents';
import { useAgents } from '@/hooks/useAgents';

const campaignSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    budget: z.coerce.number().min(5, 'Budget must be at least £5'),
    currency: z.string().min(1),
    type: z.string().min(1),
    status: z.string().min(1),
    estimatedTime: z.string().optional(),
    isConsultancy: z.boolean().default(false),
    assignedAgentId: z.string().optional(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: any) => Promise<void>;
    isSubmitting: boolean;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isSubmitting 
}) => {
    const { data: agents } = useAgents();
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CampaignFormValues>({
        // @ts-ignore - Zod coercion types can be tricky with RHF Resolver
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            currency: 'USD',
            type: 'campaign',
            status: 'active',
            isConsultancy: false,
        }
    });

    if (!isOpen) return null;

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
        reset();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter italic">Tactical Deployment</h2>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1 opacity-60">Initialize new strategic operation</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form id="campaign-form" onSubmit={handleSubmit(handleFormSubmit)} className="p-8 overflow-y-auto space-y-6 flex-1">
                    <FormInput 
                        label="Operation Title"
                        placeholder="e.g., Q4 Strategic Market Expansion"
                        register={register('title')}
                        error={errors.title}
                        required
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Mission Briefing (Description)</label>
                        <textarea 
                            {...register('description')}
                            placeholder="Detailed strategic objectives and deployment parameters..."
                            className={`w-full bg-white border rounded-xl px-5 py-4 text-text-main placeholder-slate-400 outline-none transition-all font-medium min-h-[120px] ${errors.description ? 'border-red-300' : 'border-slate-200 focus:border-primary'}`}
                        />
                        {errors.description && <p className="text-xs text-red-500 font-bold ml-1 italic">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput 
                            label="Strategic Budget"
                            type="number"
                            placeholder="5000"
                            register={register('budget')}
                            error={errors.budget}
                            required
                        />
                        <FormSelect 
                            label="Currency"
                            register={register('currency')}
                            options={[
                                { value: 'USD', label: 'USD ($)' },
                                { value: 'GBP', label: 'GBP (£)' },
                                { value: 'EUR', label: 'EUR (€)' },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect 
                            label="Operation Type"
                            register={register('type')}
                            options={[
                                { value: 'campaign', label: 'Strategic Campaign' },
                                { value: 'one_time', label: 'One-Time Operation' },
                                { value: 'recurring', label: 'Recurring Deployment' },
                            ]}
                        />
                        <FormSelect 
                            label="Initial Status"
                            register={register('status')}
                            options={[
                                { value: 'active', label: 'Active - Deploy Immediately' },
                                { value: 'open', label: 'Open - Available for Claim' },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect 
                            label="Assigned Agent"
                            register={register('assignedAgentId')}
                            options={agents?.map(a => ({ value: a.id, label: a.name })) || []}
                            helperText="Optional: Leave blank to make available to all agents"
                        />
                        <FormInput 
                            label="Estimated Duration"
                            placeholder="e.g., 4h, 2d, 1w"
                            register={register('estimatedTime')}
                            error={errors.estimatedTime}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4 px-2">
                        <input 
                            type="checkbox" 
                            id="isConsultancy"
                            {...register('isConsultancy')}
                            className="size-5 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary" 
                        />
                        <label htmlFor="isConsultancy" className="text-sm font-bold text-text-main uppercase tracking-widest italic cursor-pointer">High Level Consultancy</label>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 border border-slate-200 text-slate-400 hover:text-text-main font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                    >
                        Abort Mission
                    </button>
                    <button 
                        type="submit"
                        form="campaign-form"
                        disabled={isSubmitting}
                        className="flex-[2] py-4 bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-lg">rocket_launch</span>
                        {isSubmitting ? 'Initializing Deployment...' : 'Confirm Strategic Deployment'}
                    </button>
                </div>
            </div>
        </div>
    );
};
