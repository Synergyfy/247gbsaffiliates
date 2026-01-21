"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaHammer, FaUserShield } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/FadeIn';
import { useOnboardingStore, Role } from '@/store/onboardingStore';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

export default function Signup() {
    const router = useRouter();
    const { setRole, setInternalStep } = useOnboardingStore();
    const { signup, isSigningUp } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [activeMessage, setActiveMessage] = useState("");

    const handleRoleSelect = (role: Role) => {
        setRole(role);
        setInternalStep(0);
        setIsRedirecting(true);

        const messages = {
            client: "Redirecting to verification...",
            artisan: "Redirecting to verification...",
            admin: "Redirecting to verification..."
        };
        const msg = messages[role as 'client' | 'artisan' | 'admin'];
        setActiveMessage(msg);

        // Simulate signup
        signup({
            email: `newuser_${Date.now()}@example.com`,
            role: role,
            name: role === 'artisan' ? 'New Artisan' : 'New Customer'
        });
    };

    return (
        <div className="min-h-screen bg-white text-[#0e1a13] font-display flex flex-col antialiased selection:bg-primary/30 overflow-x-hidden">
            {/* Redirect Overlay */}
            <AnimatePresence>
                {(isRedirecting || isSigningUp) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center max-w-sm w-full"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Excellent Choice.</h2>
                            <p className="text-primary font-medium">{activeMessage || "Creating your account..."}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation */}
            <header className="w-full border-b border-[#e8f2ec] bg-white sticky top-0 z-30">
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 select-none cursor-pointer">
                        <div className="w-8 h-8 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-[#0e1a13]">Artisans</h2>
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="grow flex flex-col items-center justify-center p-6 py-12 md:py-20 relative">
                <FadeIn className="w-full max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 text-[#0e1a13] tracking-tight">
                        How will you use Artisans?
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">
                        Choose the role that best describes your needs to get started.
                    </p>
                </FadeIn>

                {/* Cards Container */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                    {/* Customer Card */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        onClick={() => handleRoleSelect('client')}
                        className="group bg-white rounded-3xl p-8 border-2 border-transparent hover:border-primary shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ease-in-out cursor-pointer flex flex-col h-full relative overflow-hidden"
                    >
                        {/* Decorative background blob */}
                        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-primary/5 rounded-full blur-3xl transition-opacity group-hover:bg-primary/10"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8 w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <span className="material-symbols-outlined text-[32px]">person_search</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#0e1a13] mb-3">Customer</h3>
                            <p className="text-gray-500 text-lg leading-relaxed grow">
                                I need a professional artisan for a job. Find reliable experts for your home and office needs.
                            </p>
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button className="w-full h-14 rounded-2xl bg-primary/5 text-primary font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
                                    Get Started
                                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Artisan Card */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        onClick={() => handleRoleSelect('artisan')}
                        className="group bg-white rounded-3xl p-8 border-2 border-transparent hover:border-primary shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ease-in-out cursor-pointer flex flex-col h-full relative overflow-hidden"
                    >
                        {/* Decorative background blob */}
                        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-primary/5 rounded-full blur-3xl transition-opacity group-hover:bg-primary/10"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-8 w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <span className="material-symbols-outlined text-[32px]">handyman</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#0e1a13] mb-3">Artisan</h3>
                            <p className="text-gray-500 text-lg leading-relaxed grow">
                                I am a professional looking to provide my services. Join our network and grow your business.
                            </p>
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button className="w-full h-14 rounded-2xl bg-primary/5 text-primary font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
                                    Get Started
                                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Meta Text / Footer Link */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 font-medium">
                        Already have an account?
                        <Link className="text-primary font-bold hover:underline ml-1" href="/signin">Log in</Link>
                    </p>
                </div>
            </main>

            {/* Simple decorative footer pattern */}
            <div className="w-full h-2 bg-linear-to-r from-transparent via-primary/20 to-transparent mb-0"></div>
        </div>
    );
}
