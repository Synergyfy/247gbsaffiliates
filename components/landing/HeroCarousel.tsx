"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
    {
        title: "Professional Ecosystem",
        role: "Agents",
        description: "Empowering agents with a seamless workflow to manage tasks, track progress, and deliver excellence in every project.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000&auto=format&fit=crop",
        cta: "Start as Agent",
        href: "/role-selection"
    },
    {
        title: "Enterprise Scale",
        role: "Account Managers",
        description: "Drive large-scale operations with powerful tools designed for oversight, team coordination, and strategic client management.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop",
        cta: "Manage Projects",
        href: "/role-selection"
    },
    {
        title: "Strategic Growth",
        role: "Consultants",
        description: "Share your expertise and drive impact. Connect with businesses seeking high-level strategy and specialized professional insights.",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2000&auto=format&fit=crop",
        cta: "Become Consultant",
        href: "/role-selection"
    }
];

export function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[600px] lg:h-[700px] overflow-hidden rounded-4xl bg-slate-900 border border-slate-800 shadow-2xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 scale-110"
                        style={{ backgroundImage: `url(${slides[current].image})` }}
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-slate-900/60 via-slate-900/80 to-slate-900/95" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center text-center px-6 md:px-12">
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-primary font-display font-semibold tracking-wider uppercase text-sm mb-4"
                        >
                            For {slides[current].role}
                        </motion.span>

                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight"
                        >
                            {slides[current].title}
                        </motion.h1>

                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="max-w-2xl text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-body"
                        >
                            {slides[current].description}
                        </motion.p>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Link
                                href={slides[current].href}
                                className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-display font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/25"
                            >
                                {slides[current].cta}
                                <span className="material-symbols-outlined ml-2">arrow_forward</span>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-2 transition-all duration-300 rounded-full ${current === index ? "w-12 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
                            }`}
                    />
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-20"
            >
                <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
                onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-20"
            >
                <span className="material-symbols-outlined">chevron_right</span>
            </button>
        </div>
    );
}
