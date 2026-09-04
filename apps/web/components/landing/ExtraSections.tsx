import React from 'react';

export default function MoreLandingSections() {
    return (
        <div className="flex flex-col items-center">
            {/* 1. Trust & Safety Section */}
            <section className="w-full max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col gap-4 mb-16">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-text-main">Your Peace of Mind is Our Priority</h2>
                    <p className="text-text-secondary max-w-2xl text-lg font-medium">We ensure every job is handled with the utmost care and professional standards through our multi-layered safety protocols.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col gap-6 p-10 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-3 text-text-main">Verified Pros</h3>
                            <p className="text-text-secondary font-medium leading-relaxed">Every artisan undergoes rigorous identity verification and background checks before joining.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 p-10 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-3xl">task_alt</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-3 text-text-main">Work Guarantee</h3>
                            <p className="text-text-secondary font-medium leading-relaxed">Not happy? We'll make it right. Your satisfaction is promised on every project we complete.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 p-10 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-3xl">shield_with_heart</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-3 text-text-main">Insurance Coverage</h3>
                            <p className="text-text-secondary font-medium leading-relaxed">Full protection for your property. We carry comprehensive insurance for all active job sites.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Newsletter / Community Section */}
            <section className="w-full bg-gray-50 py-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <span className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4">Join the Community</span>
                    <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-text-main mb-6">Stay in the Loop</h2>
                    <p className="text-xl text-text-secondary font-medium leading-relaxed max-w-2xl mb-12">
                        Get expert home maintenance tips, exclusive discounts, and artisan spotlights delivered straight to your inbox.
                    </p>

                    <form className="w-full max-w-md flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 font-medium placeholder:text-gray-400 outline-none transition-all shadow-sm"
                        />
                        <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap">
                            Subscribe
                        </button>
                    </form>
                    <p className="mt-6 text-xs text-text-secondary font-bold uppercase tracking-widest">No spam, just value. Unsubscribe anytime.</p>
                </div>
            </section>

            {/* 3. Blog & Resources Section */}
            <section className="w-full max-w-7xl mx-auto px-6 py-24">
                <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-black tracking-tight text-text-main">Tips from the Pros</h2>
                        <p className="text-text-secondary text-lg font-medium">Expert advice on home maintenance and repair.</p>
                    </div>
                    <a className="text-primary font-black flex items-center gap-2 hover:gap-3 transition-all hover:underline" href="#">
                        View all articles <span className="material-symbols-outlined">arrow_forward</span>
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="group cursor-pointer">
                        <div className="w-full aspect-4/3 rounded-3xl mb-6 overflow-hidden bg-gray-100 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1504148455328-497c596d2d58?q=80&w=600" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Blog Post" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 text-text-main group-hover:text-primary transition-colors">How to choose the right plumber</h3>
                        <p className="text-text-secondary mb-4 text-base font-medium line-clamp-2">Avoid common pitfalls and expensive mistakes with our expert guide to vetting local plumbing professionals.</p>
                        <span className="text-primary text-sm font-black uppercase tracking-widest group-hover:underline">Read More</span>
                    </div>
                    <div className="group cursor-pointer">
                        <div className="w-full aspect-4/3 rounded-3xl mb-6 overflow-hidden bg-gray-100 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Blog Post" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 text-text-main group-hover:text-primary transition-colors">DIY vs. Pro: When to call an expert</h3>
                        <p className="text-text-secondary mb-4 text-base font-medium line-clamp-2">Know exactly when to grab your own tools and when it's safer (and cheaper) to call in a certified expert.</p>
                        <span className="text-primary text-sm font-black uppercase tracking-widest group-hover:underline">Read More</span>
                    </div>
                    <div className="group cursor-pointer">
                        <div className="w-full aspect-4/3 rounded-3xl mb-6 overflow-hidden bg-gray-100 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Blog Post" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 text-text-main group-hover:text-primary transition-colors">Preparing for Renovations</h3>
                        <p className="text-text-secondary mb-4 text-base font-medium line-clamp-2">Ensure your home and family are ready for the big change. A checklist for a stress-free renovation process.</p>
                        <span className="text-primary text-sm font-black uppercase tracking-widest group-hover:underline">Read More</span>
                    </div>
                </div>
            </section>

            {/* 4. Artisans for Business */}
            <section className="w-full px-6 py-24 mb-24">
                <div className="max-w-7xl mx-auto bg-primary text-white rounded-[3rem] p-10 md:p-20 flex flex-col lg:flex-row gap-16 items-center relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="absolute -right-20 -top-20 size-80 bg-white/10 rounded-full blur-[100px]"></div>
                    <div className="absolute -left-20 -bottom-20 size-80 bg-black/10 rounded-full blur-[100px]"></div>
                    <div className="flex-1 z-10">
                        <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">Enterprise Solutions</span>
                        <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight">Enterprise-Grade Maintenance</h2>
                        <p className="text-white/80 text-xl mb-10 max-w-xl font-medium leading-relaxed">Scale your property maintenance with Artisans for Business. Tailored solutions for property managers, corporate offices, and retail chains.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white/90">event_available</span>
                                </div>
                                <span className="font-bold text-lg">Priority Scheduling</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white/90">receipt_long</span>
                                </div>
                                <span className="font-bold text-lg">Bulk Billing</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white/90">support_agent</span>
                                </div>
                                <span className="font-bold text-lg">Account Managers</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white/90">analytics</span>
                                </div>
                                <span className="font-bold text-lg">Performance Reports</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-white text-primary px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all shadow-xl shadow-black/10">Contact Sales</button>
                            <button className="bg-white/10 border-2 border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all">Learn More</button>
                        </div>
                    </div>
                    <div className="flex-1 w-full lg:max-w-md z-10">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-2xl">
                            <h4 className="text-2xl font-black mb-6">Trusted by industry leaders</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black italic text-lg border border-white/5">ProManage</div>
                                <div className="h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black italic text-lg border border-white/5">UrbanStay</div>
                                <div className="h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black italic text-lg border border-white/5">CorpSuite</div>
                                <div className="h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black italic text-lg border border-white/5">MetroDev</div>
                            </div>
                            <div className="mt-10 pt-10 border-t border-white/10">
                                <p className="text-base italic text-white/80 font-medium leading-relaxed">"Artisans transformed how we manage our 200+ residential units. The bulk billing feature alone saved us 15 hours of admin work per week."</p>
                                <div className="mt-8 flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center font-bold">SC</div>
                                    <div>
                                        <p className="text-base font-black">Sarah Chen</p>
                                        <p className="text-sm text-white/60 font-medium uppercase tracking-wider">Operations Director, ProManage</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
