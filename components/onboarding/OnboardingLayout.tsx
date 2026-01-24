'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { UserRole } from '@/lib/mockApi';

interface OnboardingLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

const steps = [
    { id: 'basic-info', label: 'Basic Info' },
    { id: 'profile-info', label: 'Professional Profile' },
    { id: 'questionnaire', label: 'Expertise' },
    { id: 'quiz', label: 'Assessment' },
    { id: 'outcome', label: 'Certification' },
];

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
    const { currentStep, role } = useOnboardingStore();

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="bg-[#F9FAFB] min-h-screen flex flex-col font-body text-text-main">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-6 px-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">

                            <div className="flex items-center gap-2 text-primary">
                                <div className="size-8">
                                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <h2 className="text-text-main text-2xl font-bold font-display tracking-tight">247gbs affiliate</h2>
                            </div>
                        </div>
                        {role && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                                <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                    {role.replace('-', ' ')} Onboarding
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-10 flex items-center justify-between max-w-4xl mx-auto relative px-4">
                        {steps.map((step, index) => {
                            const isActive = index === currentStepIndex;
                            const isCompleted = index < currentStepIndex;

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center z-10">
                                        <div className={`size-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted
                                            ? 'bg-primary text-white scale-90'
                                            : isActive
                                                ? 'bg-primary border-4 border-white ring-4 ring-primary/10 text-white shadow-xl shadow-primary/20 scale-110'
                                                : 'bg-white border-2 border-slate-200 text-slate-400'
                                            }`}>
                                            {isCompleted ? (
                                                <span className="material-symbols-outlined text-xl">check</span>
                                            ) : (
                                                <span className="text-sm font-bold font-display">{index + 1}</span>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold mt-3 uppercase tracking-wider transition-colors duration-500 ${isActive ? 'text-primary' : isCompleted ? 'text-text-main/70' : 'text-slate-400'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`h-0.5 grow mx-2 md:mx-4 rounded-full transition-all duration-700 ${isCompleted ? 'bg-primary' : 'bg-slate-100'
                                            }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="flex-1 py-16 px-4">
                {children}
            </main>

            <footer className="py-10 border-t border-slate-100 bg-white mt-auto">
                <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-slate-400 font-medium tracking-tight font-display italic">© {new Date().getFullYear()} 247gbs affiliate professional marketplace</p>
                    <div className="flex gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                        <a className="hover:text-primary transition-colors" href="#">Help Center</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
