'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';

export const OutcomeStep: React.FC = () => {
    const { quizResult, role, resetOnboarding, isPaidVisibilityRequested } = useOnboardingStore();
    const { updateUser } = useAuthStore();
    const router = useRouter();

    const handleEnterDashboard = async () => {
        try {
            await apiClient.patch('/users/complete-onboarding');
        } catch (err) {
            console.warn('Failed to complete onboarding on backend:', err);
        }
        updateUser({ isOnboarded: true, isQuizPassed: Boolean(quizResult && (quizResult.percentage ? quizResult.percentage >= 50 : quizResult.score >= 50)) });
        const targetRole = role;
        resetOnboarding();
        if (targetRole === 'agent') {
            router.push('/dashboard/agent');
        } else if (targetRole === 'account-manager' || targetRole === 'account_manager') {
            router.push('/dashboard/account-manager');
        } else if (targetRole === 'consultant') {
            router.push('/dashboard/consultant');
        } else {
            router.push('/dashboard');
        }
    };

    if (!quizResult) return null;

    const isPendingVerification = role === 'consultant' || isPaidVisibilityRequested;
    const percentage = typeof quizResult.percentage === 'number'
        ? quizResult.percentage
        : quizResult.maxScore
            ? Math.round((quizResult.score / quizResult.maxScore) * 100)
            : quizResult.score;
    const isFailure = quizResult.band ? quizResult.band === 'Fail' : percentage < 85;
    const roleName = role?.replace('-', ' ') ?? 'Affiliate';

    /* ─── FAILURE STATE ─────────────────────────────────────── */
    if (isFailure) {
        return (
            <div className="max-w-2xl mx-auto py-2 md:py-6 px-1 sm:px-0 w-full">

                {/* Hero failure card */}
                <div className="bg-white rounded-2xl md:rounded-3xl border border-red-100 shadow-sm overflow-hidden mb-3 md:mb-4">
                    {/* Top colour bar */}
                    <div className="h-1 bg-red-500 w-full" />

                    <div className="px-5 pt-5 pb-4 md:px-8 md:pt-8 md:pb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
                        {/* Score ring */}
                        <div className="relative shrink-0 size-24 md:size-28">
                            <svg className="size-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" stroke="#fee2e2" />
                                <circle
                                    cx="50" cy="50" r="42" fill="none" strokeWidth="8" stroke="#ef4444"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 42}`}
                                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl md:text-3xl font-bold font-display text-red-500 leading-none">{percentage}%</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Score</span>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="flex-1 text-center sm:text-left">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                                <span className="material-symbols-outlined text-sm">cancel</span>
                                Not Passed
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold font-display text-text-main mb-1 leading-tight">
                                Keep going — you're nearly there
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                                You scored <span className="font-bold text-red-500">{percentage}%</span>. The pass mark is <span className="font-bold">85%</span>. Review the materials below and come back when you're ready.
                            </p>
                        </div>
                    </div>

                    {/* Performance breakdown */}
                    <div className="px-5 pb-4 md:px-8 md:pb-6 grid grid-cols-3 gap-2 md:gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center text-center border border-slate-100">
                            <span className="material-symbols-outlined text-slate-400 text-base mb-1">score</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-display">Your Score</span>
                            <span className="text-base md:text-lg font-bold text-text-main font-display">{percentage}%</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center text-center border border-slate-100">
                            <span className="material-symbols-outlined text-slate-400 text-base mb-1">target</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-display">Pass Mark</span>
                            <span className="text-base md:text-lg font-bold text-text-main font-display">85%</span>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 flex flex-col items-center text-center border border-red-100">
                            <span className="material-symbols-outlined text-red-400 text-base mb-1">trending_up</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 font-display">Gap</span>
                            <span className="text-base md:text-lg font-bold text-red-500 font-display">+{Math.max(0, 85 - percentage)}%</span>
                        </div>
                    </div>
                </div>

                {/* What to do next */}
                <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">
                    <div className="px-5 pt-4 pb-3 md:px-7 md:pt-5 border-b border-slate-50">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-display">What to do next</h2>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {[
                            {
                                step: '1',
                                icon: 'school',
                                title: 'Go to the Learning Dashboard',
                                desc: 'Training modules and guides built for affiliates.',
                                href: '/learning',
                            },
                            {
                                step: '2',
                                icon: 'menu_book',
                                title: 'Review the key topic areas',
                                desc: 'GDPR compliance, lead generation rules, escalation procedures.',
                                href: '/learning',
                            },
                            {
                                step: '3',
                                icon: 'replay',
                                title: 'Retake when you\'re ready',
                                desc: 'The quiz resets automatically. No waiting period.',
                                href: null,
                            },
                        ].map((item) => (
                            <div key={item.step} className="flex items-center gap-3 px-5 py-3.5 md:px-7">
                                <span className="size-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold font-display flex items-center justify-center shrink-0">
                                    {item.step}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-text-main font-display leading-tight">{item.title}</p>
                                    <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                                </div>
                                {item.href && (
                                    <Link href={item.href} className="shrink-0 flex items-center justify-center hover:opacity-70 transition-opacity">
                                        <span className="material-symbols-outlined text-primary text-base">arrow_forward</span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTAs */}
                <Link
                    href="/learning"
                    className="w-full h-11 md:h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-md mb-2"
                >
                    <span className="material-symbols-outlined text-base">school</span>
                    Go to Learning Dashboard
                </Link>
                <button
                    onClick={handleEnterDashboard}
                    className="w-full h-10 bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs"
                >
                    Skip for now — go to dashboard
                </button>
                <p className="text-center text-[10px] text-slate-400 font-medium mt-2.5">
                    Your progress is saved. You can retake from your dashboard.
                </p>
            </div>
        );
    }

    /* ─── PASS / PENDING STATE ──────────────────────────────── */
    return (
        <div className="max-w-2xl mx-auto py-2 md:py-6 px-1 sm:px-0 w-full">

            {/* Hero pass card */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-emerald-100 shadow-sm overflow-hidden mb-3 md:mb-4">
                <div className="h-1.5 w-full bg-emerald-500" />

                <div className="px-5 pt-6 pb-5 md:px-8 md:pt-8 md:pb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
                    {/* Score ring */}
                    <div className="relative shrink-0 size-24 md:size-28">
                        <svg className="size-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" stroke="#d1fae5" />
                            <circle
                                cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                                stroke="#10b981"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl md:text-3xl font-bold font-display leading-none text-emerald-600">
                                {percentage}%
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Score</span>
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="material-symbols-outlined text-sm text-emerald-600">
                                {isPendingVerification ? 'check_circle' : 'verified'}
                            </span>
                            <span>{isPendingVerification ? 'Assessment Passed • In Review' : 'Assessment Passed'}</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold font-display text-text-main mb-1.5 leading-tight">
                            {isPendingVerification ? 'Assessment Complete!' : 'Certification Achieved!'}
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                            {isPendingVerification
                                ? `Outstanding! You scored ${percentage}%. Your ${isPaidVisibilityRequested ? 'Paid Visibility request' : 'profile'} is now being finalized by our team.`
                                : `Congratulations! You passed the ${roleName} assessment with ${percentage}%. Your verified badge is now active.`
                            }
                        </p>
                    </div>
                </div>

                {/* Performance metric chips */}
                <div className="px-5 pb-5 md:px-8 md:pb-6 grid grid-cols-3 gap-2 md:gap-3">
                    <div className="rounded-xl p-3 flex flex-col items-center text-center bg-emerald-50/60 border border-emerald-100/80">
                        <span className="material-symbols-outlined text-base mb-1 text-emerald-600">score</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-display">Your Score</span>
                        <span className="text-base md:text-lg font-bold text-emerald-700 font-display mt-0.5">{percentage}%</span>
                    </div>
                    <div className="rounded-xl p-3 flex flex-col items-center text-center bg-emerald-50/60 border border-emerald-100/80">
                        <span className="material-symbols-outlined text-base mb-1 text-emerald-600">speed</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-display">Speed</span>
                        <span className="text-base md:text-lg font-bold text-text-main font-display mt-0.5">95%</span>
                    </div>
                    <div className="rounded-xl p-3 flex flex-col items-center text-center bg-emerald-50/60 border border-emerald-100/80">
                        <span className="material-symbols-outlined text-base mb-1 text-emerald-600">analytics</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-display">Strategy</span>
                        <span className="text-base md:text-lg font-bold text-text-main font-display mt-0.5">92%</span>
                    </div>
                </div>
            </div>

            {/* Status & Unlocked Benefits Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">
                <div className="px-5 py-3.5 md:px-7 md:py-4 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-display">
                        {isPendingVerification ? 'Profile Status' : 'Unlocked Features'}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-display">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {isPendingVerification ? 'Under Short Review' : 'All Active'}
                    </span>
                </div>

                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                            {
                                icon: 'dashboard',
                                label: 'Affiliate Dashboard Access',
                                desc: 'Full tools to manage leads and payouts',
                            },
                            {
                                icon: 'link',
                                label: 'Custom Referral Links',
                                desc: 'Tracked attribution across all campaigns',
                            },
                            {
                                icon: 'payments',
                                label: 'Commission Payouts',
                                desc: 'Direct automated reward disbursements',
                            },
                            {
                                icon: 'verified',
                                label: isPendingVerification ? 'Verified Badge (Pending)' : 'Verified Badge (Active)',
                                desc: isPendingVerification ? 'Activates upon quick review (24-48h)' : 'Displayed on public marketplace profile',
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                                <div className="size-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-emerald-600 text-base">{item.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-text-main font-display leading-tight">{item.label}</p>
                                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTAs */}
            <button
                onClick={handleEnterDashboard}
                className="w-full h-11 md:h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-600/20 active:scale-[0.99] mb-2"
            >
                <span>Enter My Dashboard</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <Link
                href="/learning"
                className="w-full h-10 bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs"
            >
                <span className="material-symbols-outlined text-base">school</span>
                <span>Explore Training Library</span>
            </Link>

            <p className="text-center text-[10px] text-slate-400 font-medium mt-3">
                {isPendingVerification
                    ? 'Your application is safely saved. You can monitor verification progress in your dashboard.'
                    : 'Your verified status is active and visible on your public affiliate profile.'
                }
            </p>
        </div>
    );
};
