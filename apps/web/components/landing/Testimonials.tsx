"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import FadeIn from '../FadeIn';

const testimonials = [
    {
        id: 1,
        name: "Ngozi Okafor",
        role: "Homeowner, Lagos",
        quote: "Artisans made finding a reliable electrician so easy. The whole process was smooth and the artisan arrived on time. Highly recommended!",
        rating: 5,
    },
    {
        id: 2,
        name: "Ibrahim Musa",
        role: "Business Owner, Abuja",
        quote: "As someone who manages multiple properties, Artisans has been a game-changer. I can find verified professionals quickly and track all my service requests in one place.",
        rating: 5,
    },
    {
        id: 3,
        name: "Chioma Adeyemi",
        role: "Apartment Resident, Port Harcourt",
        quote: "The platform is so user-friendly and the artisans are professional. I've used it for plumbing and carpentry work - both times were excellent experiences.",
        rating: 4,
    }
];

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    useEffect(() => {
        const timer = setInterval(nextTestimonial, 6000);
        return () => clearInterval(timer);
    }, []);

    const current = testimonials[currentIndex];

    return (
        <section className="py-20 bg-white border-t border-gray-100">
            <div className="container mx-auto px-6 md:px-12">
                <FadeIn direction="up">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
                        Trusted by thousands
                    </h2>
                </FadeIn>

                {/* Testimonial Card */}
                <FadeIn direction="up" delay={0.2}>
                    <div className="bg-white rounded-3xl p-8 md:p-12 relative flex flex-col md:flex-row items-center gap-8 md:gap-12 shadow-sm max-w-4xl mx-auto mb-20 min-h-[300px]">
                        {/* Navigation Arrows */}
                        <button
                            onClick={prevTestimonial}
                            className="absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-brand-green hover:bg-gray-50 transition-colors z-10 border border-gray-100"
                            aria-label="Previous testimonial"
                        >
                            <FaChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextTestimonial}
                            className="absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-brand-green hover:bg-gray-50 transition-colors z-10 border border-gray-100"
                            aria-label="Next testimonial"
                        >
                            <FaChevronRight size={20} />
                        </button>

                        {/* Profile Image */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-brand-green/20 shrink-0 relative bg-linear-to-br from-brand-green/20 to-brand-green/5 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={current.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-3xl font-bold text-brand-green"
                                >
                                    {current.name.split(' ').map(n => n[0]).join('')}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Content */}
                        <div className="text-center md:text-left flex-1">
                            <div className="flex justify-center md:justify-start mb-4 text-yellow-400 gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        size={16}
                                        className={i < current.rating ? "text-yellow-400" : "text-gray-300"}
                                    />
                                ))}
                            </div>
                            <div className="min-h-[80px] flex items-center justify-center md:justify-start mb-6">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={current.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-gray-600 text-lg italic leading-relaxed"
                                    >
                                        "{current.quote}"
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                            <div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={current.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h4 className="font-bold text-gray-900">{current.name}</h4>
                                        <p className="text-gray-500 text-sm">{current.role}</p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Slide Indicators */}
                <div className="flex justify-center gap-2 mb-16 -mt-10">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all ${index === currentIndex
                                ? 'bg-brand-green w-6'
                                : 'bg-gray-300 w-2 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Partner Logos */}
                <FadeIn direction="up" delay={0.4}>
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-8">
                            Trusted Partners
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="text-xl font-bold text-gray-400">SECURE PAY</div>
                            <div className="text-xl font-bold text-gray-400">VERIFY PRO</div>
                            <div className="text-xl font-bold text-gray-400">TRUST BADGE</div>
                            <div className="text-xl font-bold text-gray-400">HOME SAFE</div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
