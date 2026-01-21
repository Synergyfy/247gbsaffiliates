"use client";

import React from "react";
import Link from "next/link";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function ProfileDetailsPage() {
    const { firstName, lastName, professionalTitle, bio, phoneNumber, email, updateData, activeRole } = useOnboardingStore();

    return (
        <div className="animate-fade-in-up">
            {/* Header */}
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                    Tell us about yourself
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl font-medium">
                    {activeRole === 'client'
                        ? "Help artisans get to know you. A complete profile builds trust."
                        : "Start by setting up your artisan profile. This information will be visible to clients when you apply for jobs."
                    }
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Left Column: Form */}
                <div className="xl:col-span-8 flex flex-col gap-8">

                    {/* Avatar Section */}
                    <section className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col sm:flex-row items-center gap-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuARXNH-vkGwvmEhwQRV0IBO_YK7Xod_Wo3k6CMwblM4Ws7uMmpyWIT5Ci-rHoheNbf_tLN2oQc8kcW9m9Tuym1MPeHL5weg6KkSNIJ4SvAnBQjcmFGMSSXG8Ar6ipUgF3YK8OwS3iMuqrzhYiL7Ad1HbxsVMWUYgilEndXUlLsE7QNfbzf2ggec8jaB4UoYJPo6fXKLfeGtSuVg2Trz9gmwQTPZy7SHeLT_7Kzp-fuOUTiTPJx8crF1TzcRaCPP1T6Dj2S263LUNwbL"
                                    alt="Profile"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-3xl">edit</span>
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-brand-green text-white p-2 rounded-full shadow-lg border-2 border-white">
                                <span className="material-symbols-outlined text-base leading-none">photo_camera</span>
                            </div>
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl font-black text-gray-900 mb-2">Profile Photo</h3>
                            <p className="text-sm text-gray-600 font-medium mb-5 max-w-xs leading-relaxed">
                                {activeRole === 'client'
                                    ? "Upload a photo so artisans can recognize you."
                                    : "Upload a clear professional photo. Artisans with photos get more bookings."
                                }
                            </p>
                            <div className="flex gap-3 justify-center sm:justify-start">
                                <button className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-gray-200 hover:bg-black transition-all hover:scale-105">
                                    Upload New
                                </button>
                                <button className="px-6 py-2.5 border border-gray-200 text-gray-500 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Personal Info */}
                    <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-brand-green">person</span>
                            </div>
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-900 uppercase tracking-widest">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    placeholder="Alex"
                                    onChange={(e) => updateData({ firstName: e.target.value })}
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50/50 px-5 py-4 text-base font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all border-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    placeholder={activeRole === 'client' ? "Doe" : "Artisan"}
                                    onChange={(e) => updateData({ lastName: e.target.value })}
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50/50 px-5 py-4 text-base font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all border-none"
                                />
                            </div>

                            {activeRole === 'artisan' && (
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Professional Title</label>
                                    <input
                                        type="text"
                                        value={professionalTitle}
                                        onChange={(e) => updateData({ professionalTitle: e.target.value })}
                                        placeholder="e.g. Master Carpenter"
                                        className="w-full rounded-2xl border-gray-100 bg-gray-50/50 px-5 py-4 text-base font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all border-none"
                                    />
                                    <p className="text-xs text-gray-500 font-medium">This will appear under your name on your profile card.</p>
                                </div>
                            )}

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Bio</label>
                                <textarea
                                    rows={5}
                                    value={bio}
                                    onChange={(e) => updateData({ bio: e.target.value })}
                                    placeholder={activeRole === 'client' ? "I'm a homeowner looking for reliable help..." : "I have over 10 years of experience..."}
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50/50 px-5 py-4 text-base font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all border-none resize-none leading-relaxed"
                                />
                                <div className="flex justify-end">
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{bio.length}/500 characters</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Details */}
                    <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-brand-green">contact_phone</span>
                            </div>
                            Contact Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-base font-black">+1</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => updateData({ phoneNumber: e.target.value })}
                                        className="w-full rounded-2xl border-gray-100 bg-gray-50/50 pl-12 pr-5 py-4 text-base font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all border-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-900 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => updateData({ email: e.target.value })}
                                    className="w-full rounded-2xl border-gray-100 bg-gray-50/50 px-5 py-4 text-base font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all border-none"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Preview or Tips */}
                <div className="xl:col-span-4 flex flex-col gap-6 sticky top-6">
                    <div className="bg-linear-to-br from-primary to-primary-dark rounded-2xl shadow-lg shadow-primary/20 p-6 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

                        <h3 className="text-lg font-bold mb-2 relative z-10">Pro Tip</h3>
                        <p className="text-primary-100 text-sm leading-relaxed relative z-10 mb-4">
                            Artisans with a professional photo and detailed bio get <strong>3x more job offers</strong>. Take a moment to make your profile shine!
                        </p>
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-white h-full w-[20%]"></div>
                        </div>
                        <p className="text-xs text-primary-100 mt-2 font-medium">Profile Strength: 20%</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                        <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">Preview Card</h3>

                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden shrink-0 ring-4 ring-white shadow-md">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuARXNH-vkGwvmEhwQRV0IBO_YK7Xod_Wo3k6CMwblM4Ws7uMmpyWIT5Ci-rHoheNbf_tLN2oQc8kcW9m9Tuym1MPeHL5weg6KkSNIJ4SvAnBQjcmFGMSSXG8Ar6ipUgF3YK8OwS3iMuqrzhYiL7Ad1HbxsVMWUYgilEndXUlLsE7QNfbzf2ggec8jaB4UoYJPo6fXKLfeGtSuVg2Trz9gmwQTPZy7SHeLT_7Kzp-fuOUTiTPJx8crF1TzcRaCPP1T6Dj2S263LUNwbL" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 text-base">{firstName || 'Alex'} {lastName || 'Artisan'}</h4>
                                    <p className="text-sm text-gray-500 font-medium">{professionalTitle || 'Professional Artisan'}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <span className="material-symbols-outlined text-yellow-500 text-[16px] fill-current">star</span>
                                        <span className="text-sm font-black text-gray-900">4.9</span>
                                        <span className="text-xs text-gray-400 font-bold">(0 reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-white/90 backdrop-blur-md p-4 px-6 md:px-10 fixed bottom-0 left-0 md:left-72 right-0 z-10">
                <div className="max-w-[1100px] mx-auto flex items-center justify-between">
                    <button className="text-text-secondary font-bold hover:text-text-main transition-colors flex items-center gap-2 px-2 py-2 invisible">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back
                    </button>
                    <div className="flex gap-4">
                        <button className="hidden sm:block px-6 py-3 rounded-xl font-bold text-text-secondary hover:bg-gray-100 transition-colors">
                            Save as Draft
                        </button>
                        <Link href={activeRole === 'client' ? "/onboarding/review" : "/onboarding/portfolio"}>
                            <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                                Continue
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="h-20"></div> {/* Spacer for fixed footer */}
        </div>
    );
}
