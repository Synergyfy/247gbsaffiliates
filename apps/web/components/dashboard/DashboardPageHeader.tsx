"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import Link from 'next/link';

const stepsInfo: Record<string, { num: number; name: string; pct: number }> = {
    'basic-info': { num: 1, name: 'Basic Info', pct: 20 },
    'profile-info': { num: 2, name: 'Professional Profile', pct: 40 },
    'questionnaire': { num: 3, name: 'Skills & Preferences', pct: 60 },
    'quiz': { num: 4, name: 'Assessment Quiz', pct: 80 },
    'outcome': { num: 5, name: 'Certification', pct: 100 },
};

export const DashboardPageHeader = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const { currentStep, assessmentSkipped } = useOnboardingStore();

    const isSkipped = Boolean(assessmentSkipped || user?.assessmentSkipped);
    const isOnboarded = Boolean(user?.isOnboarded) && !isSkipped;
    const activeStepInfo = stepsInfo[currentStep] || { num: 1, name: 'Basic Info', pct: 20 };
    const isAwaitingVerification =
        user?.verificationStatus === 'pending' && Boolean(user?.verificationSubmission);
    const isRejected = user?.verificationStatus === 'rejected';
    const stillNeedsOnboardingSteps = Boolean(
        !user?.verificationSubmission ||
        !user?.isQuizPassed ||
        (user?.role === 'agent' && !user?.skills?.length)
    );

    // Standard title when onboarded
    const getPageTitle = () => {
        const parts = pathname.split('/').filter(p => p !== '');
        if (parts.length < 2) return 'Dashboard';
        const relevantParts = parts.slice(1);
        return relevantParts.map(part => {
            return part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }).join(' / ');
    };

    // Verification is a separate wait state. Do not send fully-submitted users
    // back to "Step 1 of 5" just because an administrator has not reviewed them yet.
    if (!isOnboarded && (isAwaitingVerification || isRejected) && !stillNeedsOnboardingSteps) {
        const rejected = isRejected;
        const workspaceBase = pathname.startsWith('/dashboard/agent')
            ? '/dashboard/agent'
            : pathname.startsWith('/dashboard/consultant')
                ? '/dashboard/consultant'
                : '/dashboard/account-manager';
        return (
            <div className={`sticky top-0 z-20 border-b font-display ${rejected ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 md:px-8 sm:py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className={`material-symbols-outlined text-xl ${rejected ? 'text-red-700' : 'text-amber-700'}`}>
                            {rejected ? 'report' : 'hourglass_top'}
                        </span>
                        <div className="min-w-0">
                            <h3 className={`text-xs font-bold sm:text-sm ${rejected ? 'text-red-950' : 'text-amber-950'}`}>
                                {rejected ? 'Verification needs attention' : 'Verification under review'}
                            </h3>
                            <p className={`text-[11px] ${rejected ? 'text-red-800' : 'text-amber-800'}`}>
                                {rejected
                                    ? user?.verificationNotes || 'Update your profile and identity document, then resubmit for review.'
                                    : 'Your profile and identity document are with an administrator. No action is needed right now.'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={rejected ? '/onboarding?edit-profile=1' : `${workspaceBase}/settings`}
                        className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white ${rejected ? 'bg-red-700 hover:bg-red-800' : 'bg-amber-700 hover:bg-amber-800'}`}
                    >
                        {rejected ? 'Update submission' : 'View account'}
                    </Link>
                </div>
            </div>
        );
    }

    // If onboarding is incomplete, replace duplicated top bar with Onboarding Progress Banner
    if (!isOnboarded) {
        return (
            <div className="bg-white border-b border-primary/15 shadow-xs sticky top-0 z-20 font-display">
                <div className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                    {/* Left: Progress ring + Status text */}
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Mini Circular Progress */}
                        <div className="relative size-9 sm:size-10 shrink-0">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                <circle
                                    className="text-primary/15"
                                    cx="18" cy="18" r="14"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                />
                                <circle
                                    className="text-primary transition-all duration-700 ease-out"
                                    cx="18" cy="18" r="14"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                    strokeDasharray="88"
                                    strokeDashoffset={`${88 - (88 * activeStepInfo.pct) / 100}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-primary leading-none">
                                    {activeStepInfo.pct}%
                                </span>
                            </div>
                        </div>

                        {/* Banner Copy */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs sm:text-sm font-bold text-text-main truncate">
                                    Finish Setting Up Your Profile
                                </h3>
                                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                    Step {activeStepInfo.num} of 5
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                                Current step: <span className="font-semibold text-slate-700">{activeStepInfo.name}</span> • Complete onboarding to unlock paid micro-tasks and verified badge.
                            </p>
                        </div>
                    </div>

                    {/* Right: Return CTA button */}
                    <div className="flex items-center shrink-0 ml-auto">
                        <Link
                            href="/onboarding"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
                        >
                            <span>Resume Setup</span>
                            <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Default header when user has already completed onboarding
    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20 font-display">
            <h1 className="text-lg font-bold text-text-main">{getPageTitle()}</h1>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="text-slate-400 hover:text-primary transition-colors relative size-8 rounded-lg hover:bg-slate-50 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-xl">notifications</span>
                    <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};
