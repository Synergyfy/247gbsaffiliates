'use client';

import React, { useState } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormValues } from '@/lib/schemas';
import { FormInput } from '@/components/ui/FormComponents';
import { toast } from 'react-toastify';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';

const ProfileInfoStep: React.FC = () => {
    const { role, basicInfo, profileInfo, updateProfileInfo, setStep } = useOnboardingStore();
    const { updateUser } = useAuthStore();
    const [identityDocument, setIdentityDocument] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            role: role || 'agent',
            hourlyRate: String(profileInfo.hourlyRate ?? ''),
            bio: String(profileInfo.bio ?? ''),
            phone: basicInfo.phone || String(profileInfo.phone ?? ''),
            postalCode: basicInfo.zipCode || String(profileInfo.postalCode ?? ''),
            city: basicInfo.city || String(profileInfo.city ?? ''),
            region: basicInfo.region || String(profileInfo.region ?? ''),
            country: basicInfo.country || String(profileInfo.country ?? ''),
            licenseNumber: String(profileInfo.licenseNumber ?? ''),
            yearsExperience: String(profileInfo.yearsExperience ?? ''),
            company: String(profileInfo.company ?? ''),
            expertise: String(profileInfo.expertise ?? ''),
            linkedinUrl: String(profileInfo.linkedinUrl ?? ''),
        },
    });

    const watchedCountry = useWatch({ control, name: 'country' });

    // Map common countries to currencies (basic mapping)
    const getCurrencyForCountry = (country: string) => {
        const mapping: Record<string, string> = {
            'Nigeria': '₦',
            'United Kingdom': '£',
            'United States': '$',
            'Canada': 'CA$',
            'Australia': 'AU$',
            'Ghana': '₵',
            'South Africa': 'R',
        };
        return mapping[country] || '$';
    };
    const currency = watchedCountry ? getCurrencyForCountry(watchedCountry) : '$';

    const onSubmit = async (data: ProfileFormValues) => {
        if (!identityDocument) {
            toast.error('Upload an identity document to submit your profile for admin verification.');
            return;
        }

        const submission = { ...data, role: role || data.role };
        const formData = new FormData();
        formData.append('submission', JSON.stringify(submission));
        formData.append('identityDocument', identityDocument);
        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/verification/account', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            updateProfileInfo(submission);
            updateUser({
                verificationStatus: response.data.verificationStatus,
                verificationNotes: response.data.verificationNotes,
                verificationSubmission: response.data.verificationSubmission,
                verificationReviewedAt: response.data.verificationReviewedAt,
                isOnboarded: false,
            });
            toast.success('Profile and identity document submitted for admin verification.');
            setStep('questionnaire');
        } catch (error) {
            console.error('Verification submission failed:', error);
            toast.error('Could not submit your profile for verification. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onError = () => {
        toast.error("Please fix the errors before continuing.");
    };

    const renderRoleFields = () => {
        switch (role) {
            case 'agent':
                return (
                    <>
                        <FormInput
                            label="Professional License Number"
                            register={register('licenseNumber')}
                            placeholder="e.g. RE-12345678"
                            error={errors.licenseNumber}
                        />
                        <FormInput
                            label="Years of Experience"
                            type="number"
                            register={register('yearsExperience')}
                            placeholder="e.g. 5"
                            error={errors.yearsExperience}
                        />
                    </>
                );
            case 'account-manager':
                return (
                    <>
                        <FormInput
                            label="Current Company"
                            register={register('company')}
                            placeholder="e.g. Prime Realty Group"
                            error={errors.company}
                        />
                    </>
                );
            case 'consultant':
                return (
                    <>
                        <FormInput
                            label="Primary Expertise"
                            register={register('expertise')}
                            placeholder="e.g. Investment Strategy, Legal"
                            error={errors.expertise}
                        />
                        <FormInput
                            label="LinkedIn Profile URL"
                            register={register('linkedinUrl')}
                            placeholder="https://linkedin.com/in/username"
                            error={errors.linkedinUrl}
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto w-full px-1 sm:px-0">
            <div className="text-center mb-2 md:mb-10">
                <span className="hidden md:inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                    Professional Profile
                </span>
                <h1 className="text-base sm:text-lg md:text-3xl font-display font-bold text-text-main mb-0.5 md:mb-3">
                    {(() => {
                        const normalized = (role || '').toLowerCase().replace(/_/g, '-');
                        if (normalized === 'agent') return 'Agent';
                        if (normalized === 'account-manager') return 'Account Manager';
                        return 'Consultant';
                    })()} Quick Profile
                </h1>
                <p className="text-[11px] md:text-sm text-slate-500 max-w-xs sm:max-w-md mx-auto leading-normal">
                    Provide specific details about your professional background and expertise.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-3.5 md:space-y-6 bg-white p-4 sm:p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">

                <input type="hidden" {...register('phone')} />
                <input type="hidden" {...register('postalCode')} />
                <input type="hidden" {...register('city')} />
                <input type="hidden" {...register('region')} />
                <input type="hidden" {...register('country')} />

                {/* Role Specific Top Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-2 md:mb-4">
                    {renderRoleFields()}
                </div>

                <div className="w-full border-t border-slate-50 my-3 md:my-6"></div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="relative">
                        <FormInput
                            label={`Hourly Rate (${currency})`}
                            register={register('hourlyRate')}
                            placeholder={`${currency}25/hr`}
                            error={errors.hourlyRate}
                            required
                        />
                        {/* Currency Indicator */}
                        <div className="absolute right-3.5 md:right-4 top-[30px] md:top-[38px] text-[10px] md:text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 md:py-1 rounded pointer-events-none">
                            {currency} / hr
                        </div>
                    </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                    <label className="text-xs md:text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">
                        Short Bio (Max 120 chars) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className={`w-full bg-white border rounded-xl p-3 md:p-4 text-xs md:text-sm text-text-main placeholder-gray-400 outline-none transition-all font-medium resize-none min-h-[72px] md:min-h-[96px] ${errors.bio
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
                            }`}
                        placeholder="Briefly describe your expertise..."
                        rows={2}
                        {...register('bio')}
                    />
                    {errors.bio && (
                        <p className="text-[10px] md:text-xs text-red-500 font-bold ml-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.bio.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5 md:space-y-2">
                    <label htmlFor="identity-document" className="text-xs md:text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Identity document <span className="text-red-600">*</span></label>
                    <p className="text-[10px] md:text-xs text-amber-700 font-medium mb-1.5 md:mb-2">Required for administrator verification. PDF, JPG, or PNG up to 5 MB.</p>
                    <input
                        id="identity-document"
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(event) => setIdentityDocument(event.target.files?.[0] || null)}
                        className="block w-full text-xs md:text-sm text-slate-500 file:mr-3 md:file:mr-4 file:py-1.5 md:file:py-2 file:px-3 md:file:px-4 file:rounded-full file:border-0 file:text-[10px] md:file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                    />
                    {identityDocument && <p className="text-[10px] text-slate-500">Selected: {identityDocument.name}</p>}
                </div>

                <div className="flex items-center gap-2 sm:gap-4 mt-4 md:mt-8 pt-2.5 md:pt-4 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={() => setStep('basic-info')}
                        aria-label="Back to Basic Information"
                        className="size-10 md:w-auto md:h-14 md:px-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl font-display font-bold transition-all flex items-center justify-center shrink-0 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-base md:text-xl">arrow_back</span>
                        <span className="hidden md:inline ml-1.5">Back</span>
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-10 md:h-14 px-3 md:px-8 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-2xl font-display font-bold text-xs sm:text-sm md:text-base transition-all active:scale-[0.99] shadow-sm md:shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 md:gap-2 group disabled:opacity-60"
                    >
                        <span className="md:hidden">{isSubmitting ? 'Submitting…' : 'Questionnaire'}</span>
                        <span className="hidden md:inline">{isSubmitting ? 'Submitting verification…' : 'Continue to Questionnaire'}</span>
                        <span className="material-symbols-outlined text-base md:text-lg transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileInfoStep;
