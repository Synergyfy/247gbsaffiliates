"use client";

import { motion } from "framer-motion";
import { FaSearch, FaHandshake, FaTools, FaCheckCircle } from "react-icons/fa";
import FadeIn from '../FadeIn';

const steps = [
    {
        number: "01",
        icon: FaSearch,
        title: "Search & Browse",
        description: "Find verified artisans by service type, location, and ratings. View profiles, reviews, and pricing.",
        color: "from-blue-500 to-blue-600"
    },
    {
        number: "02",
        icon: FaHandshake,
        title: "Book & Connect",
        description: "Select your preferred professional, discuss requirements, and schedule a convenient time.",
        color: "from-green-500 to-green-600"
    },
    {
        number: "03",
        icon: FaTools,
        title: "Get It Done",
        description: "The artisan completes the job professionally. Track progress and communicate in real-time.",
        color: "from-purple-500 to-purple-600"
    },
    {
        number: "04",
        icon: FaCheckCircle,
        title: "Pay & Review",
        description: "Make secure payments and leave a review. Build trust in our community.",
        color: "from-orange-500 to-orange-600"
    }
];

export default function HowItWorks() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <FadeIn direction="up">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How it works
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Get professional help in four simple steps
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {steps.map((step, index) => (
                        <FadeIn key={step.number} delay={index * 0.1} direction="up">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="relative"
                            >
                                {/* Connector Line (hidden on mobile and last item) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-brand-green/30 to-transparent -z-10" />
                                )}

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                                    {/* Number Badge */}
                                    <div className="text-6xl font-bold text-brand-green/10 mb-4">
                                        {step.number}
                                    </div>

                                    {/* Icon */}
                                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${step.color} text-white mb-4 -mt-12`}>
                                        <step.icon size={28} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={0.5} direction="up">
                    <div className="text-center mt-12">
                        <button className="bg-brand-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-green-hover transition-colors shadow-lg">
                            Get Started Now
                        </button>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
