'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface OnboardingLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    hideSkipToDashboard?: boolean;
}

const steps = [
    { id: 'basic-info', label: 'Basic Info' },
    { id: 'profile-info', label: 'Professional Profile' },
    { id: 'questionnaire', label: 'Expertise' },
    { id: 'quiz', label: 'Assessment' },
    { id: 'outcome', label: 'Certification' },
];

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children, hideSkipToDashboard = false }) => {
    const { currentStep, role: onboardingRole, setAssessmentSkipped } = useOnboardingStore();
    const { user, updateUser } = useAuthStore();
    const router = useRouter();

    // Prefer the authenticated user's role: the persisted onboarding store can
    // still hold the previous account's role until it re-syncs.
    const role = user?.role || onboardingRole;
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    const handleSkipToDashboard = () => {
        setAssessmentSkipped(true);
        updateUser({ assessmentSkipped: true, isOnboarded: false });
        const normalized = (role || '').toLowerCase().replace(/_/g, '-');
        if (normalized === 'agent') router.push('/dashboard/agent');
        else if (normalized === 'account-manager') router.push('/dashboard/account-manager');
        else if (normalized === 'consultant') router.push('/dashboard/consultant');
        else if (normalized === 'admin') router.push('/dashboard/admin');
        else router.push('/dashboard');
    };

    return (
        <div className="bg-[#F9FAFB] min-h-screen flex flex-col font-body text-text-main overflow-x-hidden">
            <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 pt-2.5 pb-3.5 md:py-6 px-3 md:px-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-1.5 md:mb-2 gap-2">
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <div className="flex items-center gap-1.5 md:gap-2 text-primary">
                                <div className="size-6 md:size-8">
                                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <h2 className="text-text-main text-base md:text-2xl font-bold font-display tracking-tight">247gbs affiliate</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {role && (
                                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                                    <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                        {role.replace('-', ' ')} Onboarding
                                    </span>
                                </div>
                            )}
                            {currentStep !== 'basic-info' && !hideSkipToDashboard && (
                                <button
                                    type="button"
                                    onClick={handleSkipToDashboard}
                                    className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold text-primary hover:text-primary-dark transition-colors font-display shrink-0 py-1 px-2 rounded-lg hover:bg-primary/5"
                                >
                                    <span>Skip to Dashboard</span>
                                    <span className="material-symbols-outlined text-xs md:text-sm">arrow_forward</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Timeline with Consistent Visible Connecting Line */}
                    <div className="mt-4 md:mt-10 max-w-4xl mx-auto relative px-1 md:px-4">
                        {/* Connecting Line positioned exactly through button centers */}
                        <div className="absolute left-5 right-5 md:left-8 md:right-8 top-3.5 md:top-5 -translate-y-1/2 h-0.5 bg-slate-200 z-0">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                            />
                        </div>

                        {/* Stepper Buttons */}
                        <div className="flex items-start justify-between relative z-10 w-full">
                            {steps.map((step, index) => {
                                const isActive = index === currentStepIndex;
                                const isCompleted = index < currentStepIndex;

                                return (
                                    <div key={step.id} className="flex flex-col items-center text-center">
                                        <div className={`size-7 md:size-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                            ? 'bg-primary text-white shadow-xs'
                                            : isActive
                                                ? 'bg-primary text-white ring-2 md:ring-4 ring-primary/20 shadow-md shadow-primary/25 scale-105 md:scale-110'
                                                : 'bg-white border border-slate-200 text-slate-400'
                                            }`}>
                                            {isCompleted ? (
                                                <>
                                                    {/* Mobile: clean reduced number icon */}
                                                    <span className="md:hidden text-[10px] font-bold font-display leading-none select-none">{index + 1}</span>
                                                    {/* Desktop: crisp vector checkmark */}
                                                    <svg className="hidden md:block size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </>
                                            ) : (
                                                <span className="text-[10px] md:text-sm font-bold font-display leading-none select-none">{index + 1}</span>
                                            )}
                                        </div>
                                        {/* Labels removed on mobile, preserved on desktop */}
                                        <span className={`hidden md:block text-[10px] font-bold mt-3 uppercase tracking-wider transition-colors duration-500 ${isActive ? 'text-primary' : isCompleted ? 'text-text-main/70' : 'text-slate-400'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-1.5 pb-4 md:py-16 px-2.5 sm:px-4 w-full">
                {children}
            </main>

            <footer className="py-4 md:py-10 border-t border-slate-100 bg-white mt-auto">
                <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-tight font-display italic text-center md:text-left">© {new Date().getFullYear()} 247gbs affiliate professional marketplace</p>
                    <div className="flex gap-4 md:gap-8 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest justify-center">
                        <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                        <a className="hover:text-primary transition-colors" href="#">Help Center</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
