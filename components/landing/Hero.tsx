"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaSearch, FaHammer, FaHardHat } from "react-icons/fa";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-brand-green-50 py-20 md:py-32">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900"
                    >
                        Find the Perfect Artisan <br />
                        <span className="text-brand-green">In Minutes</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        The "Bolt for Artisans". Connect with verified electricians, plumbers, and carpenters near you instantly. Reliable service, transparent pricing.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
                    >
                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder="What help do you need?"
                                className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent shadow-sm"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-green text-white rounded-md hover:bg-brand-green-hover transition-colors">
                                <FaSearch />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex justify-center gap-4 mt-8 text-sm text-gray-500"
                    >
                        <span className="flex items-center gap-1"><FaHardHat className="text-brand-green" /> Verified Pros</span>
                        <span className="flex items-center gap-1"><FaHammer className="text-brand-green" /> Instant Booking</span>
                    </motion.div>
                </div>
            </div>

            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 bg-brand-green rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-brand-green rounded-full blur-3xl"></div>
            </div>
        </section>
    );
}
