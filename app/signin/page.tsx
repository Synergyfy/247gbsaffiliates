"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import FadeIn from '@/components/FadeIn';
import { useAuth } from '@/hooks/useAuth';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoggingIn } = useAuth();

    const handleDemoLogin = async () => {
        // Log in as an artisan directly for demo purposes
        login("artisan@handyflow.com");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        login(email);
    };

    return (
        <main className="min-h-screen bg-white flex relative overflow-hidden">
            {/* Left Column: Image & Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2689&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/50 to-transparent"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <span className="material-symbols-outlined text-white text-xl">handyman</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Artisans</h1>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Welcome Back to <br /> Your Professional Hub.
                    </h2>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        Access your dashboard, manage bookings, and stay connected with your clients.
                    </p>

                    <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                                <span className="material-symbols-outlined">verified</span>
                            </div>
                            <div>
                                <p className="font-bold text-white mb-1">Verified Platform</p>
                                <p className="text-xs text-gray-300">Secure transactions and trusted connections.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-gray-500">
                    © 2026 Artisans Inc. All rights reserved.
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-white">
                <div className="max-w-md w-full">
                    <FadeIn direction="up">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Sign In</h2>
                            <p className="text-gray-500">Enter your credentials to access your account.</p>
                        </div>
                    </FadeIn>

                    <FadeIn direction="up" delay={0.1}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
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

                            {/* Password Input */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-bold text-gray-900">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" className="text-sm font-bold text-brand-green hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full bg-brand-green text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-green/20 hover:bg-brand-green-hover hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-wide font-bold text-gray-400">
                                <span className="px-4 bg-white">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all group"
                            >
                                <FaGoogle className="text-gray-400 group-hover:text-red-500 transition-colors text-lg" />
                                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Google</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all group"
                            >
                                <FaFacebook className="text-gray-400 group-hover:text-blue-600 transition-colors text-lg" />
                                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Facebook</span>
                            </button>
                        </div>

                        {/* Demo Login */}
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleDemoLogin}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 border border-gray-900 text-white rounded-xl hover:bg-black transition-all group shadow-lg shadow-gray-200"
                            >
                                <span className="material-symbols-outlined text-white text-lg">terminal</span>
                                <span className="text-sm font-bold">Demo Login (Artisan)</span>
                            </button>
                        </div>
                    </FadeIn>

                    <FadeIn direction="up" delay={0.2}>
                        <p className="text-center mt-10 text-gray-500 font-medium">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-brand-green font-bold hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </FadeIn>
                </div>
            </div>
        </main>
    );
}
