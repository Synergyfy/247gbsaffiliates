"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import ChatOverlay from "@/components/ChatOverlay";
import CallOverlay from "@/components/CallOverlay";
import Loader from "@/components/Loader";

const ARTISAN_DATA = {
    name: "Marcus Rivera",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_zx0dumzLJFXEPMNQHXmfy9Ryz22qE9gEKrH4SQTmRFFRyeoApfJJUlv9aNsn2SvvHOkh9MveKl6rO9FyrOcfh6FOX3JfgI6XNADF3aaFuQRcsBC5xx8MQ_i0RwgyTQcaaTssf2mOQCNjo5i5jH0zU0gokL2tJrbrv3LNnxV71kSQTQhrV7Dv5OB5xWW9zEz84FNXqgEiI4fJiliXKd2z3pKq9ZgzH5xIK_XXXgVjMZibdrmfyZUAN6wkdV6DSVp2KE-G7MWJrLNg",
    role: "Master Plumber",
    jobs: 120,
    rating: 4.9,
    license: "HND-429"
};

const USER_DATA = {
    name: "Adewale Thompson",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF8W8wur_FEiO6BiN52bPXLPBHdNoCUzY2gzb6zXPC5RihyBy_X_xjeQCxpR2mgjIIfZuaxO7U1l3YgfF_KHYoXGrat4d6oA0v2BA39N4SSeKNPu3G52Olv71skRqInalaS0e-YKYKgKSnPDYQRrjzakSj2Vlj0GrGytxdjmoO3p_zTIW6P8GoPrQ_WyMZLBPHuXlGnVPT2ErBvzdNiNtqQ8xGm9XmtpmKTZBlAQx2NTfc430Ddwp-co0q---p-OxOMISuE-RhBX4R",
    address: "12 Admiralty Way, Lekki Phase 1"
};

