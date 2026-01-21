"use client";

import React from "react";
import Link from "next/link";

import { useOnboardingStore } from "@/store/onboardingStore";

export default function ReviewPage() {
    const { activeRole } = useOnboardingStore();
    const isClient = activeRole === 'client';

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in-up">
            <div className="w-full max-w-xl">
                {/* Success Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/60 p-12 sm:p-16 text-center border-none relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-linear-to-r from-green-50 via-brand-green to-green-50"></div>
                    <div className="absolute top-12 right-12 w-32 h-32 bg-green-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
                    <div className="absolute bottom-12 left-12 w-32 h-32 bg-green-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>

                    {/* Icon */}
                    <div className="mx-auto mb-10 flex items-center justify-center w-28 h-28 rounded-3xl bg-green-50 text-brand-green shadow-xl shadow-green-100/50 transform -rotate-6 animate-float">
                        <span className="material-symbols-outlined text-6xl">verified</span>
                    </div>

                    {/* Text Content */}
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                        {isClient ? (
                            <>
                                You are <br /><span className="text-brand-green underline decoration-brand-green/20 underline-offset-8">All Set!</span>
                            </>
                        ) : (
                            <>
                                Your Profile is <br /><span className="text-brand-green underline decoration-brand-green/20 underline-offset-8">Under Review!</span>
                            </>
                        )}
                    </h1>
                    <p className="text-gray-600 text-lg font-medium leading-relaxed mb-12 max-w-sm mx-auto">
                        {isClient
                            ? "Great work! Your account has been created and you are ready to find the best artisans for your needs."
                            : "Great work! Your identity and certifications have been submitted for verification. Our team typically reviews accounts within 24-48 hours."
                        }
                    </p>

                    {/* Custom Progress Stepper */}
                    <div className="mb-12 w-full">
                        <div className="relative flex items-center justify-between w-full max-w-[380px] mx-auto mb-4">
                            {/* Line Background */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 rounded-full z-0"></div>
                            {/* Active Line Progress */}
                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-brand-green rounded-full z-0 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,197,94,0.3)] ${isClient ? 'w-full' : 'w-1/2'}`}></div>

                            {/* Step 1: Submitted (or Account Created) */}
                            <div className="relative z-10 flex flex-col items-center group">
                                <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-white ring-8 ring-white shadow-xl shadow-brand-green/20">
                                    <span className="material-symbols-outlined text-base">check</span>
                                </div>
                                <span className="absolute top-14 text-[10px] font-black text-brand-green whitespace-nowrap uppercase tracking-widest">
                                    {isClient ? "Created" : "Submitted"}
                                </span>
                            </div>

                            {/* Step 2: Under Review (or Ready for Client) */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-8 ring-white shadow-xl ${isClient ? 'bg-brand-green text-white shadow-brand-green/20' : 'bg-white border-4 border-brand-green text-brand-green shadow-green-100'}`}>
                                    {isClient ? (
                                        <span className="material-symbols-outlined text-base">check</span>
                                    ) : (
                                        <div className="w-3 h-3 rounded-full bg-brand-green animate-pulse"></div>
                                    )}
                                </div>
                                <span className={`absolute top-14 text-[10px] font-black whitespace-nowrap uppercase tracking-widest ${isClient ? 'text-brand-green' : 'text-brand-green'}`}>
                                    {isClient ? "Ready" : "Under Review"}
                                </span>
                            </div>

                            {/* Step 3: Verified (or Active for Client) */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-8 ring-white ${isClient ? 'bg-brand-green text-white shadow-brand-green/20' : 'bg-gray-100 border-2 border-transparent text-gray-400'}`}>
                                    {isClient ? (
                                        <span className="material-symbols-outlined text-base">rocket_launch</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-base">lock</span>
                                    )}
                                </div>
                                <span className={`absolute top-14 text-[10px] font-black whitespace-nowrap uppercase tracking-widest ${isClient ? 'text-brand-green' : 'text-gray-300'}`}>
                                    {isClient ? "Active" : "Verified"}
                                </span>
                            </div>
                        </div>
                        {/* Spacer for labels */}
                        <div className="h-10"></div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-6 items-center">
                        <Link href={isClient ? "/dashboard/client" : "/dashboard/artisan"} className="w-full">
                            <button className="w-full h-16 px-10 bg-gray-900 hover:bg-black text-white text-lg font-black rounded-2xl transition-all shadow-2xl shadow-gray-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
                                <span>{isClient ? "Go to Dashboard" : "Go to Dashboard"}</span>
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </button>
                        </Link>
                        <a href="#" className="text-sm font-black text-gray-400 hover:text-brand-green transition-colors flex items-center gap-2 uppercase tracking-widest">
                            <span className="material-symbols-outlined text-xl">support_agent</span>
                            Contact Concierge Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
