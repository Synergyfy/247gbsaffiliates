"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function ArtisanDashboardPage() {
    const { user } = useAuthStore();
    const currentUser = user || { name: "Alex", role: "artisan" };
    return (
        <div className="w-full min-h-full bg-white animate-fade-in-up p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                            Dashboard
                        </h1>
                        <p className="text-gray-500">Welcome back, {currentUser.name}. Here's your business overview.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-50 text-brand-green text-sm font-bold rounded-full border border-green-100 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                            Online
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-brand-green/20 shadow-sm transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-brand-green group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
                        </div>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Total Earnings</p>
                        <h3 className="text-2xl font-black text-gray-900">₦ 845,200</h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-brand-green/20 shadow-sm transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">task_alt</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Completed Jobs</p>
                        <h3 className="text-2xl font-black text-gray-900">48</h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-brand-green/20 shadow-sm transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">calendar_clock</span>
                            </div>
                            <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">3 Active</span>
                        </div>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Pending Requests</p>
                        <h3 className="text-2xl font-black text-gray-900">3</h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-brand-green/20 shadow-sm transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">visibility</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Profile Views</p>
                        <h3 className="text-2xl font-black text-gray-900">1.2k</h3>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Bookings List */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50">
                            <h2 className="font-black text-xl text-gray-900 uppercase tracking-tight">Recent Bookings</h2>
                            <Link href="#" className="text-brand-green text-sm font-black hover:underline uppercase tracking-widest">View All</Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {[1, 2, 3].map((item, i) => (
                                <div key={i} className="p-8 hover:bg-gray-50/50 transition-all flex flex-col sm:flex-row gap-6 group">
                                    <div className="bg-gray-50 rounded-2xl p-4 min-w-[80px] flex flex-col items-center justify-center text-center border border-gray-100 group-hover:bg-white transition-colors">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OCT</span>
                                        <span className="text-xl font-black text-gray-900">{20 + i}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-black text-gray-900 text-lg mb-1">Plumbing Repair</h3>
                                                <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-base">location_on</span>
                                                    Lekki Phase 1, Lagos
                                                </p>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${i === 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                {i === 0 ? 'Pending' : 'Completed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Profile Card */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-20 h-20 rounded-2xl bg-gray-200 border-2 border-white shadow-xl overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuARXNH-vkGwvmEhwQRV0IBO_YK7Xod_Wo3k6CMwblM4Ws7uMmpyWIT5Ci-rHoheNbf_tLN2oQc8kcW9m9Tuym1MPeHL5weg6KkSNIJ4SvAnBQjcmFGMSSXG8Ar6ipUgF3YK8OwS3iMuqrzhYiL7Ad1HbxsVMWUYgilEndXUlLsE7QNfbzf2ggec8jaB4UoYJPo6fXKLfeGtSuVg2Trz9gmwQTPZy7SHeLT_7Kzp-fuOUTiTPJx8crF1TzcRaCPP1T6Dj2S263LUNwbL" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-gray-900">{currentUser.name}</h3>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pro {currentUser.role}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/onboarding/profile" className="w-full">
                                    <button className="w-full h-11 rounded-xl bg-gray-900 hover:bg-black text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-gray-200">
                                        Edit Profile
                                    </button>
                                </Link>
                                <button className="p-4 h-11 rounded-xl bg-gray-50 hover:bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-900 transition-colors border border-gray-100 flex items-center justify-center">
                                    Settings
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-green-100/50 transition-colors"></div>
                            <h3 className="font-black text-brand-green uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">lightbulb</span>
                                Pro Tip
                            </h3>
                            <p className="text-sm text-gray-600 font-medium mb-6 leading-relaxed">
                                Complete your portfolio with professional photos to attract more high-value clients.
                            </p>
                            <Link href="/onboarding/portfolio" className="w-full">
                                <button className="w-full text-[10px] font-black text-brand-green uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
                                    Update Portfolio
                                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
