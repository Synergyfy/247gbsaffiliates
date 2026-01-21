'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-50"
                >
                    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-xl">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-2xl">cookie</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-black text-text-main">Cookies & Privacy</h4>
                                <p className="text-xs font-bold text-text-secondary mt-1 leading-relaxed">
                                    We use cookies to enhance your experience, analyze site traffic, and serve masters. By clicking "Accept", you agree to our use of cookies.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-sm font-black transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={handleDecline}
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-text-main py-3 rounded-xl text-sm font-black transition-all border border-gray-100 active:scale-[0.98]"
                            >
                                Decline
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                            <Link href="/cookies" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                Read our Cookie Policy
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
