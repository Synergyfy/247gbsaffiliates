"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaHardHat, FaHammer, FaCheckCircle } from 'react-icons/fa';

const slides = [
    {
        role: 'Client',
        headline: (
            <>
                <span className="text-brand-green">Find trusted artisans</span> near you — fast, verified, reliable
            </>
        ),
        subhead: 'Connect with skilled electricians, plumbers, and carpenters in minutes. Transparent pricing, verified professionals.',
        image: '/hero/client_hero.png',
        cta: 'Find Artisans'
    },
    {
        role: 'Artisan',
        headline: (
            <>
                Grow your business with <span className="text-brand-green">guaranteed jobs</span>
            </>
        ),
        subhead: 'Join our platform, showcase your skills, and get matched with clients who need your expertise.',
        image: '/hero/artisan_hero.png',
        cta: 'Join as Professional'
    },
    {
        role: 'Admin',
        headline: (
            <>
                Manage your platform with <span className="text-brand-green">powerful tools</span>
            </>
        ),
        subhead: 'Oversee users, verify artisans, monitor tasks, and track revenue with comprehensive admin controls.',
        image: '/hero/admin_hero.png',
        cta: 'Admin Dashboard'
    }
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Navigate to search results or filter artisans
        console.log('Searching for:', searchQuery);
    };

    return (
        <section className="relative overflow-hidden py-8 md:py-12 lg:py-20 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Background Image */}
            <div className="absolute inset-0 -z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={slides[currentSlide].image}
                            alt={`${slides[currentSlide].role} - Artisans`}
                            fill
                            className="object-cover object-center"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
                {/* Dark overlay for better contrast */}
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 mb-8 md:mb-12">
                    {/* Text Content */}
                    <div className="flex-1 w-full md:max-w-xl flex flex-col md:min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-block w-fit py-1 px-3 rounded-full bg-brand-green/10 text-brand-green text-sm font-bold mb-3 md:mb-4 border border-brand-green/20">
                                    For {slides[currentSlide].role}s
                                </span>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 md:mb-6">
                                    {slides[currentSlide].headline}
                                </h1>
                                <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                                    {slides[currentSlide].subhead}
                                </p>
                                <Link href="/signup">
                                    <button className="bg-brand-green text-white px-6 md:px-8 py-3 rounded-xl font-medium hover:bg-brand-green-hover transition-colors shadow-lg text-base md:text-lg">
                                        {slides[currentSlide].cta}
                                    </button>
                                </Link>
                            </motion.div>
                        </AnimatePresence>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-wrap gap-4 mt-8 text-sm text-white/80"
                        >
                            <span className="flex items-center gap-2">
                                <FaHardHat className="text-brand-green" /> Verified Pros
                            </span>
                            <span className="flex items-center gap-2">
                                <FaHammer className="text-brand-green" /> Instant Booking
                            </span>
                            <span className="flex items-center gap-2">
                                <FaCheckCircle className="text-brand-green" /> Secure Payments
                            </span>
                        </motion.div>
                    </div>

                    {/* Slide Indicators */}
                    <div className="hidden md:flex flex-col gap-3 mt-20">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all ${index === currentSlide
                                    ? 'bg-brand-green w-12'
                                    : 'bg-white/30 w-8 hover:bg-white/50'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="relative z-20 max-w-2xl mx-auto mt-8 md:mt-12"
                >
                    <form onSubmit={handleSearch} className="bg-white p-3 rounded-xl shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-2 hover:shadow-3xl transition-shadow duration-300">
                        <div className="flex-1 w-full px-4 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0">
                            <label htmlFor="service-search" className="sr-only">What service do you need?</label>
                            <div className="flex items-center">
                                <FaSearch className="text-gray-400 mr-3" />
                                <input
                                    type="text"
                                    id="service-search"
                                    placeholder="What help do you need? (e.g., Plumber, Electrician)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full outline-none text-gray-900 placeholder-gray-500 h-10"
                                />
                            </div>
                        </div>

                        <div className="flex w-full md:w-auto gap-2">
                            <button
                                type="button"
                                className="flex-1 md:flex-none px-6 py-3 text-gray-600 hover:text-brand-green font-medium text-sm border-r border-gray-200 transition-colors"
                            >
                                Filters
                            </button>
                            <button
                                type="submit"
                                className="flex-1 md:flex-none bg-brand-green text-white px-8 py-3 rounded-xl hover:bg-brand-green-hover transition-all font-bold shadow-md flex items-center justify-center gap-2 active:scale-95"
                            >
                                <FaSearch />
                                Search
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Mobile Slide Indicators */}
                <div className="flex md:hidden justify-center gap-2 mt-8">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentSlide
                                ? 'bg-brand-green w-8'
                                : 'bg-white/30 w-2 hover:bg-white/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
