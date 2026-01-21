"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import FadeIn from "@/components/FadeIn";

const faqs = [
    {
        question: "How do I find a verified artisan?",
        answer: "Simply use our search bar to tell us what you need. We'll match you with verified professionals in your area. You can view their profiles, ratings, and reviews before hiring."
    },
    {
        question: "Is my payment safe?",
        answer: "Yes! Payments are held in escrow until the job is completed to your satisfaction. You can release the funds through the app once the work is done."
    },
    {
        question: "How do you verify artisans?",
        answer: "We conducted strict background checks, including ID verification and skill assessment. We also rely on community reviews to maintain high standards."
    },
    {
        question: "What if I'm not satisfied with the work?",
        answer: "We have a dispute resolution center. If the work doesn't meet the agreed standards, we'll work with you and the artisan to resolve the issue or provide a refund."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 bg-brand-green-50">
            <div className="container mx-auto px-6 md:px-12 max-w-3xl">
                <FadeIn direction="up">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
                </FadeIn>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FadeIn key={index} direction="up" delay={index * 0.1}>
                            <div
                                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
                                onClick={() => toggleFAQ(index)}
                            >
                                <div className="p-6 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FaChevronDown className="text-gray-400" />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="px-6 pb-6 text-gray-600 border-t border-gray-100 pt-4">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
