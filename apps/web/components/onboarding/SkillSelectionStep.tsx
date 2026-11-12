'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
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
    const [showPaidInfo, setShowPaidInfo] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { data: skills, isLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: async () => {
            const response = await apiClient.get('/skills');
            return response.data as { id: string; name: string }[];
        },
    });

    const filteredSkills = skills?.filter((skill: { name: string }) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const normalizedRole = (role || '').toLowerCase().replace(/_/g, '-');
    const isAgent = normalizedRole === 'agent' || !normalizedRole;

    // Skills are only required for Agents. Account Managers and Consultants skip to Quiz.
    useEffect(() => {
        if (!isAgent) {
            setStep('quiz');
        }
    }, [isAgent, setStep]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddSkill = (nameOrId: string) => {
        const trimmed = nameOrId.trim();
        if (!trimmed) return;
        if (selectedSkills.includes(trimmed)) {
            toast.info("Skill already selected.");
            return;
        }
        if (selectedSkills.length >= 3) {
            toast.warning("Please select only up to 3 top skills.");
            return;
        }
        toggleSkill(trimmed);
        setSearchQuery('');
        setDropdownOpen(false);
    };

    const handleRemoveSkill = (skillId: string) => {
        toggleSkill(skillId);
    };

    const handleNext = async () => {
        if (selectedSkills.length < 1) {
            toast.error("Please select at least 1 skill.");
            return;
        }
        try {
            const skillNames = selectedSkills.map(
                (id) => skills?.find((s: { id: string; name: string }) => s.id === id)?.name || id
            );
            await apiClient.patch('/users/skills', { skills: skillNames });
        } catch (err) {
            console.warn('Could not save skills to API:', err);
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
        <div className="max-w-3xl mx-auto py-2 md:py-4 w-full px-1 sm:px-0">
            <div className="text-center mb-2 md:mb-10">
                <span className="hidden md:inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                    Expertise & Preferences
                </span>
                <h1 className="text-base sm:text-lg md:text-3xl font-display font-bold text-text-main mb-0.5 md:mb-3">Skill Assessment</h1>
                <p className="text-[11px] md:text-sm text-slate-500 max-w-xs sm:max-w-md mx-auto leading-normal">
                    Select your top 2-3 skills and tell us how you work.
                </p>
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-4xl border border-slate-100 shadow-sm mb-4 md:mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm md:text-lg font-bold text-text-main font-display">1. Top Skills (Max 3) <span className="text-red-600" aria-hidden="true">*</span></h3>
                    <span className="text-[10px] md:text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full font-display">
                        {selectedSkills.length}/3 selected
                    </span>
                </div>

                {/* Skill search input with dropdown */}
                <div className="mb-3 relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base md:text-lg pointer-events-none">search</span>
                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">expand_more</span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search or type a skill…"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-xs md:text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setDropdownOpen(e.target.value.trim().length > 0);
                                }}
                                onFocus={() => {
                                    if (searchQuery.trim().length > 0) setDropdownOpen(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // If there's an exact match in the filtered list, use it; otherwise add as custom
                                        const exact = filteredSkills?.find(
                                            s => s.name.toLowerCase() === searchQuery.trim().toLowerCase()
                                        );
                                        handleAddSkill(exact ? exact.id : searchQuery);
                                    }
                                    if (e.key === 'Escape') setDropdownOpen(false);
                                }}
                                autoComplete="off"
                            />

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto"
                                >
                                    {filteredSkills && filteredSkills.filter(
                                        s => !selectedSkills.includes(s.id) && !selectedSkills.includes(s.name)
                                    ).length > 0 ? (
                                        filteredSkills
                                            .filter(s => !selectedSkills.includes(s.id) && !selectedSkills.includes(s.name))
                                            .map((skill: { id: string; name: string }) => (
                                                <button
                                                    key={skill.id}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); // prevent input blur before click
                                                        handleAddSkill(skill.id);
                                                    }}
                                                    disabled={selectedSkills.length >= 3}
                                                    className="w-full text-left px-3.5 py-2.5 text-xs md:text-sm text-slate-700 hover:bg-primary/5 hover:text-primary font-medium transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed border-b border-slate-50 last:border-0"
                                                >
                                                    <span className="material-symbols-outlined text-[13px] text-slate-400">add</span>
                                                    {skill.name}
                                                </button>
                                            ))
                                    ) : null}

                                    {/* Custom add option — shown when typed text doesn't exactly match any skill */}
                                    {searchQuery.trim() && !filteredSkills?.some(
                                        s => s.name.toLowerCase() === searchQuery.trim().toLowerCase()
                                    ) && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleAddSkill(searchQuery);
                                            }}
                                            disabled={selectedSkills.length >= 3}
                                            className="w-full text-left px-3.5 py-2.5 text-xs md:text-sm text-primary font-bold hover:bg-primary/5 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[13px]">add_circle</span>
                                            Add &ldquo;{searchQuery.trim()}&rdquo;
                                        </button>
                                    )}

                                    {/* Empty state */}
                                    {filteredSkills?.filter(
                                        s => !selectedSkills.includes(s.id) && !selectedSkills.includes(s.name)
                                    ).length === 0 && !searchQuery.trim() && (
                                        <p className="px-3.5 py-3 text-xs text-slate-400 text-center">Start typing to search skills…</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* + button: adds the typed value as custom skill */}
                        {searchQuery.trim() && (
                            <button
                                type="button"
                                onClick={() => handleAddSkill(searchQuery)}
                                disabled={selectedSkills.length >= 3}
                                aria-label="Add skill"
                                className="size-9 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shrink-0 flex items-center justify-center font-display disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                            </button>
                        )}
                    </div>

                    {/* Selected skill chips — below the input */}
                    {selectedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {selectedSkills.map((id) => {
                                const displayName = skills?.find((s: { id: string; name: string }) => s.id === id)?.name || id;
                                return (
                                    <span
                                        key={id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-bold shadow-sm font-display"
                                    >
                                        <span>{displayName}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(id)}
                                            aria-label={`Remove ${displayName}`}
                                            className="hover:bg-white/20 rounded-full size-4 flex items-center justify-center transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xs leading-none">close</span>
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="w-full border-t border-slate-50 my-4 md:my-6"></div>

                <h3 className="text-sm md:text-lg font-bold text-text-main mb-3 md:mb-6 font-display">2. Work Preferences</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-3 md:mb-6">
                    <div className="space-y-1 md:space-y-2">
                        <label className="text-xs md:text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Years of Experience <span className="text-red-600" aria-hidden="true">*</span></label>
                        <div className="relative">
                            <select
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 md:py-4 md:px-4 text-xs md:text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none pr-8"
                                value={questionnaireAnswers.yearsExperience || ''}
                                onChange={(e) => updateQuestionnaireAnswers({ yearsExperience: e.target.value })}
                            >
                                <option value="">Select experience...</option>
                                <option value="0-1">0-1 Years</option>
                                <option value="1-3">1-3 Years</option>
                                <option value="3-5">3-5 Years</option>
                                <option value="5+">5+ Years</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">expand_more</span>
                        </div>
                    </div>

                    {normalizedRole === 'account-manager' && (
                        <div className="space-y-1 md:space-y-2">
                            <label className="text-xs md:text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Team Leadership Exp</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 md:py-4 md:px-4 text-xs md:text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none pr-8"
                                    value={questionnaireAnswers.teamLeadershipExp || ''}
                                    onChange={(e) => updateQuestionnaireAnswers({ teamLeadershipExp: e.target.value })}
                                >
                                    <option value="">Select experience...</option>
                                    <option value="none">None</option>
                                    <option value="1-5">Managed 1-5 People</option>
                                    <option value="5-10">Managed 5-10 People</option>
                                    <option value="10+">Managed 10+ People</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    )}
                </div>

                {role === 'account-manager' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-3 md:mb-6">
                        <div className="space-y-1 md:space-y-2">
                            <label className="text-xs md:text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Campaign Budget Capacity</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 md:py-4 md:px-4 text-xs md:text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none pr-8"
                                    value={questionnaireAnswers.campaignBudgetCapacity || ''}
                                    onChange={(e) => updateQuestionnaireAnswers({ campaignBudgetCapacity: e.target.value })}
                                >
                                    <option value="">Select budget capacity...</option>
                                    <option value="<1k">Less than £1k</option>
                                    <option value="1k-5k">£1k - £5k</option>
                                    <option value="5k-20k">£5k - £20k</option>
                                    <option value="20k+">£20k+</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <label className="text-xs md:text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">Availability Type</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 md:py-4 md:px-4 text-xs md:text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none pr-8"
                                    value={questionnaireAnswers.availabilityType || ''}
                                    onChange={(e) => updateQuestionnaireAnswers({ availabilityType: e.target.value })}
                                >
                                    <option value="">Select availability...</option>
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="project">Project-based</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2.5 md:space-y-4">
                    {role !== 'account-manager' && (
                        <label className="flex items-center gap-2.5 p-3 md:p-4 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input
                                type="checkbox"
                                className="w-4 h-4 md:w-5 md:h-5 rounded text-primary focus:ring-primary border-gray-300"
                                checked={questionnaireAnswers.acceptFixedPrice || false}
                                onChange={(e) => updateQuestionnaireAnswers({ acceptFixedPrice: e.target.checked })}
                            />
                            <span className="text-xs md:text-sm font-medium text-text-secondary">I accept fixed-price micro-tasks</span>
                        </label>
                    )}

                    {/* Paid Assignment Visibility with interactive tooltip info */}
                    <div className="border border-slate-100 rounded-xl p-3 md:p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between gap-2.5">
                            <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 md:w-5 md:h-5 rounded text-primary focus:ring-primary border-gray-300 shrink-0"
                                    checked={isPaidVisibilityRequested}
                                    onChange={(e) => setIsPaidVisibilityRequested(e.target.checked)}
                                />
                                <span className="text-xs md:text-sm font-medium text-text-secondary truncate">Apply for Paid Assignment Visibility</span>
                            </label>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowPaidInfo(prev => !prev);
                                }}
                                aria-label="More information about paid assignment visibility"
                                className="size-6 rounded-full hover:bg-slate-200/60 text-primary flex items-center justify-center shrink-0 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">help_outline</span>
                            </button>
                        </div>
                        {/* Tooltip description: toggled when user clicks the help icon */}
                        {showPaidInfo && (
                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] md:text-xs text-slate-600 leading-relaxed">
                                If approved, your profile will be shown to businesses hiring paid suppliers. Approval may require a short review.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation on the same horizontal line */}
            <div className="flex items-center justify-between gap-2.5 sm:gap-4 pt-2.5 md:pt-6 border-t border-slate-50 mt-3 md:mt-6">
                <button
                    type="button"
                    onClick={() => setStep('profile-info')}
                    aria-label="Back to Profile"
                    className="size-10 md:w-auto md:h-14 md:px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl font-bold flex items-center justify-center text-xs md:text-sm shrink-0 font-display transition-all shadow-sm"
                >
                    <span className="material-symbols-outlined text-base md:text-xl">arrow_back</span>
                    <span className="hidden md:inline ml-1.5">Back to Profile</span>
                </button>

                <div className="flex items-center gap-2 sm:gap-4 flex-1 sm:flex-none justify-end">
                    {!isPaidVisibilityRequested && normalizedRole !== 'consultant' && (
                        <button
                            type="button"
                            onClick={() => {
                                setAssessmentSkipped(true);
                                router.push('/dashboard');
                            }}
                            className="text-slate-400 hover:text-text-main text-xs font-bold uppercase tracking-wider px-2 py-1 shrink-0"
                        >
                            Skip
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={selectedSkills.length < 1}
                        className={`flex-1 sm:flex-none sm:min-w-[180px] h-10 md:h-14 px-3 md:px-8 rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm md:text-base shadow-sm md:shadow-md transition-all font-display flex items-center justify-center gap-1.5 md:gap-2 group ${
                            selectedSkills.length >= 1
                                ? 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark active:scale-[0.99]'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <span className="md:hidden">Proceed to Quiz</span>
                        <span className="hidden md:inline">Proceed to Quiz</span>
                        <span className="material-symbols-outlined text-base md:text-lg transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
