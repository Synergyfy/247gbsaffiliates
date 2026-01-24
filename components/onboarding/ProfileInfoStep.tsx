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

    const renderCommonFields = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AuthInput
                    label="Hourly/Rate"
                    type="text" // Ideally select or number with currency
                    placeholder="$25/hr"
                    value={profileInfo.hourlyRate || ''}
                    onChange={(e) => updateProfileInfo({ hourlyRate: e.target.value })}
                    required
                />
                <AuthInput
                    label="Languages (comma separated)"
                    type="text"
                    placeholder="English, Spanish"
                    value={profileInfo.languages || ''}
                    onChange={(e) => updateProfileInfo({ languages: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AuthInput
                    label="Country"
                    type="text"
                    placeholder="e.g. United States"
                    value={profileInfo.country || ''}
                    onChange={(e) => updateProfileInfo({ country: e.target.value })}
                    required
                />
                <AuthInput
                    label="Timezone"
                    type="text"
                    placeholder="e.g. EST"
                    value={profileInfo.timezone || ''}
                    onChange={(e) => updateProfileInfo({ timezone: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Short Bio (Max 120 chars)</label>
                <textarea
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-text-main placeholder-gray-400 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium resize-none"
                    placeholder="Briefly describe your expertise..."
                    maxLength={120}
                    rows={3}
                    value={profileInfo.bio || ''}
                    onChange={(e) => updateProfileInfo({ bio: e.target.value })}
                    required
                />
                <p className="text-right text-xs text-slate-400">{(profileInfo.bio?.length || 0)}/120</p>
            </div>

            <AuthInput
                label="Portfolio/Sample Work URL"
                type="url"
                placeholder="https://portfolio.com"
                value={profileInfo.portfolioUrl || ''}
                onChange={(e) => updateProfileInfo({ portfolioUrl: e.target.value })}
                required
            />

            {(role === 'consultant') && (
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Upload ID / Verification Docs</label>
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-2">Required for Consultant Verification</p>
                    <input
                        type="file"
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                        // Handle file upload logic here (mock for now or store file object if possible)
                        onChange={(e) => updateProfileInfo({ idDocument: e.target.files?.[0]?.name })}
                    />
                </div>
            )}
        </>
    );

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
                            placeholder=""
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

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">

                {/* Role Specific Top Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {renderRoleFields()}
                </div>

                <div className="w-full border-t border-slate-50 my-6"></div>

                {/* Common Fields */}
                {renderCommonFields()}

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
