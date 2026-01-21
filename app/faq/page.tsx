'use client'

import React from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white transition-colors duration-200 font-display">
            <Navigation />

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Hero Search Section */}
                <section className="mb-16">
                    <div className="relative overflow-hidden rounded-3xl bg-primary/5 p-12 text-center border border-primary/10">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1f7a45 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-text-main">How can we help?</h1>
                        <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto font-medium">
                            Explore our resource center or search for specific answers about your Artisans experience.
                        </p>
                        <div className="max-w-xl mx-auto relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full pl-12 pr-32 py-4 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-lg placeholder:text-gray-400"
                                placeholder="Search for answers (e.g., 'booking', 'payouts')..."
                                type="text"
                            />
                            <button className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-md">
                                Search
                            </button>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Sidebar Navigation (Desktop) */}
                    <aside className="lg:col-span-3 space-y-8">
                        <nav className="flex flex-col gap-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4 opacity-70">Categories</p>
                            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 transition-all text-left">
                                <span className="material-symbols-outlined text-xl">person</span>
                                For Customers
                            </button>
                            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-text-secondary font-bold transition-all text-left">
                                <span className="material-symbols-outlined text-xl">construction</span>
                                For Artisans
                            </button>
                            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-text-secondary font-bold transition-all text-left">
                                <span className="material-symbols-outlined text-xl">shield_person</span>
                                Payments & Security
                            </button>
                            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-text-secondary font-bold transition-all text-left">
                                <span className="material-symbols-outlined text-xl">policy</span>
                                Policies
                            </button>
                        </nav>

                        <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <span className="material-symbols-outlined">live_help</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">Still need help?</h3>
                            <p className="text-sm text-text-secondary mb-6 leading-relaxed font-medium">
                                Can't find the answer you're looking for? Our team is available 24/7.
                            </p>
                            <div className="flex flex-col gap-2">
                                <button className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-lg">support_agent</span>
                                    Contact Support
                                </button>
                                <button className="w-full py-3 rounded-xl border-2 border-gray-200 font-bold text-sm text-text-main hover:bg-white transition-all">
                                    View Help Center
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* FAQ Accordion Content */}
                    <section className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black tracking-tight text-text-main">For Customers</h2>
                            <span className="text-xs font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest">12 Articles</span>
                        </div>

                        <div className="space-y-4">
                            {/* FAQ Items */}
                            <FAQItem
                                question="How do I book an artisan on Artisans?"
                                answer="Simply browse the platform, select a professional based on reviews and availability, and click 'Book Now' to secure your appointment. You can view their past work, hourly rates, and customer testimonials before making a decision. Once booked, you'll receive a confirmation email and the artisan will be notified immediately."
                                defaultOpen={true}
                            />
                            <FAQItem
                                question="What is the Artisans cancellation policy?"
                                answer="Cancellations made more than 24 hours before the appointment are fully refundable. If you cancel within 24 hours, a small service fee may apply to compensate the artisan for their reserved time. You can manage your bookings directly from your dashboard under 'My Appointments'."
                            />
                            <FAQItem
                                question="How does the quality guarantee work?"
                                answer="We stand behind the quality of work performed by artisans on our platform. If you're not satisfied with the results, we offer a re-service guarantee or a partial refund depending on the situation. Our dispute resolution team is available to mediate any concerns between you and the artisan."
                            />
                            <FAQItem
                                question="Can I message an artisan before booking?"
                                answer="Yes! We encourage communication. You can use the 'Message' button on an artisan's profile to ask questions about their experience, tools, or specific requirements for your job before you commit to a booking."
                            />
                            <FAQItem
                                question="What payment methods are accepted?"
                                answer="We accept all major credit cards, debit cards, and popular digital wallets. Your payment is held securely in escrow and only released to the artisan once you confirm the job has been completed to your satisfaction."
                            />
                        </div>

                        {/* Pagination/Load More */}
                        <div className="mt-12 text-center">
                            <button className="px-10 py-4 rounded-2xl border-2 border-primary text-primary font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/5">
                                Load More Questions
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function FAQItem({ question, answer, defaultOpen = false }: { question: string, answer: string, defaultOpen?: boolean }) {
    return (
        <details className="group border border-gray-100 bg-white rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5" open={defaultOpen}>
            <summary className="flex cursor-pointer items-center justify-between gap-6 p-6 select-none list-none text-text-main">
                <p className="text-lg font-bold leading-normal">{question}</p>
                <div className="text-primary transition-transform duration-300 group-open:rotate-180">
                    <span className="material-symbols-outlined text-2xl">expand_more</span>
                </div>
            </summary>
            <div className="px-6 pb-6 animate-fadeIn">
                <p className="text-text-secondary text-base leading-relaxed font-medium">
                    {answer}
                </p>
                <div className="mt-6 flex items-center gap-6 pt-6 border-t border-gray-50">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-50">Was this helpful?</span>
                    <div className="flex gap-4">
                        <button className="text-primary hover:bg-primary/10 p-2 rounded-xl transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">thumb_up</span>
                        </button>
                        <button className="text-text-secondary hover:bg-gray-100 p-2 rounded-xl transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">thumb_down</span>
                        </button>
                    </div>
                </div>
            </div>
        </details>
    );
}
