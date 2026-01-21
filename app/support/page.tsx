'use client'

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const FAQS = [
    {
        question: "How do I book a service?",
        answer: "You can book a service by searching for the trade you need, browsing the profiles of verified local artisans, and selecting a time that works for you. You'll get an upfront price quote instantly."
    },
    {
        question: "Is my payment secure?",
        answer: "Yes, all payments are held in escrow via Artisans SafePay. The funds are only released to the artisan once you confirm the work has been completed to your satisfaction."
    },
    {
        question: "What if I'm not happy with the work?",
        answer: "Our Happiness Guarantee covers your project up to ₦100,000 for damage or poor workmanship. If you're not satisfied, our dispute resolution team will step in to help."
    },
    {
        question: "How are artisans verified?",
        answer: "Every artisan undergoes a rigorous background check, including ID verification, reference checks, and a skill assessment by a master craftsman in their field."
    }
];

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white text-text-main transition-colors duration-300 font-display">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-20 overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-[1400px] mx-auto text-center relative z-10">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-6"
                    >
                        Artisans Help Center
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl lg:text-7xl font-black tracking-tight text-text-main leading-[1.1] mb-10"
                    >
                        How can we <span className="text-primary">help you?</span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto relative group"
                    >
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-primary text-2xl">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-2 border-gray-100 rounded-4xl py-6 pl-16 pr-8 text-lg font-bold shadow-xl shadow-primary/5 focus:border-primary/50 outline-none transition-all"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Quick Links Section */}
            <section className="py-24 px-6 lg:px-20 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-primary/5 group"
                    >
                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-4xl!">book</span>
                        </div>
                        <h3 className="text-2xl font-black text-text-main mb-4">User Manual</h3>
                        <p className="text-text-secondary font-medium leading-relaxed mb-6">Learn how to make the most of the Artisans platform with our detailed guides.</p>
                        <Link href="#" className="text-primary font-black flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                            Read Guides <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-primary/5 group"
                    >
                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-4xl!">contact_support</span>
                        </div>
                        <h3 className="text-2xl font-black text-text-main mb-4">Contact Support</h3>
                        <p className="text-text-secondary font-medium leading-relaxed mb-6">Can't find what you're looking for? Our team is available 24/7 to assist you.</p>
                        <Link href="#" className="text-primary font-black flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                            Get in Touch <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-primary/5 group"
                    >
                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-4xl!">security</span>
                        </div>
                        <h3 className="text-2xl font-black text-text-main mb-4">Safety & Trust</h3>
                        <p className="text-text-secondary font-medium leading-relaxed mb-6">Your safety is our priority. Learn about our verification and insurance policies.</p>
                        <Link href="#" className="text-primary font-black flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                            Our Policies <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 lg:px-20 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4">Frequently Asked Questions</p>
                        <h2 className="text-4xl font-black text-text-main tracking-tight">Got questions? We've got answers.</h2>
                    </div>

                    <div className="space-y-4">
                        {FAQS.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left"
                                >
                                    <span className="text-lg font-bold text-text-main">{faq.question}</span>
                                    <span className={`material-symbols-outlined text-primary transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}>
                                        keyboard_arrow_down
                                    </span>
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{ height: activeFaq === index ? 'auto' : 0, opacity: activeFaq === index ? 1 : 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-8 pb-8 text-text-secondary font-medium leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-24 px-6 lg:px-20 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-black text-text-main tracking-tight leading-tight mb-8">
                            Still need some <span className="text-primary">extra help?</span>
                        </h2>
                        <p className="text-lg text-text-secondary font-medium leading-relaxed mb-10">
                            Send us a message and our support specialist will get back to you within 2-4 hours. You can also reach us via live chat.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined">mail</span>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Email us at</p>
                                    <p className="text-xl font-black text-text-main">support@artisans.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined">forum</span>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Live Chat</p>
                                    <p className="text-xl font-black text-text-main">Start a conversation</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 lg:p-14 bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-primary/5">
                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Full Name</label>
                                    <input type="text" className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 font-bold" placeholder="your name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Email Address</label>
                                    <input type="email" className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 font-bold" placeholder="your@email.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Subject</label>
                                <select className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 font-bold appearance-none">
                                    <option>Billing Question</option>
                                    <option>Technical Issue</option>
                                    <option>Dispute Resolution</option>
                                    <option>Feedback</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Message</label>
                                <textarea rows={4} className="w-full bg-white border border-gray-100 rounded-3xl py-4 px-6 font-bold resize-none" placeholder="What's on your mind?"></textarea>
                            </div>
                            <button className="w-full py-5 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]">
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer Branding Area */}
            <footer className="py-20 border-t border-gray-100 text-center px-6">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="bg-primary p-1.5 rounded-lg text-white">
                        <span className="material-symbols-outlined text-xl font-bold">handyman</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight text-text-main">Artisans</span>
                </div>
                <p className="text-text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-4">Crafted for Excellence • Since 2024</p>
                <div className="flex justify-center gap-10 text-xs font-black uppercase tracking-widest text-text-secondary">
                    <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Safety</Link>
                </div>
            </footer>
        </div>
    );
}
