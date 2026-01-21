"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ChatOverlay from "@/components/ChatOverlay";
import CallOverlay from "@/components/CallOverlay";

// Import Leaflet map dynamically to avoid SSR issues
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-text-secondary font-bold">Loading Interactive Map...</div>
});

const ARTISAN_DATA = {
    name: "Marcus Rivera",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_zx0dumzLJFXEPMNQHXmfy9Ryz22qE9gEKrH4SQTmRFFRyeoApfJJUlv9aNsn2SvvHOkh9MveKl6rO9FyrOcfh6FOX3JfgI6XNADF3aaFuQRcsBC5xx8MQ_i0RwgyTQcaaTssf2mOQCNjo5i5jH0zU0gokL2tJrbrv3LNnxV71kSQTQhrV7Dv5OB5xWW9zEz84FNXqgEiI4fJiliXKd2z3pKq9ZgzH5xIK_XXXgVjMZibdrmfyZUAN6wkdV6DSVp2KE-G7MWJrLNg",
    role: "Master Plumber",
    jobs: 120,
    rating: 4.9,
    vehicle: "Ford Transit (Grey) • License: HND-429"
};

const USER_DATA = {
    name: "Adewale Thompson",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF8W8wur_FEiO6BiN52bPXLPBHdNoCUzY2gzb6zXPC5RihyBy_X_xjeQCxpR2mgjIIfZuaxO7U1l3YgfF_KHYoXGrat4d6oA0v2BA39N4SSeKNPu3G52Olv71skRqInalaS0e-YKYKgKSnPDYQRrjzakSj2Vlj0GrGytxdjmoO3p_zTIW6P8GoPrQ_WyMZLBPHuXlGnVPT2ErBvzdNiNtqQ8xGm9XmtpmKTZBlAQx2NTfc430Ddwp-co0q---p-OxOMISuE-RhBX4R",
    address: "12 Admiralty Way, Lekki Phase 1"
};

export default function StandaloneTrackingPage() {
    const params = useParams();
    const jobId = params.jobId || "job-123";
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCallOpen, setIsCallOpen] = useState(false);

    return (
        <div className="font-display bg-white text-[#0e1a13] overflow-hidden h-screen w-full flex flex-col relative">
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

            {/* Top Navigation (Standalone) */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    {/* Logo Area */}
                    <Link href="/" className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm pointer-events-auto border border-gray-100 flex items-center gap-3 group">
                        <div className="size-8 flex items-center justify-center bg-primary rounded-full text-white group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[20px]">handyman</span>
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-gray-900">Artisans</h1>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-md px-2 py-2 rounded-full shadow-sm pointer-events-auto border border-gray-100">
                        <Link href="/dashboard/client" className="px-5 py-2 text-sm font-semibold rounded-full hover:bg-gray-100 text-gray-900 transition-colors">Dashboard</Link>
                        <Link href="/services" className="px-5 py-2 text-sm font-medium rounded-full text-gray-500 hover:text-gray-900 transition-colors">Services</Link>
                        <Link href="/support" className="px-5 py-2 text-sm font-medium rounded-full text-gray-500 hover:text-gray-900 transition-colors">Support</Link>
                    </div>

                    {/* User Profile */}
                    <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm pointer-events-auto border border-gray-100 flex items-center gap-3 pr-4">
                        <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-white" style={{ backgroundImage: `url('${USER_DATA.avatar}')` }}></div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary leading-none mb-1">Signed in as</p>
                            <p className="text-xs font-black text-text-main leading-none">{USER_DATA.name}</p>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Interactive Map Canvas */}
            <div className="relative w-full h-full z-0">
                <InteractiveMap />
            </div>

            {/* UI Overlay Layer */}
            <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-6 md:p-10">
                {/* Top Status Banner */}
                <div className="w-full flex justify-center mt-20 md:mt-12">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white shadow-float rounded-2xl p-2 pr-6 flex items-center gap-4 border border-white/50 pointer-events-auto max-w-md w-full transition-transform hover:scale-[1.02]"
                    >
                        <div className="bg-green-100 text-primary p-3 rounded-xl">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-gray-900 text-base font-bold leading-tight">Your Artisan is Confirmed!</h2>
                            <p className="text-primary text-sm font-medium">Marcus is driving to your location.</p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Artisan Detail Card */}
                <div className="w-full flex justify-center md:justify-start md:pl-10 mb-6 md:mb-10">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white shadow-float rounded-4xl p-6 md:p-8 w-full max-w-[500px] pointer-events-auto border border-gray-100 relative overflow-hidden group"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

                        {/* ETA Header inside card */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">Estimated Arrival</span>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-text-main tracking-tight">12 <span className="text-lg font-bold text-text-secondary">mins</span></h3>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                        <span className="block size-1.5 rounded-full bg-primary animate-pulse"></span> Tracking Live
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="size-12 flex items-center justify-center rounded-2xl bg-white text-text-secondary shadow-sm hover:text-primary border border-gray-100 transition-colors">
                                    <span className="material-symbols-outlined">my_location</span>
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-gray-100 mb-8"></div>

                        {/* Artisan Profile */}
                        <div className="flex items-start gap-5">
                            <div className="relative shrink-0">
                                <div className="size-16 rounded-[1.25rem] bg-cover bg-center shadow-lg border-2 border-primary/10" style={{ backgroundImage: `url('${ARTISAN_DATA.avatar}')` }}></div>
                                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-lg shadow-md border border-gray-100">
                                    <div className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-0.5">
                                        {ARTISAN_DATA.rating} <span className="material-symbols-outlined text-[10px] fill-current">star</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-xl font-black text-text-main truncate">{ARTISAN_DATA.name}</h4>
                                        <p className="text-xs font-bold text-text-secondary truncate">{ARTISAN_DATA.role} • {ARTISAN_DATA.jobs} jobs</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary font-bold">verified</span>
                                </div>
                                <div className="mt-4 flex items-center gap-3 text-[10px] font-black text-text-secondary uppercase tracking-widest bg-white px-3 py-2 rounded-xl border border-gray-100">
                                    <span className="material-symbols-outlined text-lg text-primary">local_shipping</span>
                                    <span className="truncate">{ARTISAN_DATA.vehicle}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setIsCallOpen(true)}
                                className="flex-1 h-16 flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-2xl">call</span>
                                Call
                            </button>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="flex-1 h-16 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 active:scale-[0.98] text-text-main border-2 border-gray-100 font-bold rounded-2xl transition-all"
                            >
                                <span className="material-symbols-outlined text-2xl text-primary">chat</span>
                                Chat
                            </button>
                        </div>

                        {/* Link to Live Status */}
                        <div className="mt-6">
                            <Link href={`/track/${jobId}/live`} className="text-[10px] text-primary font-black uppercase tracking-[0.2em] hover:underline flex items-center justify-center gap-2 group">
                                Artisan arrived? Start Job
                                <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
