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
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-display font-bold text-text-main mb-3">Basic Information</h1>
                <p className="text-slate-500">Let's start with some basic details to help us set up your professional profile.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AuthInput
                        label="Work Location"
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

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-display ml-1">Professional Headline</label>
                    <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium min-h-[120px]"
                        placeholder="Briefly describe what you do (e.g. Expert Real Estate Agent specialized in luxury properties)"
                        value={basicInfo.headline}
                        onChange={(e) => updateBasicInfo({ headline: e.target.value })}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-display font-bold transition-all hover:scale-[1.02] shadow-lg shadow-primary/25 mt-4"
                >
                    Continue to Profile Details
                </button>
            </form>
        </div>
    );
};

export default BasicInfoStep;
