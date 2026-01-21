'use client'

import Link from "next/link";
import { useState } from "react";

export default function PaymentSummaryPage() {
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'wallet' | 'bank'>('card');

    return (
        <div className="min-h-screen bg-background-light text-text-main transition-colors duration-300">
            <main className="max-w-[640px] mx-auto py-12 px-4 flex flex-col gap-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm font-medium">
                    <Link href="/dashboard/client" className="text-primary hover:underline">Booking Details</Link>
                    <span className="material-symbols-outlined text-xs text-gray-400">chevron_right</span>
                    <span className="text-text-secondary">Payment Summary</span>
                </nav>

                {/* Page Heading */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main">Payment Summary</h1>
                    <p className="text-text-secondary leading-relaxed">
                        Review your service details and securely pay <span className="font-bold text-text-main">Marcus "The Handyman" Rivera</span>.
                    </p>
                </div>

                {/* Breakdown Section */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-8">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-6">Line Items</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">Artisan Labor <span className="text-xs ml-2 px-2 py-0.5 bg-gray-100 rounded-full">3 Hours</span></span>
                                <span className="font-bold">₦120.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">Service Fee</span>
                                <span className="font-bold">₦15.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">Material Costs</span>
                                <span className="font-bold">₦45.50</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">Platform Fee</span>
                                <span className="font-bold">₦5.00</span>
                            </div>

                            <div className="pt-6 mt-2 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-center p-6 bg-primary/5 rounded-2xl border border-primary/20">
                                    <div>
                                        <p className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Total to Pay</p>
                                        <p className="text-4xl font-black tracking-tight">₦185.50</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary text-5xl opacity-40">payments</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary ml-1">Select Payment Method</h3>

                    {/* Saved Card */}
                    <div
                        onClick={() => setSelectedMethod('card')}
                        className={`border-2 rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${selectedMethod === 'card' ? 'border-primary bg-primary/5' : 'bg-white border-transparent shadow-sm'}`}
                    >
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <span className="material-symbols-outlined text-primary">credit_card</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">Saved Card</p>
                            <p className="text-xs text-text-secondary">Visa ending in •••• 4242</p>
                        </div>
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === 'card' ? 'border-primary' : 'border-gray-200'}`}>
                            {selectedMethod === 'card' && <div className="size-3 rounded-full bg-primary" />}
                        </div>
                    </div>

                    {/* Wallet */}
                    <div
                        onClick={() => setSelectedMethod('wallet')}
                        className={`border-2 rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${selectedMethod === 'wallet' ? 'border-primary bg-primary/5' : 'bg-white border-transparent shadow-sm'}`}
                    >
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">Artisans Wallet</p>
                            <p className="text-xs text-text-secondary">Balance: ₦420.00</p>
                        </div>
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === 'wallet' ? 'border-primary' : 'border-gray-200'}`}>
                            {selectedMethod === 'wallet' && <div className="size-3 rounded-full bg-primary" />}
                        </div>
                    </div>

                    {/* Bank Transfer */}
                    <div
                        onClick={() => setSelectedMethod('bank')}
                        className={`border-2 rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${selectedMethod === 'bank' ? 'border-primary bg-primary/5' : 'bg-white border-transparent shadow-sm'}`}
                    >
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <span className="material-symbols-outlined text-primary">account_balance</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">Bank Transfer</p>
                            <p className="text-xs text-text-secondary">Manual verification (1-2 days)</p>
                        </div>
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === 'bank' ? 'border-primary' : 'border-gray-200'}`}>
                            {selectedMethod === 'bank' && <div className="size-3 rounded-full bg-primary" />}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 flex flex-col gap-6">
                    <Link
                        href="/dashboard/artisan/payment-success" /* For demo purposes, link to success page */
                        className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                    >
                        Confirm & Pay ₦185.50
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                        <p className="text-xs text-text-secondary leading-relaxed font-medium">
                            Secure payment processed by Artisans SafePay. Your funds are held in escrow and only released once you confirm the work is completed.
                        </p>
                    </div>
                </div>

                {/* Artisan Mini-Card */}
                <div className="mt-8 p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-5 opacity-80">
                    <div className="size-14 rounded-full bg-cover bg-center border-2 border-primary/20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-cIhXlPm9I7w48pSocs9_gFiaSnwvQFm03525rPbII85KcZAfQz_KnZWszsbXsGL3Av7rGdPNtim5DQDVq3ATfHCFI4FaZyHIboPs4oPy13XXbioj0NSUlPpf32WYPgPrqmiyIdCEuL28b79HY6eVr4IE-JaMRtEqgdRjzhjscbsqdxm-ihyHxxtH_k1SLYoyOVLzb1g1Lrotx2I0q_iFjWS0yLEnirVaF4DRJIivXy3zmdLV99ZH5pL3cXjMw6sqpsN84zL5PSgF')" }}></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-1">Service Provider</p>
                        <p className="text-base font-black">Marcus Rivera</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex items-center text-primary">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="material-symbols-outlined text-xs fill-1">star</span>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-text-secondary">(124 jobs completed)</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
