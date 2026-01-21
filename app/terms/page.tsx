"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaFileContract, FaShieldAlt, FaBalanceScale, FaHandshake } from "react-icons/fa";
import Link from "next/link";

export default function TermsPage() {
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
                <div className="flex gap-8">
                    <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">Privacy</Link>
                    <Link href="/cookies" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">Cookies</Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-green-50 text-brand-green rounded-3xl flex items-center justify-center shadow-sm">
                            <FaFileContract size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Service Protocols</p>
                            <h1 className="text-5xl font-black tracking-tight text-gray-900 uppercase">Terms of Service</h1>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-[2.5rem] p-12 mb-16 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <p className="text-2xl font-black text-white leading-tight mb-6">
                            Agreement to Terms of Use
                        </p>
                        <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">
                            By accessing or using the Artisans discovery platform, you agree to be bound by these service protocols. Our platform is designed to facilitate trust and quality between customers and expert artisans.
                        </p>
                    </div>

                    <div className="space-y-20">
                        <section>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center text-xs font-black">01</span>
                                Platform Usage
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Eligibility</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        You must be at least 18 years of age to use this platform. By using Artisans, you represent and warrant that you meet this requirement.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Expert Verification</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        Artisans on our platform go through a rigorous verification process. However, Artisans does not guarantee the performance of any artisan.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-gray-50 rounded-[3rem] p-12 border border-gray-100">
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-8">Service Commitments</h2>
                            <div className="space-y-8">
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-brand-green shadow-sm shrink-0">
                                        <FaBalanceScale size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase tracking-tight mb-2">Liability Disclaimer</h4>
                                        <p className="text-gray-500 font-medium leading-relaxed">
                                            Artisans serves as a discovery engine and marketplace. We are not liable for direct, indirect, or consequential damages resulting from any artisan-customer engagement.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                                        <FaHandshake size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase tracking-tight mb-2">Fair Usage & Conduct</h4>
                                        <p className="text-gray-500 font-medium leading-relaxed">
                                            Abusive behavior, platform manipulation, or fraudulent listings will result in immediate termination of access without notice.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pt-10 border-t border-gray-100">
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-4">Governing Law</h2>
                            <p className="text-gray-500 font-medium leading-relaxed mb-10">
                                These terms are governed by the laws applicable in your jurisdiction. Any disputes arising from the use of the platform shall be handled through arbitration as primary resolution protocol.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-10 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Protocol ID: ART-TOS-2026-001
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Last Updated: Jan 20, 2026
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-green">
                                    <FaShieldAlt /> Validated Policy
                                </div>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
