"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ClientActiveJobPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                {/* Status Header */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-32 -mt-32"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest mb-4">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                Artisan is on the way
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">Plumbing Repair</h1>
                            <p className="text-gray-500 font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">location_on</span>
                                123 Lekki Phase 1, Lagos
                            </p>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-1 text-right w-full">Estimated Arrival</p>
                            <h2 className="text-3xl md:text-4xl font-black text-brand-green">14 mins</h2>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-12 relative">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "30%" }}
                                animate={{ width: "65%" }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="h-full bg-brand-green shadow-[0_0_15px_rgba(61,123,82,0.3)]"
                            />
                        </div>
                        <div className="flex justify-between mt-6">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-xl bg-brand-green text-white flex items-center justify-center shadow-lg shadow-brand-green/20">
                                    <span className="material-symbols-outlined text-lg">check</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-brand-green">Booked</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-xl bg-brand-green text-white flex items-center justify-center shadow-lg shadow-brand-green/20">
                                    <span className="material-symbols-outlined text-lg">check</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-brand-green">Assigned</p>
                            </div>
                            <Link href="/track/job-123" className="flex flex-col items-center group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-white border-4 border-brand-green flex items-center justify-center text-brand-green shadow-xl shadow-green-100 group-hover:scale-110 transition-transform">
                                    <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-brand-green">On the Way</p>
                            </Link>
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">home</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-gray-300">Arrived</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Artisan Info */}
                    <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8">
                        <div className="flex gap-6 items-center">
                            <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden shadow-xl transform -rotate-3 border-2 border-white">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuARXNH-vkGwvmEhwQRV0IBO_YK7Xod_Wo3k6CMwblM4Ws7uMmpyWIT5Ci-rHoheNbf_tLN2oQc8kcW9m9Tuym1MPeHL5weg6KkSNIJ4SvAnBQjcmFGMSSXG8Ar6ipUgF3YK8OwS3iMuqrzhYiL7Ad1HbxsVMWUYgilEndXUlLsE7QNfbzf2ggec8jaB4UoYJPo6fXKLfeGtSuVg2Trz9gmwQTPZy7SHeLT_7Kzp-fuOUTiTPJx8crF1TzcRaCPP1T6Dj2S263LUNwbL" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-1">Alex Artisan</h3>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Master Plumber</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="material-symbols-outlined text-yellow-500 text-[16px] fill-current">star</span>
                                    <span className="text-sm font-black text-gray-900">4.9</span>
                                    <span className="text-xs text-gray-400 font-bold">(124 jobs)</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="h-14 rounded-2xl bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-base">call</span>
                                Call Alex
                            </button>
                            <button className="h-14 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-900 text-[10px] font-black uppercase tracking-widest transition-colors border border-gray-100 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-base">chat</span>
                                Message
                            </button>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Booking Details</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Service Fee</span>
                                <span className="text-gray-900 font-black">₦ 5,000</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Est. Materials</span>
                                <span className="text-gray-900 font-black">₦ 12,500</span>
                            </div>
                            <div className="h-px bg-gray-50 w-full my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-black text-gray-900">Total Est.</span>
                                <span className="text-lg font-black text-brand-green">₦ 17,500</span>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50 mt-2">
                            <div className="flex gap-3">
                                <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
                                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                    Payment is securely held by Artisans and only released after you confirm the job is complete.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Safety & Help */}
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">cancel</span>
                        Cancel Booking
                    </button>
                    <button className="text-[10px] font-black text-gray-400 hover:text-brand-green transition-colors uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">shield_person</span>
                        Safety Center & Support
                    </button>
                </div>
            </div>
        </div>
    );
}