export default function StandaloneLiveStatusPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId || "job-123";
    const [seconds, setSeconds] = useState(2535); // 00:42:15 in seconds
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCallOpen, setIsCallOpen] = useState(false);
    const [isPayoutLoading, setIsPayoutLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handlePayout = () => {
        setIsPayoutLoading(true);
        setTimeout(() => {
            setIsPayoutLoading(false);
            router.push(`/dashboard/client/bookings/${jobId}/payment`);
        }, 3000);
    };

    return (
        <div className="font-display bg-white text-[#0e1a13] overflow-hidden h-screen w-full flex flex-col relative">
            <AnimatePresence>
                {isPayoutLoading && (
                    <div className="fixed inset-0 z-100 bg-white flex items-center justify-center p-6">
                        <Loader
                            text="Processing Payout"
                            metaText="Safely transferring funds to Marcus..."
                            progress={65}
                        />
                    </div>
                )}
            </AnimatePresence>

            <ChatOverlay
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                recipientName={ARTISAN_DATA.name}
                recipientAvatar={ARTISAN_DATA.avatar}
            />
            <CallOverlay
                isOpen={isCallOpen}
                onClose={() => setIsCallOpen(false)}
                recipientName={ARTISAN_DATA.name}
                recipientAvatar={ARTISAN_DATA.avatar}
            />

            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <button
                            onClick={() => router.back()}
                            className="bg-white p-2.5 rounded-full shadow-sm border border-gray-100 text-text-secondary hover:text-primary transition-all active:scale-90"
                        >
                            <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                        <Link href="/" className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-3 group">
                            <div className="size-8 flex items-center justify-center bg-primary rounded-full text-white group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[20px]">handyman</span>
                            </div>
                            <h1 className="text-lg font-bold tracking-tight text-gray-900">Artisans</h1>
                        </Link>
                    </div>

                    {/* User Profile Detail */}
                    <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm pointer-events-auto border border-gray-100 flex items-center gap-3 pr-4">
                        <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-white" style={{ backgroundImage: `url('${USER_DATA.avatar}')` }}></div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary leading-none mb-1">Signed in as</p>
                            <p className="text-xs font-black text-text-main leading-none">{USER_DATA.name}</p>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="relative w-full h-full z-0 flex flex-col items-center justify-center pt-20 pb-32 overflow-y-auto">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/10">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3600, repeat: Infinity }}
                        className="h-full bg-primary"
                    ></motion.div>
                </div>

                <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center gap-8">
                    {/* Timer Section */}
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/10">
                            <span className="block size-2 rounded-full bg-primary animate-pulse"></span>
                            Active Duration
                        </div>
                        <div className="font-display text-7xl md:text-9xl font-black text-text-main tracking-tighter tabular-nums mb-4">
                            {formatTime(seconds)}
                        </div>
                        <p className="text-text-secondary font-black text-xs uppercase tracking-widest">Started at 2:30 PM (Lagos Time)</p>
                    </div>

                    {/* Task Checklist Part */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="font-black text-lg text-text-main tracking-tight">Active Job Progress</h3>
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-widest">3/5 Tasks Done</span>
                        </div>
                        <div className="p-4 space-y-2">
                            <div className="flex items-center gap-5 p-4 rounded-2xl transition-all hover:bg-gray-50 opacity-50">
                                <div className="size-6 shrink-0 rounded-full bg-primary flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                </div>
                                <span className="text-text-secondary line-through font-bold">Arrival & Site Inspection</span>
                            </div>
                            <div className="flex items-center gap-5 p-4 rounded-2xl transition-all hover:bg-gray-50 opacity-50">
                                <div className="size-6 shrink-0 rounded-full bg-primary flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                </div>
                                <span className="text-text-secondary line-through font-bold">Diagnostic Check</span>
                            </div>
                            <div className="flex items-center gap-5 p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm">
                                <div className="relative size-6 shrink-0 flex items-center justify-center">
                                    <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                                    <div className="size-2 rounded-full bg-primary"></div>
                                </div>
                                <span className="text-text-main font-black">Replacing kitchen faucet</span>
                            </div>
                            <div className="flex items-center gap-5 p-4 rounded-2xl">
                                <div className="size-6 shrink-0 rounded-full border-2 border-gray-200"></div>
                                <span className="text-text-secondary font-bold">Checking for leaks</span>
                            </div>
                            <div className="flex items-center gap-5 p-4 rounded-2xl">
                                <div className="size-6 shrink-0 rounded-full border-2 border-gray-200"></div>
                                <span className="text-text-secondary font-bold">Final cleanup & Sign-off</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Overlay Layer */}
            <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-6 md:p-10">
                {/* Floating Status Banner */}
                <div className="w-full flex justify-center mt-20 md:mt-12">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white shadow-float rounded-2xl p-2 pr-6 flex items-center gap-4 border border-white/50 pointer-events-auto max-w-md w-full transition-transform hover:scale-[1.02]"
                    >
                        <div className="bg-green-100 text-primary p-3 rounded-xl">
                            <span className="material-symbols-outlined">engineering</span>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-gray-900 text-base font-bold leading-tight">Job Started</h2>
                            <p className="text-primary text-sm font-medium">Marcus is currently working</p>
                        </div>
                    </motion.div>
                </div>

                {/* Artisan Profile Action Card */}
                <div className="w-full flex justify-center md:justify-start md:pl-10 mb-6 md:mb-10">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white shadow-float rounded-4xl p-6 md:p-8 w-full max-w-[500px] pointer-events-auto border border-gray-100 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                        <div className="flex items-start gap-5">
                            <div className="relative shrink-0">
                                <div className="size-16 rounded-[1.25rem] bg-cover bg-center shadow-lg border-2 border-primary/10" style={{ backgroundImage: `url('${ARTISAN_DATA.avatar}')` }}></div>
                                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-lg shadow-md border border-gray-100">
                                    <div className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-0.5">
                                        {ARTISAN_DATA.rating} <span className="material-symbols-outlined text-[10px] fill-current">star</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-xl font-black text-text-main truncate">{ARTISAN_DATA.name}</h4>
                                        <p className="text-xs font-bold text-text-secondary truncate">{ARTISAN_DATA.role} • {ARTISAN_DATA.jobs} jobs</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary font-bold" title="Verified Pro">verified</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                    <span className="px-3 py-1 rounded bg-gray-100 border border-gray-200">License: {ARTISAN_DATA.license}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setIsCallOpen(true)}
                                className="flex-1 h-16 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 active:scale-[0.98] text-text-main border-2 border-gray-100 font-bold rounded-2xl transition-all"
                            >
                                <span className="material-symbols-outlined text-2xl text-primary">call</span>
                                Call
                            </button>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="flex-1 h-16 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 active:scale-[0.98] text-text-main border-2 border-gray-100 font-bold rounded-2xl transition-all"
                            >
                                <span className="material-symbols-outlined text-2xl text-primary">chat</span>
                                Message
                            </button>
                        </div>
                        <button
                            onClick={handlePayout}
                            className="w-full mt-4 h-16 flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                            Payout & Complete
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
