'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function CertificationPage() {
    const { quizResult, role, resetOnboarding, isPaidVisibilityRequested } = useOnboardingStore();
    const router = useRouter();

    React.useEffect(() => {
        if (!quizResult) {
            router.replace('/onboarding');
        }
    }, [quizResult, router]);

    if (!quizResult) return null;

    const isPendingVerification = role === 'consultant' || isPaidVisibilityRequested;
    const isFailure = quizResult.score < 50;
    const score = quizResult.score;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-display">
            <div className="mb-8">
                <BrandLogo />
            </div>

            <div className="bg-white max-w-2xl w-full rounded-4xl shadow-2xl overflow-hidden border border-slate-100 relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary via-purple-500 to-primary"></div>

                <div className={`p-12 text-center ${isFailure ? 'bg-slate-50' : 'bg-white'}`}>

                    <div className="flex justify-center mb-8">
                        {isFailure ? (
                            <div className="size-24 rounded-full bg-red-50 flex items-center justify-center border-4 border-red-100 text-red-500 shadow-xl shadow-red-500/10">
                                <span className="material-symbols-outlined text-5xl">warning</span>
                            </div>
                        ) : (
                            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 text-primary shadow-xl shadow-primary/20">
                                <span className="material-symbols-outlined text-5xl">{isPendingVerification ? 'pending_actions' : 'verified_user'}</span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-4 tracking-tight">
                        {isFailure ? 'Assessment Not Passed' : isPendingVerification ? 'Verification Pending' : 'Certified Professional'}
                    </h1>

                    <p className="text-text-secondary text-lg mb-8 leading-relaxed max-w-lg mx-auto">
                        {isFailure
                            ? `You scored ${score}%. To ensure quality on our marketplace, we require a passing score of 50%. Please review our training materials.`
                            : isPendingVerification
                                ? `You scored ${score}%. Your profile is under review for ${role?.replace('-', ' ')} status. You can access your dashboard while we verify your details.`
                                : `Congratulations! You scored ${score}% and have been officially certified as a ${role?.replace('-', ' ')} on the 247gbs marketplace.`
                        }
                    </p>

                    <div className="flex justify-center gap-4 mb-10">
                        <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</span>
                            <span className={`text-2xl font-bold ${isFailure ? 'text-red-500' : 'text-primary'}`}>{score}%</span>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</span>
                            <span className="text-sm font-bold text-text-main mt-1 capitalize">
                                {isFailure ? 'Retake Required' : isPendingVerification ? 'In Review' : 'Verified'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        {isFailure ? (
                            <Link
                                href="/dashboard/learning"
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:brightness-105 transition-all text-xs uppercase tracking-widest"
                            >
                                Go to Learning Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard"
                                onClick={resetOnboarding}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:brightness-105 transition-all text-xs uppercase tracking-widest"
                            >
                                Enter Dashboard
                            </Link>
                        )}

                        {isFailure && (
                            <Link
                                href="/onboarding"
                                onClick={resetOnboarding} // Optional: Reset state to allow retake immediately or handle logic
                                className="w-full py-4 bg-white border border-slate-200 text-text-main font-bold rounded-xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                            >
                                Try Again
                            </Link>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Certificate ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
}
