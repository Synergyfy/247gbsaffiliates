"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

const testimonials = [
    {
        quote: "Artisans made finding reliable artisans incredibly easy. The whole process was smooth and I got my electrical work done within days!",
        author: "Chioma Adeyemi",
        role: "Homeowner, Lagos",
    },
    {
        quote: "As an artisan, this platform has transformed my business. I get consistent work and the clients are verified and professional.",
        author: "Tunde Okafor",
        role: "Electrician, Abuja",
    },
    {
        quote: "The admin tools are powerful yet easy to use. Managing the platform and verifying artisans has never been simpler.",
        author: "Amina Bello",
        role: "Platform Manager, Port Harcourt",
    },
];

const GeometricPattern = () => (
    <div className="absolute top-6 left-6 grid grid-cols-4 gap-2 opacity-60">
        {[...Array(16)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className={`w-6 h-6 rounded-md ${[0, 1, 4, 5, 8, 12].includes(i)
                    ? "bg-white/40"
                    : "bg-transparent"
                    }`}
            />
        ))}
    </div>
);

interface OnboardingLayoutProps {
    children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
    const { currentStep, totalSteps, prevStep } = useOnboardingStore();
    const router = useRouter();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const progress = ((currentStep + 1) / totalSteps) * 100;

    const nextTestimonial = () => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const handleBack = () => {
        if (currentStep === 0) {
            router.push('/signup');
        } else {
            prevStep();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
            >
                {/* Left Panel - Testimonial */}
                <div className="relative hidden lg:flex flex-col h-full overflow-hidden bg-linear-to-br from-brand-green to-green-600">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    </div>

                    <GeometricPattern />

                    {/* Logo Badge */}
                    <div className="relative z-10 p-8 flex justify-end">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">Artisans</span>
                        </div>
                    </div>

                    {/* Content pushed to bottom */}
                    <div className="relative z-10 mt-auto p-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTestimonial}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <p className="text-white text-2xl font-medium leading-relaxed mb-6 italic">
                                    "{testimonials[currentTestimonial].quote}"
                                </p>
                                <div>
                                    <p className="text-white font-semibold text-lg">
                                        {testimonials[currentTestimonial].author}
                                    </p>
                                    <p className="text-white/60 text-sm">
                                        {testimonials[currentTestimonial].role}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={prevTestimonial}
                                aria-label="Previous testimonial"
                                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 transition-all"
                            >
                                <FiChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextTestimonial}
                                aria-label="Next testimonial"
                                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 transition-all"
                            >
                                <FiChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Content */}
                <div className="p-6 md:p-10 flex flex-col min-h-[600px]">
                    {/* Logo & Progress */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">A</span>
                            </div>
                            <span className="font-semibold text-gray-900">Artisans</span>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Step {currentStep + 1} of {totalSteps}
                            </span>
                            <div className="flex gap-1">
                                {Array.from({ length: totalSteps }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-colors ${i <= currentStep ? "bg-brand-green" : "bg-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-100 w-full relative mb-8 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute left-0 top-0 h-full bg-brand-green"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* Back Button */}
                    {currentStep > 0 && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <FiChevronLeft size={20} />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                    )}

                    {/* Dynamic Content */}
                    <div className="flex-1 flex flex-col">
                        <AnimatePresence mode="wait">
                            {children}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
