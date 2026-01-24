'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AssessmentModal } from '@/components/onboarding/AssessmentModal';

export const OutcomeStep: React.FC = () => {
    const { quizResult, role, resetOnboarding, isPaidVisibilityRequested } = useOnboardingStore();
    const [showModal, setShowModal] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        if (quizResult) {
            setShowModal(true);
        }
    }, [quizResult]);

    if (!quizResult) return null;

    const isPendingVerification = role === 'consultant' || isPaidVisibilityRequested;
    const isFailure = quizResult.score < 50;

    // Redirect logic for failure handled by Modal Link, but we can also auto-redirect if needed.
    // For now, let the modal drive the user choice.

    return (
        <div className="max-w-3xl mx-auto py-8">
            <AssessmentModal
                isOpen={showModal}
                type={isFailure ? 'failure' : 'success'}
                score={quizResult.score}
                role={role || ''}
                onClose={() => setShowModal(false)}
            />

            {/* Background Content (Blurred or hidden behind modal potentially, but keeping visible based on user req for 'normal modal') */}
            {/* Check if failed, if so render a placeholder or the learning dashboard prompt directly?
                User asked for redirection to learning dashboard.
                I'll render a simplified view behind the modal if failed.
            */}

            <div className={`rounded-4xl shadow-2xl border overflow-hidden ${isPendingVerification ? 'bg-amber-50 border-amber-100 shadow-amber-500/5' : 'bg-white border-gray-100 shadow-text-main/5'} ${isFailure ? 'opacity-50 grayscale' : ''}`}>
                {/* Keep existing UI logic for background context */}
                <div className={`p-8 lg:p-12 text-center border-b relative ${isPendingVerification ? 'bg-amber-50 border-amber-100' : 'bg-white border-gray-50'}`}>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-10">
                        {/* Score Gauge */}
                        <div className="relative size-48 md:size-56 shrink-0">
                            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                <circle className={`${isPendingVerification ? 'text-amber-200' : 'text-gray-100'}`} cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="7"></circle>
                                <circle
                                    className={`${isPendingVerification ? 'text-amber-500' : 'text-primary'} transition-all duration-1000 ease-out`}
                                    cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="7"
                                    strokeDasharray="282.7"
                                    strokeDashoffset={282.7 - (282.7 * quizResult.score) / 100}
                                    strokeLinecap="round"
                                ></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-5xl font-bold leading-none font-display ${isPendingVerification ? 'text-amber-900' : 'text-text-main'}`}>{quizResult.score}%</span>
                                <span className={`text-xs font-bold tracking-widest uppercase mt-2 font-display ${isPendingVerification ? 'text-amber-600' : 'text-primary'}`}>Score</span>
                            </div>
                        </div>

                        {/* Badge UI - Only show if passed or pending */}
                        {!isFailure && (
                            <div className="flex flex-col items-center gap-4">
                                <div className={`size-40 rounded-full flex items-center justify-center p-4 ${isPendingVerification ? 'bg-amber-100' : 'bg-primary/10'}`}>
                                    <div className={`size-32 flex flex-col items-center justify-center text-white shadow-xl ${isPendingVerification ? 'bg-amber-500 shadow-amber-500/30' : 'bg-primary shadow-primary/30'}`} style={{ clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)' }}>
                                        <span className="material-symbols-outlined text-4xl mb-1">{isPendingVerification ? 'pending_actions' : 'verified'}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest font-display">{isPendingVerification ? 'Pending' : 'Verified'}</span>
                                        <span className="text-xs font-bold uppercase tracking-widest font-display">{role}</span>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 border rounded-full ${isPendingVerification ? 'bg-amber-100 border-amber-200' : 'bg-primary/5 border-primary/20'}`}>
                                    <span className={`text-sm font-bold ${isPendingVerification ? 'text-amber-700' : 'text-primary'}`}>
                                        {isPendingVerification ? 'Verification In Review' : 'Official Certification'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {isFailure && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-40 rounded-full flex items-center justify-center p-4 bg-red-50">
                                    <div className="size-32 flex flex-col items-center justify-center text-white shadow-xl bg-red-400 shadow-red-500/30" style={{ clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)' }}>
                                        <span className="material-symbols-outlined text-4xl mb-1">warning</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest font-display">Failed</span>
                                    </div>
                                </div>
                                <div className="px-4 py-1.5 border rounded-full bg-red-50 border-red-100">
                                    <span className="text-sm font-bold text-red-500">Assessment Failed</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="max-w-xl mx-auto">
                        <h1 className={`text-4xl font-bold mb-4 font-display ${isPendingVerification ? 'text-amber-900' : 'text-text-main'}`}>
                            {isFailure
                                ? 'Assessment Failed'
                                : isPendingVerification ? 'Assessment Completed' : 'Certification Achieved'}
                        </h1>
                        <p className={`text-lg leading-relaxed ${isPendingVerification ? 'text-amber-800/80' : 'text-text-secondary'}`}>
                            {isFailure
                                ? <span>Unfortunately, you did not pass this assessment. Please review the training materials and try again.</span>
                                : isPendingVerification
                                    ? <span>Your profile is now <span className="font-bold">Pending Verification</span>. We are reviewing your details and quiz results to approve your {isPaidVisibilityRequested ? 'Paid Visibility request' : 'Consultant status'}.</span>
                                    : <span>Excellent work! You have successfully passed the competency test and earned your <span className="text-text-main font-bold">Verified {role?.replace('-', ' ')}</span> badge.</span>
                            }
                        </p>
                    </div>
                </div>

                <div className={`p-8 lg:px-12 ${isPendingVerification ? 'bg-amber-50/50' : 'bg-slate-50/50'}`}>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 text-center font-display">Competency Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
                        {/* Speed Index */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">speed</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">Speed Index</span>
                            <span className="text-xl font-bold text-text-main font-display">95%</span>
                        </div>
                        {/* Accuracy */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">verified_user</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">Accuracy</span>
                            <span className="text-xl font-bold text-text-main font-display">{quizResult.score}%</span>
                        </div>
                        {/* Strategy */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">analytics</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">Strategy</span>
                            <span className="text-xl font-bold text-text-main font-display">92%</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 lg:p-12 text-center flex flex-col items-center gap-6">
                    <div className="w-full max-w-md">
                        <Link
                            href="/dashboard"
                            onClick={resetOnboarding}
                            className={`w-full h-16 text-white text-lg font-bold rounded-2xl hover:brightness-105 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 font-display tracking-widest ${isPendingVerification ? 'bg-amber-500 shadow-amber-500/25' : 'bg-primary shadow-primary/25'}`}
                        >
                            Enter My Dashboard
                            <span className="material-symbols-outlined font-bold">dashboard</span>
                        </Link>
                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Dashboard Access Enabled</p>
                    </div>
                    {!isPendingVerification && (
                        <div className="w-full max-w-md border-t border-slate-100 pt-6">
                            <p className="text-sm text-text-secondary mb-4 font-medium">Want to improve your scores further?</p>
                            <a className="inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest hover:underline font-display" href="#">
                                <span className="material-symbols-outlined text-lg">school</span>
                                Explore Training Library
                            </a>
                        </div>
                    )}
                </div>
            </div>
            <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                {isPendingVerification ? 'Your pending badge is visible to admins only.' : 'Your badge is now visible on your public profile.'}
            </p>
        </div>
    );
};
