'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import AuthInput from '@/components/auth/AuthInput';

const BasicInfoStep: React.FC = () => {
    const { basicInfo, updateBasicInfo, setStep } = useOnboardingStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('profile-info');
    };

    return (
        <div className="max-w-2xl mx-auto w-full px-1 sm:px-0">
            <div className="text-center mb-2 md:mb-10">
                <h1 className="text-base sm:text-lg md:text-3xl font-display font-bold text-text-main mb-0.5 md:mb-3">Basic Information</h1>
                <p className="text-[11px] md:text-sm text-slate-500 max-w-xs sm:max-w-md mx-auto leading-normal">Let's start with some basic details to help us set up your professional profile.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 md:space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    <AuthInput
                        label="Location"
                        type="text"
                        placeholder="e.g. New York, NY"
                        value={basicInfo.location}
                        onChange={(e) => updateBasicInfo({ location: e.target.value })}
                        required
                    />
                    <AuthInput
                        label="Zip Code"
                        type="text"
                        placeholder="10001"
                        value={basicInfo.zipCode}
                        onChange={(e) => updateBasicInfo({ zipCode: e.target.value })}
                        required
                    />
                </div>

                <AuthInput
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={basicInfo.phone}
                    onChange={(e) => updateBasicInfo({ phone: e.target.value })}
                    required
                />

                <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest font-display ml-1">Professional Headline</label>
                    <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl py-2.5 px-3 md:py-4 md:px-5 text-xs md:text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium min-h-[85px] md:min-h-[120px]"
                        placeholder="Briefly describe what you do (e.g. Expert Specialist in digital solutions)"
                        value={basicInfo.headline}
                        onChange={(e) => updateBasicInfo({ headline: e.target.value })}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full h-10 md:h-14 bg-primary hover:bg-primary-dark text-white rounded-xl md:rounded-2xl font-display font-bold text-xs sm:text-sm md:text-base transition-all active:scale-[0.99] shadow-sm md:shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 md:gap-2 group mt-2.5 md:mt-6"
                >
                    <span className="md:hidden">Continue</span>
                    <span className="hidden md:inline">Continue to Profile Details</span>
                    <span className="material-symbols-outlined text-base md:text-lg transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                </button>
            </form>
        </div>
    );
};

export default BasicInfoStep;
