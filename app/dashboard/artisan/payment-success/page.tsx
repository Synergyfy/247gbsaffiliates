'use client'

import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[540px] bg-white border border-primary/5 rounded-3xl shadow-2xl shadow-primary/5 p-10 md:p-14 text-center z-10"
            >
                {/* Success Icon */}
                <div className="inline-flex items-center justify-center size-28 bg-primary/10 rounded-full mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 12 }}
                        className="size-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
                    >
                        <span className="material-symbols-outlined text-white text-4xl font-black">check</span>
                    </motion.div>
                </div>

                {/* Headline */}
                <div className="mb-10">
                    <p className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-3">Transaction Successful</p>
                    <h1 className="text-text-main tracking-tight text-4xl font-black leading-tight mb-3">
                        ₦45,000 Received!
                    </h1>
                    <p className="text-text-secondary text-base font-medium max-w-sm mx-auto leading-relaxed">
                        Your payment from <span className="font-bold text-text-main">Adewale Thompson</span> has been successfully processed and added to your wallet.
                    </p>
                </div>

                {/* Details List */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-100">
                    <div className="flex justify-between items-center py-3.5 border-b border-gray-200">
                        <p className="text-text-secondary text-sm font-bold">Customer Name</p>
                        <p className="text-text-main text-sm font-black">Adewale Thompson</p>
                    </div>
                    <div className="flex justify-between items-center py-3.5 border-b border-gray-200">
                        <p className="text-text-secondary text-sm font-bold">Job ID</p>
                        <p className="text-text-main text-sm font-black">#ART-98234</p>
                    </div>
                    <div className="flex justify-between items-center py-3.5">
                        <p className="text-text-secondary text-sm font-bold">Completion Date</p>
                        <p className="text-text-main text-sm font-black">October 24, 2023</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/dashboard/artisan/finance"
                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-black py-4.5 px-6 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                        View Wallet
                    </Link>
                    <Link
                        href="/dashboard/artisan"
                        className="flex-1 bg-white border-2 border-primary/20 hover:border-primary/40 text-primary font-black py-4.5 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">grid_view</span>
                        Dashboard
                    </Link>
                </div>

                <p className="mt-10 text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black opacity-50">
                    Securely Handled by Artisans Escrow Systems
                </p>
            </motion.div>

            {/* Footer Branding Area (Subtle) */}
            <div className="mt-16 opacity-30 flex gap-6 pointer-events-none grayscale hover:grayscale-0 transition-all duration-700">
                <div className="size-16 rounded-2xl bg-cover bg-center border border-gray-300" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695ce6958?q=80&w=200&auto=format&fit=crop')" }}></div>
                <div className="size-16 rounded-2xl bg-cover bg-center border border-gray-300" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200&auto=format&fit=crop')" }}></div>
                <div className="size-16 rounded-2xl bg-cover bg-center border border-gray-300" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541604193435-225878996ac3?q=80&w=200&auto=format&fit=crop')" }}></div>
            </div>

            <footer className="mt-auto py-10 text-center text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                © {new Date().getFullYear()} Artisans Services Inc. • Artisan Support: 0800-ARTISAN
            </footer>
        </div>
    );
}
