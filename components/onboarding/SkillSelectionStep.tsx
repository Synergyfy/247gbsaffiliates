'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';

export const SkillSelectionStep: React.FC = () => {
    const { selectedSkills, toggleSkill, setStep, setAssessmentSkipped } = useOnboardingStore();
    const [searchQuery, setSearchQuery] = React.useState('');
    const router = useRouter();

    const { data: skills, isLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: mockApi.getSkills,
    });

    const filteredSkills = skills?.filter(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    Expertise Selection
                </span>
                <h1 className="text-3xl font-display font-bold text-text-main mb-3">Pick your top skills</h1>
                <p className="text-slate-500 max-w-lg mx-auto">
                    This helps us match you with the most relevant opportunities in our professional marketplace.
                </p>
            </div>

            <div className="mb-8 relative max-w-md mx-auto">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                    type="text"
                    placeholder="Search skills..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {filteredSkills?.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                        <button
                            key={skill.id}
                            onClick={() => toggleSkill(skill.id)}
                            className={`px-5 py-2.5 rounded-xl border-2 font-bold transition-all cursor-pointer flex items-center gap-2 font-display text-sm ${isSelected
                                ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                                : 'border-slate-50 bg-white text-slate-500 hover:border-primary/30'
                                }`}
                        >
                            {isSelected ? (
                                <span className="material-symbols-outlined text-[18px]">check</span>
                            ) : (
                                <span className="material-symbols-outlined text-[18px] text-slate-300">add</span>
                            )}
                            <span>{skill.name}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
                <button
                    onClick={() => setStep('profile-info')}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-text-main transition-colors font-display text-sm group"
                >
                    <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
                    <span>Career Details</span>
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            setAssessmentSkipped(true);
                            router.push('/dashboard');
                        }}
                        className="text-slate-400 font-bold hover:text-text-main text-xs uppercase tracking-widest mr-4"
                    >
                        Skip Assessment
                    </button>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedSkills.length} selected</p>
                    <button
                        disabled={selectedSkills.length < 1}
                        onClick={() => setStep('quiz')}
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
