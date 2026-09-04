"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaCheckCircle, FaStar, FaBriefcase } from 'react-icons/fa';
import FadeIn from '../FadeIn';

const stats = [
    {
        icon: FaUsers,
        value: 2500,
        suffix: '+',
        label: 'Verified Artisans',
        color: 'from-blue-500 to-blue-600'
    },
    {
        icon: FaBriefcase,
        value: 15000,
        suffix: '+',
        label: 'Jobs Completed',
        color: 'from-green-500 to-green-600'
    },
    {
        icon: FaStar,
        value: 4.9,
        suffix: '/5',
        label: 'Average Rating',
        color: 'from-yellow-500 to-yellow-600',
        decimal: true
    },
    {
        icon: FaCheckCircle,
        value: 98,
        suffix: '%',
        label: 'Satisfaction Rate',
        color: 'from-purple-500 to-purple-600'
    }
];

function AnimatedCounter({ value, duration = 2000, decimal = false }: { value: number; duration?: number; decimal?: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = easeOutQuart * value;

            setCount(currentCount);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return (
        <span>
            {decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}
        </span>
    );
}

export default function TrustBadges() {
    return (
        <section className="py-16 md:py-20 bg-gradient-to-br from-brand-green to-green-600">
            <div className="container mx-auto px-4 md:px-6">
                <FadeIn direction="up">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Trusted by thousands across Nigeria
                        </h2>
                        <p className="text-white/90 text-lg">
                            Join the fastest-growing platform for home services
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {stats.map((stat, index) => (
                        <FadeIn key={stat.label} delay={index * 0.1} direction="up">
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center"
                            >
                                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4`}>
                                    <stat.icon size={28} />
                                </div>
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                    <AnimatedCounter value={stat.value} decimal={stat.decimal} />
                                    {stat.suffix}
                                </div>
                                <p className="text-white/80 font-medium">
                                    {stat.label}
                                </p>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={0.5} direction="up">
                    <div className="text-center mt-12">
                        <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-white" />
                                <span>Background Verified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-white" />
                                <span>Insured Professionals</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-white" />
                                <span>Secure Payments</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-white" />
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
