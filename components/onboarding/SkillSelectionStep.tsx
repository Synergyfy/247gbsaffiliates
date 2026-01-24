'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export const SkillSelectionStep: React.FC = () => {
    const {
        selectedSkills,
        toggleSkill,
        setStep,
        setAssessmentSkipped,
        questionnaireAnswers,
        updateQuestionnaireAnswers,
        isPaidVisibilityRequested,
        setIsPaidVisibilityRequested,
        role
    } = useOnboardingStore();

    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const { data: skills, isLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: mockApi.getSkills,
    });

    const filteredSkills = skills?.filter(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSkillToggle = (id: string) => {
        if (!selectedSkills.includes(id) && selectedSkills.length >= 3) {
            toast.warning("Please select only up to 3 top skills.");
            return;
        }
        toggleSkill(id);
    };

    const handleNext = () => {
        if (selectedSkills.length < 1) {
            toast.error("Please select at least 1 skill.");
            return;
        }
        setStep('quiz');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-b-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-4">
            <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                    Expertise & Preferences
                </span>
                <h1 className="text-3xl font-display font-bold text-text-main mb-3">Skill Assessment</h1>
                <p className="text-slate-500 max-w-lg mx-auto">
                    Select your top 2-3 skills and tell us how you work.
                </p>
            </div>

            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm mb-8">
                <h3 className="text-lg font-bold text-text-main mb-4 font-display">1. Top Skills (Max 3)</h3>

                <div className="mb-6 relative max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search skills..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                    {filteredSkills?.map((skill) => {
                        const isSelected = selectedSkills.includes(skill.id);
                        return (
                            <button
                                key={skill.id}
                                onClick={() => handleSkillToggle(skill.id)}
                                className={`px-4 py-2 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-2 font-display text-sm ${isSelected
                                    ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-primary/30'
                                    }`}
                            >
                                {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                                <span>{skill.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="w-full border-t border-slate-50 my-8"></div>

                <h3 className="text-lg font-bold text-text-main mb-6 font-display">2. Work Preferences</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Years of Experience</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                            value={questionnaireAnswers.yearsExperience || ''}
                            onChange={(e) => updateQuestionnaireAnswers({ yearsExperience: e.target.value })}
                        >
                            <option value="">Select experience...</option>
                            <option value="0-1">0-1 Years</option>
                            <option value="1-3">1-3 Years</option>
                            <option value="3-5">3-5 Years</option>
                            <option value="5+">5+ Years</option>
                        </select>
                    </div>

                    {role === 'account-manager' ? (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Team Leadership Exp</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                                value={questionnaireAnswers.teamLeadershipExp || ''}
                                onChange={(e) => updateQuestionnaireAnswers({ teamLeadershipExp: e.target.value })}
                            >
                                <option value="">Select experience...</option>
                                <option value="none">None</option>
                                <option value="1-5">Managed 1-5 People</option>
                                <option value="5-10">Managed 5-10 People</option>
                                <option value="10+">Managed 10+ People</option>
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Typical Turnaround</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                                value={questionnaireAnswers.turnaroundTime || ''}
                                onChange={(e) => updateQuestionnaireAnswers({ turnaroundTime: e.target.value })}
                            >
                                <option value="">Select turnaround...</option>
                                <option value="<24h">Less than 24h</option>
                                <option value="24-72h">24-72h</option>
                                <option value="3-7 days">3-7 Days</option>
                                <option value="1 week+">1 Week +</option>
                            </select>
                        </div>
                    )}
                </div>

                {role === 'account-manager' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Campaign Budget Capacity</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                                value={questionnaireAnswers.campaignBudgetCapacity || ''}
                                onChange={(e) => updateQuestionnaireAnswers({ campaignBudgetCapacity: e.target.value })}
                            >
                                <option value="">Select budget capacity...</option>
                                <option value="<1k">Less than $1k</option>
                                <option value="1k-5k">$1k - $5k</option>
                                <option value="5k-20k">$5k - $20k</option>
                                <option value="20k+">$20k+</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Availability Type</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                                value={questionnaireAnswers.availabilityType || ''}
                                onChange={(e) => updateQuestionnaireAnswers({ availabilityType: e.target.value })}
                            >
                                <option value="">Select availability...</option>
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="project">Project-based</option>
                            </select>
                        </div>
                    </div>
                ) : null}

                <div className="space-y-4">
                    {role !== 'account-manager' && (
                        <label className="flex items-center gap-3 p-4 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300"
                                checked={questionnaireAnswers.acceptFixedPrice || false}
                                onChange={(e) => updateQuestionnaireAnswers({ acceptFixedPrice: e.target.checked })}
                            />
                            <span className="text-sm font-medium text-text-secondary">I accept fixed-price micro-tasks</span>
                        </label>
                    )}

                    <label className="flex items-start gap-3 p-4 border border-primary/20 bg-primary/5 rounded-xl cursor-pointer transition-colors relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 mt-0.5"
                            checked={isPaidVisibilityRequested}
                            onChange={(e) => setIsPaidVisibilityRequested(e.target.checked)}
                        />
                        <div>
                            <span className="block text-sm font-bold text-text-main mb-1">Apply for Paid Assignment Visibility</span>
                            <span className="block text-xs text-slate-500 leading-relaxed">
                                If approved, your profile will be shown to businesses hiring paid suppliers. Approval may require a short review.
                            </span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
                <button
                    onClick={() => setStep('profile-info')}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-text-main transition-colors font-display text-sm group"
                >
                    <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
                    <span>Back to Profile</span>
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Skip Logic: Only if not consultant and not requesting paid visibility? 
                         Actually info_file says "Consultant... verification queue", "Paid visibility... verification flow".
                         Maybe skip is only for basic agents not wanting paid work?
                         For now, I'll keep skip but maybe hide it if Paid Visibility is checked.
                     */}
                    {!isPaidVisibilityRequested && role !== 'consultant' && (
                        <button
                            onClick={() => {
                                setAssessmentSkipped(true);
                                router.push('/dashboard');
                            }}
                            className="text-slate-400 font-bold hover:text-text-main text-xs uppercase tracking-widest mr-4"
                        >
                            Skip Assessment
                        </button>
                    )}

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                        {selectedSkills.length} skills selected
                    </p>

                    <button
                        onClick={handleNext}
                        className={`w-full sm:w-48 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all font-display ${selectedSkills.length >= 1
                            ? 'bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        Proceed to Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};
