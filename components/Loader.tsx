'use client'

import { motion } from "framer-motion";

interface LoaderProps {
    text?: string;
    metaText?: string;
    progress?: number;
}

export default function Loader({
    text = "Gathering the best experts...",
    metaText = "Measuring twice, cutting once",
    progress = 72
}: LoaderProps) {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background-light font-display antialiased">
            {/* Subtle Background Detail */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_60%,rgba(31,122,69,0.03)_100%)]"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10"></div>

            <div className="layout-container flex h-full grow flex-col w-full items-center justify-center px-6 relative z-10">
                <div className="layout-content-container flex flex-col max-w-[480px] w-full items-center">

                    {/* Artisan Logo Section */}
                    <div className="mb-12 flex flex-col items-center">
                        <div className="relative size-24 mb-8">
                            {/* Stylized House Frame */}
                            <motion.div
                                animate={{ rotate: [45, 45, 45], scale: [1, 1.05, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 border-[3px] border-primary/20 rounded-xl transform rotate-45 flex items-center justify-center"
                            >
                                <div className="transform -rotate-45 text-primary">
                                    <span className="material-symbols-outlined text-5xl! opacity-80">home_repair_service</span>
                                </div>
                            </motion.div>

                            {/* Floating Tool Icons (Animated) */}
                            <motion.div
                                animate={{ y: [0, -10, 0], x: [0, 5, 0], rotate: [0, 15, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-3 -right-3 bg-white p-2.5 rounded-full shadow-lg border border-primary/10 text-primary z-20"
                            >
                                <span className="material-symbols-outlined text-xl!">build</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0], x: [0, -5, 0], rotate: [0, -15, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute -bottom-3 -left-3 bg-white p-2.5 rounded-full shadow-lg border border-primary/10 text-primary z-20"
                            >
                                <span className="material-symbols-outlined text-xl!">handyman</span>
                            </motion.div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="text-primary">
                                <svg className="size-6" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"></path>
                                </svg>
                            </div>
                            <h2 className="text-text-main text-2xl font-black tracking-tight leading-tight">Artisans</h2>
                        </div>
                    </div>

                    {/* Text & Progress Area */}
                    <div className="w-full flex flex-col items-center gap-8">
                        <div className="text-center space-y-2">
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-text-main tracking-tight text-xl font-black leading-tight px-4"
                            >
                                {text}
                            </motion.h2>
                            <p className="text-primary font-black text-[10px] tracking-[0.2em] uppercase opacity-60">
                                {metaText}
                            </p>
                        </div>

                        {/* ProgressBar Component */}
                        <div className="w-full max-w-[320px] flex flex-col gap-4 p-4">
                            <div className="flex justify-between items-end px-1">
                                <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">System Check</p>
                                <p className="text-text-main text-sm font-black tabular-nums">{progress}%</p>
                            </div>
                            <div className="rounded-full bg-primary/10 overflow-hidden h-2 w-full border border-primary/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full bg-primary shadow-[0_0_12px_rgba(31,122,69,0.3)]"
                                ></motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Industry Context Content */}
                    <div className="mt-20 grid grid-cols-3 gap-10 w-full border-t border-primary/5 pt-12 px-4 opacity-40">
                        <div className="flex flex-col items-center text-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">architecture</span>
                            <p className="text-[9px] font-black text-text-main uppercase tracking-widest">Precision</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                            <p className="text-[9px] font-black text-text-main uppercase tracking-widest">Certified</p>
                        </div>
                        <div className="flex flex-col items-center text-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">brush</span>
                            <p className="text-[9px] font-black text-text-main uppercase tracking-widest">Finishing</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-12 flex flex-col items-center gap-3 opacity-60">
                <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">Crafted for Excellence</p>
                <div className="flex gap-1.5">
                    <div className="size-1 rounded-full bg-primary/20"></div>
                    <div className="size-1 rounded-full bg-primary animate-pulse"></div>
                    <div className="size-1 rounded-full bg-primary/20"></div>
                </div>
            </footer>
        </div>
    );
}
