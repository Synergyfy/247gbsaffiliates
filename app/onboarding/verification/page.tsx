"use client";

import React from "react";
import Link from "next/link";

export default function VerificationPage() {
    return (
        <div className="animate-fade-in-up">
            <div className="rounded-2xl bg-gray-900 text-white p-5 mb-10 flex items-start gap-4 shadow-xl shadow-gray-200">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-brand-green">lock</span>
                </div>
                <div>
                    <h3 className="text-base font-black mb-1">Your data is secure</h3>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                        All documents uploaded are encrypted using AES-256 bank-level encryption. We only use this information to verify your identity as part of our trust & safety protocol.
                    </p>
                </div>
            </div>

            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                    Identity Verification
                </h1>
                <p className="text-gray-600 text-lg font-medium max-w-2xl leading-relaxed">
                    To maintain a trusted community of professionals, we need to verify your identity and your trade credentials.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Government ID Card */}
                <section className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-2xl hover:shadow-gray-200/50 transition-all border-none">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-blue-600">badge</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Government ID</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Passport or National ID</p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Pending
                            </span>
                        </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col gap-8">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <p className="font-black text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <span className="material-symbols-outlined text-lg">photo_camera</span>
                                Photo Requirements
                            </p>
                            <ul className="space-y-2 text-sm text-gray-600 font-medium">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                                    Ensure all four corners are visible
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                                    Text must be perfectly readable
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                                    Avoid glare or dark shadows
                                </li>
                            </ul>
                        </div>
                        <div className="border-4 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:border-brand-green/30 hover:bg-green-50/30 transition-all cursor-pointer group h-full min-h-[220px] relative overflow-hidden">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-brand-green group-hover:text-white transition-all shadow-sm">
                                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                            </div>
                            <h4 className="text-gray-900 font-black text-lg mb-2">Upload Document</h4>
                            <p className="text-sm text-gray-500 font-medium mb-5">Drop your file here or browse</p>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                                JPG, PNG, PDF (10MB MAX)
                            </span>
                        </div>
                    </div>
                </section>

                {/* Professional Certification Card */}
                <section className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-2xl hover:shadow-gray-200/50 transition-all border-none">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-purple-600">workspace_premium</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Professional License</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Trade Certificate or License</p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200 shadow-sm">
                                Not Started
                            </span>
                        </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col gap-8">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <p className="font-black text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <span className="material-symbols-outlined text-lg">info</span>
                                Document Details
                            </p>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">Upload a valid license specific to your primary skill (e.g., Plumbing License #12345).</p>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Skill:</span>
                                <span className="inline-flex items-center px-3 py-1 bg-brand-green/10 text-brand-green text-[10px] font-black rounded-lg uppercase tracking-wider">
                                    Plumbing
                                </span>
                            </div>
                        </div>
                        <div className="border-4 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:border-brand-green/30 hover:bg-green-50/30 transition-all cursor-pointer group h-full min-h-[220px] relative overflow-hidden">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-brand-green group-hover:text-white transition-all shadow-sm">
                                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                            </div>
                            <h4 className="text-gray-900 font-black text-lg mb-2">Upload Certificate</h4>
                            <p className="text-sm text-gray-500 font-medium mb-5">Drop your file here or browse</p>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                                PDF, JPG (10MB MAX)
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-white/90 backdrop-blur-md p-4 px-6 md:px-10 fixed bottom-0 left-0 md:left-72 right-0 z-10">
                <div className="max-w-[1100px] mx-auto flex items-center justify-between">
                    <Link href="/onboarding/availability">
                        <button className="text-text-secondary font-bold hover:text-text-main transition-colors flex items-center gap-2 px-2 py-2">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back
                        </button>
                    </Link>
                    <div className="flex gap-4">
                        <button className="hidden sm:block px-6 py-3 rounded-xl font-bold text-text-secondary hover:bg-gray-100 transition-colors">
                            Save as Draft
                        </button>
                        <Link href="/onboarding/review">
                            <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                                Submit for Review
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="h-20"></div> {/* Spacer for fixed footer */}
        </div>
    );
}
