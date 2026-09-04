"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCookieBite, FaShieldAlt, FaChartBar, FaUserLock } from "react-icons/fa";
import Link from "next/link";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans pb-20">
            {/* Simple Header */}
            <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-green/20">
                        <span className="material-symbols-outlined text-xl">handyman</span>
                    </div>
                    <span className="font-black text-xl tracking-tighter">Artisans</span>
                </Link>
                <Link href="/explore" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">
                    Back to Discovery
                </Link>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
                            <FaCookieBite size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Legal Transparency</p>
                            <h1 className="text-5xl font-black tracking-tight text-gray-900 uppercase">Cookie Policy</h1>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 mb-12">
                        <p className="text-xl font-medium text-gray-600 leading-relaxed italic">
                            "Transparency is the foundation of trust. We want you to understand exactly how we use cookies to provide a seamless artisan discovery experience."
                        </p>
                    </div>

                    <div className="space-y-16">
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-900 text-brand-green flex items-center justify-center text-xs">01</span>
                                What are Cookies?
                            </h2>
                            <div className="prose prose-lg text-gray-600 font-medium leading-relaxed space-y-4">
                                <p>
                                    Cookies are small text files that are stored on your device when you visit websites. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
                                </p>
                                <p>
                                    At Artisans, we use cookies to remember your preferences (like location), understand how you interact with our platform, and secure your session data.
                                </p>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="w-12 h-12 bg-green-50 text-brand-green rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FaShieldAlt size={24} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-3">Essential Cookies</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Required for the website to function. They enable core features such as security, network management, and accessibility. You cannot opt out of these.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FaChartBar size={24} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-3">Analytics Cookies</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Help us understand how visitors interact with the platform by collecting and reporting information anonymously. This allows us to improve the discovery engine.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FaUserLock size={24} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-3">Preference Cookies</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Enable the website to remember information that changes the way the site behaves or looks, like your preferred search radius or saved artisans.
                                </p>
                            </div>

                            <div className="bg-gray-900 p-8 rounded-4xl text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                                <h3 className="text-lg font-black text-brand-green uppercase tracking-tight mb-3">Managing Your Data</h3>
                                <p className="text-sm text-gray-400 leading-relaxed relative z-10">
                                    You can clear your cookies anytime via your browser settings. Restricting cookies may affect the quality of the Artisans discovery experience.
                                </p>
                            </div>
                        </section>

                        <section className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">Policy Updates</h2>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. Please re-visit this page regularly to stay informed.
                            </p>
                            <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>Last Updated: January 20th, 2026</span>
                                <span className="flex items-center gap-2">Artisans Legal Core <FaShieldAlt className="text-brand-green" /></span>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
