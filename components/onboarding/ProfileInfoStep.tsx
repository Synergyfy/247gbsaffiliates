'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormValues } from '@/lib/schemas';
import { FormInput, FormSelect } from '@/components/ui/FormComponents';
import { toast } from 'react-toastify';
import { COUNTRY_OPTIONS, TIMEZONE_OPTIONS, TOP_LANGUAGES } from '@/lib/constants';

const ProfileInfoStep: React.FC = () => {
    const { role, profileInfo, updateProfileInfo, setStep } = useOnboardingStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            role: role || 'agent',
            hourlyRate: profileInfo.hourlyRate || '',
            bio: profileInfo.bio || '',
            country: profileInfo.country || '',
            timezone: profileInfo.timezone || '',
            languages: profileInfo.languages || '',
            portfolioUrl: profileInfo.portfolioUrl || '',
            ...profileInfo,
        },
    });

    const onSubmit = (data: ProfileFormValues) => {
        updateProfileInfo(data);
        toast.success("Profile details saved!");
        setStep('questionnaire');
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
                        {/* Removed Specialty Area to align with project spec if needed, keeping generic for now or removing if strictly unnecessary */}
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
                        {/* Removed Units Managed / Approach */}
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
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                    Professional Profile
                </span>
                <h1 className="text-3xl font-display font-bold text-text-main mb-3">
                    {role === 'agent' ? 'Agent' : role === 'account-manager' ? 'Account Manager' : 'Consultant'} Quick Profile
                </h1>
                <p className="text-slate-500">Provide specific details about your professional background and expertise.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">

                {/* Role Specific Top Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {renderRoleFields()}
                </div>

                <div className="w-full border-t border-slate-50 my-6"></div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Hourly/Rate"
                        register={register('hourlyRate')}
                        placeholder="$25/hr"
                        error={errors.hourlyRate}
                        required
                    />
                    <FormSelect
                        label="Primary Language"
                        register={register('languages')}
                        options={TOP_LANGUAGES}
                        error={errors.languages}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                        label="Country"
                        register={register('country')}
                        options={COUNTRY_OPTIONS}
                        error={errors.country}
                        required
                    />
                    <FormSelect
                        label="Timezone"
                        register={register('timezone')}
                        options={TIMEZONE_OPTIONS}
                        error={errors.timezone}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">
                        Short Bio (Max 120 chars) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className={`w-full bg-white border rounded-xl p-4 text-text-main placeholder-gray-400 outline-none transition-all font-medium resize-none ${errors.bio
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
                            }`}
                        placeholder="Briefly describe your expertise..."
                        rows={3}
                        {...register('bio')}
                    />
                    {errors.bio && (
                        <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.bio.message}
                        </p>
                    )}
                </div>

                <FormInput
                    label="Portfolio/Sample Work URL"
                    type="url"
                    register={register('portfolioUrl')}
                    placeholder="https://portfolio.com"
                    error={errors.portfolioUrl}
                    required
                />

                {(role === 'consultant') && (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Upload ID / Verification Docs</label>
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-2">Required for Consultant Verification</p>
                        <input
                            type="file"
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                        // Handle file upload logic here
                        />
                    </div>
                )}

                <div className="flex gap-4 mt-8 pt-4 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={() => setStep('basic-info')}
                        className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-display font-bold transition-all"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-display font-bold transition-all hover:scale-[1.02] shadow-xl shadow-primary/20 active:scale-[0.98]"
                    >
                        Continue to Questionnaire
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileInfoStep;
