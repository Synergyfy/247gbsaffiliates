'use client';

import React from 'react';
import Link from 'next/link';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function LearningDashboardPage() {
    const { role } = useOnboardingStore();

    return (
        <div className="p-8 font-display">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                        Training Required
                    </span>
                    <h1 className="text-3xl font-bold text-text-main mb-2">
                        Learning Path: {role?.replace('-', ' ')}
                    </h1>
                    <p className="text-text-secondary max-w-2xl">
                        To ensure quality on the marketplace, we require all partners to demonstrate core competencies. Please complete the recommended modules below to unlock your dashboard.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Modules */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Core Modules</h3>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start">
                            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-3xl">school</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-text-main mb-1">Platform Fundamentals</h3>
                                <p className="text-sm text-slate-500 mb-4 leading-relaxed">Master the basics of how Mcommall works, from profile setup to getting paid. Essential for all new partners.</p>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">schedule</span> 15 Mins</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">videocam</span> 3 Videos</span>
                                </div>
                                <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-105 transition-all">
                                    Start Module
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start">
                            <div className="size-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                                <span className="material-symbols-outlined text-3xl">menu_book</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-text-main mb-1">Role Specifics: {role}</h3>
                                <p className="text-sm text-slate-500 mb-4 leading-relaxed">Deep dive into the responsibilities, deliverables, and best practices for the {role} role on our platform.</p>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">schedule</span> 25 Mins</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">quiz</span> 1 Quiz</span>
                                </div>
                                <button className="px-6 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                                    Start Module
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Certification Status */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-text-main mb-1">Certification Status</h3>
                            <p className="text-xs text-slate-400 mb-6">Complete modules to unlock retake.</p>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-text-main">Fundamentals</span>
                                        <span className="text-primary">0%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-0"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-text-main">Role Specifics</span>
                                        <span className="text-primary">0%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-0"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                <Link
                                    href="/onboarding"
                                    className="w-full block py-3 bg-white border border-slate-200 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-widest cursor-not-allowed opacity-50"
                                >
                                    Retake Locked
                                </Link>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Complete training to unlock</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
