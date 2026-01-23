'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import AuthInput from '@/components/auth/AuthInput';

const ProfileInfoStep: React.FC = () => {
    const { role, profileInfo, updateProfileInfo, setStep } = useOnboardingStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('questionnaire');
    };

    const renderRoleFields = () => {
        switch (role) {
            case 'agent':
                return (
                    <>
                        <AuthInput
                            label="Professional License Number"
                            type="text"
                            placeholder="e.g. RE-12345678"
                            value={profileInfo.licenseNumber || ''}
                            onChange={(e) => updateProfileInfo({ licenseNumber: e.target.value })}
                            required
                        />
                        <AuthInput
                            label="Years of Experience"
                            type="number"
                            placeholder="e.g. 5"
                            value={profileInfo.yearsExperience || ''}
                            onChange={(e) => updateProfileInfo({ yearsExperience: e.target.value })}
                            required
                        />
                        <AuthInput
                            label="Specialty Area"
                            type="text"
                            placeholder="e.g. Residential, Commercial"
                            value={profileInfo.specialty || ''}
                            onChange={(e) => updateProfileInfo({ specialty: e.target.value })}
                            required
                        />
                    </>
                );
            case 'account-manager':
                return (
                    <>
                        <AuthInput
                            label="Current Company"
                            type="text"
                            placeholder="e.g. Prime Realty Group"
                            value={profileInfo.company || ''}
                            onChange={(e) => updateProfileInfo({ company: e.target.value })}
                            required
                        />
                        <AuthInput
                            label="Units Managed"
                            type="number"
                            placeholder="e.g. 150"
                            value={profileInfo.unitsManaged || ''}
                            onChange={(e) => updateProfileInfo({ unitsManaged: e.target.value })}
                            required
                        />
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-display ml-1">Management Approach</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                                value={profileInfo.approach || ''}
                                onChange={(e) => updateProfileInfo({ approach: e.target.value })}
                                required
                            >
                                <option value="">Select approach...</option>
                                <option value="proactive">Proactive & Tech-Driven</option>
                                <option value="tenant-focused">Tenant-Focused & Personal</option>
                                <option value="efficiency">Efficiency & ROI Focused</option>
                            </select>
                        </div>
                    </>
                );
            case 'consultant':
                return (
                    <>
                        <AuthInput
                            label="Primary Expertise"
                            type="text"
                            placeholder="e.g. Investment Strategy, Legal"
                            value={profileInfo.expertise || ''}
                            onChange={(e) => updateProfileInfo({ expertise: e.target.value })}
                            required
                        />
                        <AuthInput
                            label="LinkedIn Profile URL"
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            value={profileInfo.linkedinUrl || ''}
                            onChange={(e) => updateProfileInfo({ linkedinUrl: e.target.value })}
                            required
                        />
                        <AuthInput
                            label="Estimated Hourly Rate ($)"
                            type="number"
                            placeholder="e.g. 150"
                            value={profileInfo.hourlyRate || ''}
                            onChange={(e) => updateProfileInfo({ hourlyRate: e.target.value })}
                            required
                        />
                    </>
                );
            default:
                return <p className="text-red-500">Error: Role not recognized.</p>;
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                    Professional Profile
                </span>
                <h1 className="text-3xl font-display font-bold text-text-main mb-3">
                    {role === 'agent' ? 'Agent' : role === 'account-manager' ? 'Account Manager' : 'Consultant'} Details
                </h1>
                <p className="text-slate-500">Provide specific details about your professional background and expertise.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                {renderRoleFields()}

                <div className="flex gap-4 mt-6">
                    <button
                        type="button"
                        onClick={() => setStep('basic-info')}
                        className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-display font-bold transition-all"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-display font-bold transition-all hover:scale-[1.02] shadow-lg shadow-primary/25"
                    >
                        Continue to Questionnaire
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileInfoStep;
