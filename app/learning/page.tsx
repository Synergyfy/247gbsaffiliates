'use client';

import React from 'react';
import Link from 'next/link';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function LearningDashboardPage() {
    const { role } = useOnboardingStore();

    return (
        <div className="min-h-screen bg-background-light p-8 font-display">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                        Training Required
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-4">
                        Learning Path: {role?.replace('-', ' ')}
                    </h1>
                    <p className="text-text-secondary max-w-xl mx-auto">
                        To ensure quality on the marketplace, we require all partners to demonstrate core competencies. Please complete the recommended modules below to unlock your dashboard.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                            <span className="material-symbols-outlined">school</span>
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-2">Platform Fundamentals</h3>
                        <p className="text-sm text-slate-500 mb-4">Master the basics of how Mcommall works, from profile setup to getting paid.</p>
                        <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-widest transition-colors">
                            Start Module
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-2">Role Specifics: {role}</h3>
                        <p className="text-sm text-slate-500 mb-4">Deep dive into the responsibilities and best practices for your specific role.</p>
                        <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-widest transition-colors">
                            Start Module
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center">
                    <h2 className="text-xl font-bold text-text-main mb-2">Ready to try again?</h2>
                    <p className="text-slate-500 mb-6 text-sm">You can retake the assessment after reviewing the materials.</p>
                    <Link href="/onboarding" className="inline-flex items-center justify-center px-8 h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:brightness-105 transition-all text-xs uppercase tracking-widest">
                        Retake Assessment
                    </Link>
                </div>
            </div>
        </div>
    );
}
