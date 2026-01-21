"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import FadeIn from '@/components/FadeIn';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate reset link sent
        setSubmitted(true);
    };

    return (
        <main className="min-h-screen bg-white flex relative overflow-hidden">
            {/* Left Column: Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/50 to-transparent"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <span className="material-symbols-outlined text-white text-xl">handyman</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Artisans</h1>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Don't Worry, <br /> We've Got Your Back.
                    </h2>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        It happens to the best of us. Just tell us your email and we'll send you a secure link to get back into your account.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-gray-500">
                    © 2026 Artisans Inc. All rights reserved.
                </div>
            </div>

            {/* Right Column: Recover Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-white">
                <div className="max-w-md w-full">
                    <FadeIn direction="up">
                        <Link href="/signin" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-green transition-colors mb-8 uppercase tracking-widest">
                            <FaArrowLeft /> Back to Login
                        </Link>

                        {!submitted ? (
                            <>
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h2>
                                    <p className="text-gray-500 font-medium">Enter the email associated with your account.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <FaEnvelope className="text-gray-400" />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-brand-green text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-green/20 hover:bg-brand-green-hover hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                    >
                                        Send Reset Link
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center bg-green-50 rounded-4xl p-8 border border-green-100">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-brand-green mx-auto mb-6 shadow-xl shadow-green-200">
                                    <span className="material-symbols-outlined text-4xl">mark_email_read</span>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Check Your Inbox</h2>
                                <p className="text-gray-600 font-medium leading-relaxed mb-8">
                                    We've sent a password reset link to <span className="font-bold text-gray-900">{email}</span>. Click the link in the email to set a new password.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-brand-green font-bold hover:underline"
                                >
                                    Didn't receive the email? Try again
                                </button>
                            </div>
                        )}
                    </FadeIn>
                </div>
            </div>
        </main>
    );
}
