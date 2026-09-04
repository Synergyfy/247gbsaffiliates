"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaShieldAlt, FaDatabase, FaLock } from "react-icons/fa";
import Link from "next/link";

export default function PrivacyPage() {
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
                <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">
                    View Terms
                </Link>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center shadow-sm">
                            <FaUserShield size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Data Sovereignty</p>
                            <h1 className="text-5xl font-black tracking-tight text-gray-900 uppercase">Privacy Policy</h1>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-gray-50 to-white rounded-4xl p-12 border border-gray-100 mb-16 shadow-inner">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4">Your Privacy is Non-Negotiable.</h2>
                        <p className="text-lg font-medium text-gray-500 leading-relaxed">
                            Artisans is built on the principle of minimal data collection. We only process information that is absolutely necessary to connect you with the right artisan at the right time.
                        </p>
                    </div>

                    <div className="space-y-16">
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">Data Collection Matrix</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <FaDatabase className="text-brand-green mb-4" />
                                    <h4 className="font-black text-xs uppercase tracking-widest mb-2">Identification</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Name, email, and profile details required for core platform engagement.</p>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <FaShieldAlt className="text-blue-500 mb-4" />
                                    <h4 className="font-black text-xs uppercase tracking-widest mb-2">Geolocation</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Precise coordinates used only during the discovery phase to locate nearby artisans.</p>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <FaLock className="text-purple-500 mb-4" />
                                    <h4 className="font-black text-xs uppercase tracking-widest mb-2">Usage Data</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Anonymized interactions used to optimize our search algorithms.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-900 text-brand-green flex items-center justify-center text-xs">02</span>
                                How We Use Data
                            </h2>
                            <div className="prose prose-lg text-gray-600 font-medium leading-relaxed space-y-4">
                                <p>
                                    Primary usage includes enabling discovery, processing bookings, and facilitating secure communication between users. We never sell your personal data to third parties for marketing purposes.
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Optimizing discovery radius based on density.</li>
                                    <li>Verifying artisan credentials and background checks.</li>
                                    <li>Preventing platform fraud and maintaining security.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl">
                            <h2 className="text-2xl font-black text-brand-green uppercase tracking-tight mb-6">Your Rights & Control</h2>
                            <p className="text-gray-400 font-medium leading-relaxed mb-8">
                                You have the right to access, rectify, or delete your personal data at any time. Our systems are designed to provide you with full sovereignty over your information profile.
                            </p>
                            <button className="px-6 py-3 bg-brand-green text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-brand-green/20">
                                Request Data Export
                            </button>
                        </section>

                        <section className="pt-10 border-t border-gray-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                                <FaShieldAlt />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Protocol: ART-PRIV-2026</p>
                            <p className="text-sm font-medium text-gray-500 max-w-lg mb-10">
                                If you have questions regarding our privacy architecture, please contact our transparency engine at privacy@artisans.co
                            </p>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                                Last Updated: January 20th, 2026
                            </div>
                        </section>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
