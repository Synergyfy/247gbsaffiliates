'use client';

import React, { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormValues } from '@/lib/schemas';
import { FormInput, FormSelect } from '@/components/ui/FormComponents';
import { toast } from 'react-toastify';
import { COUNTRY_OPTIONS, TIMEZONE_OPTIONS, TOP_LANGUAGES } from '@/lib/constants';

const ProfileInfoStep: React.FC = () => {
    const { role, profileInfo, updateProfileInfo, setStep } = useOnboardingStore();
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [currency, setCurrency] = useState("$"); // Default currency

    const {
        register,
        handleSubmit,
        setValue,
        watch,
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

    const watchedCountry = watch('country');

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

    useEffect(() => {
        if (watchedCountry) {
            const newCurrency = getCurrencyForCountry(watchedCountry);
            setCurrency(newCurrency);
        }
    }, [watchedCountry]);

    const onSubmit = (data: ProfileFormValues) => {
        updateProfileInfo(data);
        toast.success("Profile details saved!");
        setStep('questionnaire');
    };

    const onError = () => {
        toast.error("Please fix the errors before continuing.");
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const response = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                );
                const data = await response.json();

                if (data.countryName) {
                    // Try to match standard country name to our options if possible
                    // Ideally we'd map standard names to our values, but for now we'll assumes names match or set directly
                    // This sets the value in the form
                    setValue('country', data.countryName, { shouldValidate: true });
                    toast.success(`Detected Location: ${data.countryName}`);
                }
            } catch (error) {
                console.error("Location error:", error);
                toast.error("Failed to fetch location details.");
            } finally {
                setDetectingLocation(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            toast.error("Location access denied or unavailable.");
            setDetectingLocation(false);
        });
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
                    {role === 'agent' ? 'Agent' : role === 'account-manager' ? 'Account Manager' : 'Consultant'} Quick Profile
                </h1>
                <p className="text-[11px] md:text-sm text-slate-500 max-w-xs sm:max-w-md mx-auto leading-normal">
                    Provide specific details about your professional background and expertise.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-3.5 md:space-y-6 bg-white p-4 sm:p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">

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
                    <FormSelect
                        label="Primary Language"
                        register={register('languages')}
                        options={TOP_LANGUAGES}
                        error={errors.languages}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="relative">
                        <FormSelect
                            label="Country"
                            register={register('country')}
                            options={COUNTRY_OPTIONS}
                            error={errors.country}
                            required
                        />
                        <button
                            type="button"
                            onClick={detectLocation}
                            disabled={detectingLocation}
                            className="absolute right-0 top-0 text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-1 mt-1"
                        >
                            <span className="material-symbols-outlined text-[13px] md:text-[14px]">my_location</span>
                            {detectingLocation ? 'Detecting...' : 'Use Current Location'}
                        </button>
                    </div>

                    <FormSelect
                        label="Timezone"
                        register={register('timezone')}
                        options={TIMEZONE_OPTIONS}
                        error={errors.timezone}
                        required
                    />
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

                <FormInput
                    label="Portfolio/Sample Work URL"
                    type="url"
                    register={register('portfolioUrl')}
                    placeholder="https://portfolio.com"
                    error={errors.portfolioUrl}
                    required
                />

                {(role === 'consultant') && (
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Upload ID / Verification Docs</label>
                        <p className="text-[10px] md:text-xs text-amber-600 font-bold uppercase tracking-widest mb-1.5 md:mb-2">Required for Consultant Verification</p>
                        <input
                            type="file"
                            className="block w-full text-xs md:text-sm text-slate-500 file:mr-3 md:file:mr-4 file:py-1.5 md:file:py-2 file:px-3 md:file:px-4 file:rounded-full file:border-0 file:text-[10px] md:file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                        />
                    </div>
                )}

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
                        className="flex-1 h-10 md:h-14 px-3 md:px-8 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-2xl font-display font-bold text-xs sm:text-sm md:text-base transition-all active:scale-[0.99] shadow-sm md:shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 md:gap-2 group"
                    >
                        <span className="md:hidden">Questionnaire</span>
                        <span className="hidden md:inline">Continue to Questionnaire</span>
                        <span className="material-symbols-outlined text-base md:text-lg transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileInfoStep;
