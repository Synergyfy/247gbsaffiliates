"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // Simulate verification process
        const timer = setTimeout(() => {
            setIsRedirecting(true);
            setTimeout(() => {
                router.push('/onboarding');
            }, 1000);
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    const handleManualRedirect = () => {
        setIsRedirecting(true);
        router.push('/onboarding');
    };

    return (
        <div className="min-h-screen w-full flex flex-col font-display bg-white dark:bg-[#1a1a1a] text-[#101914] antialiased selection:bg-primary/20 overflow-hidden relative">
            {/* Background Geometric Accents */}
            {/* Large Circle Top Left */}
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
            {/* Floating Square Right */}
            <div className="absolute right-[10%] top-[20%] h-24 w-24 rotate-12 rounded-2xl bg-primary/5"></div>
            {/* Small Circle Bottom Left */}
            <div className="absolute bottom-[15%] left-[5%] h-16 w-16 rounded-full bg-primary/10"></div>
            {/* Large Triangle/Gradient Bottom Right */}
            <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl"></div>
            
            {/* Decorative "Artisan" shapes (Abstract Tools) */}
            <div className="absolute left-[20%] top-[15%] text-primary/10 pointer-events-none">
                <span className="material-symbols-outlined text-6xl rotate-[-15deg]">change_history</span>
            </div>
            <div className="absolute right-[25%] bottom-[20%] text-primary/10 pointer-events-none">
                <span className="material-symbols-outlined text-5xl rotate-[15deg]">circle</span>
            </div>

            {/* Minimal Header */}
            <header className="relative z-10 flex w-full items-center justify-between px-8 py-6 md:px-12 lg:px-20">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined">handyman</span>
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#101914] dark:text-white">HandyFlow</h2>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex w-full max-w-[560px] flex-col items-center text-center"
                >
                    {/* Success Icon Group */}
                    <div className="relative mb-10 flex items-center justify-center">
                        {/* Outer pulsing ring */}
                        <div className="absolute h-40 w-40 animate-pulse rounded-full bg-primary/10"></div>
                        {/* Inner static ring */}
                        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/20">
                            <span className="material-symbols-outlined text-6xl font-bold">check</span>
                        </div>
                        {/* Decorative small floating elements near icon */}
                        <div className="absolute -right-4 top-0 h-3 w-3 animate-bounce rounded-full bg-[#eab308]"></div>
                        <div className="absolute -left-2 bottom-4 h-4 w-4 animate-pulse rounded-full bg-primary/40"></div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-primary dark:text-green-400 md:text-5xl">
                            Email Verified!
                        </h1>
                        <p className="mx-auto max-w-[440px] text-lg font-medium leading-relaxed text-[#5c6b63] dark:text-neutral-400">
                            Your journey with HandyFlow begins now. We've confirmed your secure identity.
                        </p>
                    </div>

                    {/* Loading / Redirection Status */}
                    <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-white/50 p-6 backdrop-blur-sm dark:bg-white/5 border border-white/20">
                        <div className="flex items-center gap-3 text-[#101914] dark:text-white">
                            {isRedirecting ? (
                                <div className="w-5 h-5 border-2 border-primary border-t-primary/20 rounded-full animate-spin"></div>
                            ) : (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            )}
                            <span className="text-sm font-semibold">Redirecting to onboarding...</span>
                        </div>
                        
                        {/* Manual Override Button */}
                        <button 
                            onClick={handleManualRedirect}
                            className="group flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#5c6b63] transition-colors hover:bg-neutral-100 hover:text-primary dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-green-400"
                        >
                            <span>Click here if not redirected</span>
                            <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                        </button>
                    </div>
                </motion.div>
            </main>

            {/* Footer / Bottom Decoration */}
            <div className="relative z-10 w-full py-6 text-center">
                <p className="text-xs font-medium text-neutral-400">HandyFlow Secure Registration © 2026</p>
            </div>
        </div>
    );
}
