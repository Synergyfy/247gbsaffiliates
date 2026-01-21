'use client'

import Link from "next/link";
import { useState } from "react";

export default function LinkBankPage() {
    const [accountNumber, setAccountNumber] = useState("0987654321");

    return (
        <div className="min-h-screen bg-background-light text-text-main transition-colors duration-300">
            {/* Search/Header background simulation from snippet */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
                <div className="absolute top-0 w-full h-20 bg-white/80 backdrop-blur-md border-b border-gray-100"></div>
                <div className="max-w-[1200px] mx-auto px-10 py-32 flex flex-col gap-10">
                    <h1 className="text-6xl font-black tracking-tight leading-[1.1]">Manage Your <span className="text-primary">Earnings</span></h1>
                    <p className="text-xl text-text-secondary font-medium max-w-xl">Connect your bank account to start receiving direct deposits for your completed tasks.</p>
                </div>
            </div>

            {/* Modal Overlay Style Container */}
            <div className="fixed inset-0 z-60 bg-text-main/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden transform scale-100 transition-all">
                    <div className="px-10 pt-10 pb-6 flex justify-between items-start">
                        <div>
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-primary text-4xl">account_balance</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-text-main">Link Bank Account</h2>
                            <p className="text-sm text-text-secondary font-bold mt-2">Add a payout method to receive your earnings.</p>
                        </div>
                        <Link href="/dashboard/artisan/finance" className="text-text-secondary hover:text-text-main transition-colors">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </Link>
                    </div>

                    <div className="px-10 py-6 space-y-8">
                        {/* Bank Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Select Bank</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                                </div>
                                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-sm font-black focus:ring-4 focus:ring-primary/10 outline-none appearance-none transition-all cursor-pointer">
                                    <option disabled value="">Select your bank...</option>
                                    <option>First National Bank</option>
                                    <option>Apex Global Trust</option>
                                    <option>Heritage Savings</option>
                                    <option>Standard Chartered</option>
                                    <option>Zenith Alliance</option>
                                </select>
                                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-text-secondary text-base">keyboard_arrow_down</span>
                                </div>
                            </div>
                        </div>

                        {/* Account Number */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Account Number</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 text-base font-black tracking-widest focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="e.g. 0123456789"
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2.5 px-1">
                                <span className="material-symbols-outlined text-primary text-xl animate-pulse">check_circle</span>
                                <p className="text-sm font-black text-primary">Verified: <span className="text-text-main">Marcus Rivera</span></p>
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="bg-primary/5 rounded-2xl p-5 flex gap-4 items-start border border-primary/10">
                            <span className="material-symbols-outlined text-primary text-2xl mt-0.5">lock</span>
                            <p className="text-[11px] text-text-secondary leading-relaxed font-bold">
                                Your banking information is protected with industry-standard 256-bit SSL encryption. Artisans does not store your full account credentials.
                            </p>
                        </div>
                    </div>

                    <div className="px-10 pb-10 pt-4 flex flex-col gap-4">
                        <button className="w-full bg-primary text-white h-16 rounded-[1.25rem] font-black tracking-tight shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
                            Link This Account
                            <span className="material-symbols-outlined font-black">arrow_forward</span>
                        </button>
                        <Link
                            href="/dashboard/artisan/finance"
                            className="w-full bg-transparent border-2 border-gray-100 text-text-secondary h-16 rounded-[1.25rem] font-bold hover:bg-gray-50 flex items-center justify-center transition-all"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
