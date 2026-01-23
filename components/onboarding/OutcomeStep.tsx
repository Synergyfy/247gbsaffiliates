'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import Link from 'next/link';

export const OutcomeStep: React.FC = () => {
    const { quizResult, role, resetOnboarding } = useOnboardingStore();

    if (!quizResult) return null;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-white rounded-4xl shadow-2xl shadow-text-main/5 border border-gray-100 overflow-hidden">
                <div className="p-8 lg:p-12 text-center border-b border-gray-50 bg-white relative">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-10">
                        {/* Score Gauge */}
                        <div className="relative size-48 md:size-56 shrink-0">
                            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                <circle className="text-gray-100" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="7"></circle>
                                <circle
                                    className="text-primary transition-all duration-1000 ease-out"
                                    cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="7"
                                    strokeDasharray="282.7"
                                    strokeDashoffset={282.7 - (282.7 * quizResult.score) / 100}
                                    strokeLinecap="round"
                                ></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold text-text-main leading-none font-display">{quizResult.score}%</span>
                                <span className="text-xs font-bold text-primary tracking-widest uppercase mt-2 font-display">Score</span>
                            </div>
                        </div>

                        {/* Badge UI */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="size-40 bg-primary/10 rounded-full flex items-center justify-center p-4">
                                <div className="size-32 bg-primary flex flex-col items-center justify-center text-white shadow-xl shadow-primary/30" style={{ clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)' }}>
                                    <span className="material-symbols-outlined text-4xl mb-1">verified</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest font-display">Verified</span>
                                    <span className="text-xs font-bold uppercase tracking-widest font-display">{role}</span>
                                </div>
                            </div>
                            <div className="px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-full">
                                <span className="text-sm font-bold text-primary">Official Certification</span>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-xl mx-auto">
                        <h1 className="text-4xl font-bold text-text-main mb-4 font-display">Certification Achieved</h1>
                        <p className="text-text-secondary text-lg leading-relaxed">
                            Excellent work! You have successfully passed the competency test and earned your <span className="text-text-main font-bold">Verified {role?.replace('-', ' ')}</span> badge for the Mcommall Marketplace.
                        </p>
                    </div>
                </div>

                <div className="p-8 lg:px-12 bg-slate-50/50">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 text-center font-display">Competency Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">speed</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">Speed Index</span>
                            <span className="text-xl font-bold text-text-main font-display">95%</span>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">verified_user</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-display">Accuracy</span>
                            <span className="text-xl font-bold text-text-main font-display">{quizResult.score}%</span>
                        </div>
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
                            className="w-full h-16 bg-primary text-white text-lg font-bold rounded-2xl hover:brightness-105 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3 font-display tracking-widest"
                        >
                            Enter My Dashboard
                            <span className="material-symbols-outlined font-bold">dashboard</span>
                        </Link>
                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Dashboard Access Enabled</p>
                    </div>
                    <div className="w-full max-w-md border-t border-slate-100 pt-6">
                        <p className="text-sm text-text-secondary mb-4 font-medium">Want to improve your scores further?</p>
                        <a className="inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest hover:underline font-display" href="#">
                            <span className="material-symbols-outlined text-lg">school</span>
                            Explore Training Library
                        </a>
                    </div>
                </div>
            </div>
            <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                Your badge is now visible on your public profile.
            </p>
        </div>
    );
};
