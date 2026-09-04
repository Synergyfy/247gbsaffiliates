import Link from "next/link";
import Image from "next/image";
import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";

export default function ForAgentPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-text-main selection:bg-primary/20">
            <LandingHeader />

            {/* Hero Section */}
            <section className="px-6 lg:px-40 py-12 lg:py-20 flex justify-center">
                <div className="max-w-[1240px] w-full">
                    <div className="relative w-full h-[600px] lg:h-[700px] overflow-hidden rounded-4xl bg-white border border-slate-200 shadow-2xl">
                        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2000&auto=format&fit=crop')" }}></div>
                        <div className="absolute inset-0 bg-linear-to-b from-white/60 via-white/80 to-white/95"></div>

                        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 md:px-12">
                            <span className="text-primary font-display font-semibold tracking-wider uppercase text-sm mb-4">For Agents</span>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-text-main mb-6 leading-tight">
                                Become a Top-Tier Agent
                            </h1>
                            <p className="max-w-2xl text-lg md:text-xl text-text-secondary mb-10 leading-relaxed font-body">
                                Access high-volume workflows, level up your career, and get paid instantly. The platform built for elite performance.
                            </p>
                            <Link href="/role-selection" className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-display font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/25">
                                Get Verified
                                <span className="material-symbols-outlined ml-2">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-6 lg:px-40 py-24 bg-primary text-white">
                <div className="max-w-[1240px] mx-auto grid grid-cols-3 md:grid-cols-3 gap-12 text-center">
                    <div className="space-y-2">
                        <p className="text-4xl lg:text-5xl font-bold font-display">50k+</p>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Tasks Completed</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-4xl lg:text-5xl font-bold font-display">1,200</p>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Active Agents</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-4xl lg:text-5xl font-bold font-display">Instant</p>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Payout Velocity</p>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="px-6 lg:px-40 py-24 flex justify-center bg-white">
                <div className="max-w-[1240px] w-full">
                    <div className="flex flex-col gap-20 text-center items-center">
                        <div className="space-y-4">
                            <span className="text-primary font-bold tracking-widest uppercase text-xs">The Agent Advantage</span>
                            <h2 className="text-text-main tracking-tight text-4xl lg:text-5xl font-bold font-display leading-tight max-w-[900px]">
                                Engineered for Excellence
                            </h2>
                            <p className="text-text-secondary text-lg lg:text-xl font-medium max-w-[700px] mx-auto leading-relaxed">
                                We've stripped away the noise. 247gbs provides the tools you need to maximize your output and build a legitimate career.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
                            {[
                                { title: "High Volume Task Feed", desc: "Our proprietary algorithm routes tasks matching your specific skill profile in real-time. Zero downtime between gigs.", icon: "list_alt", color: "bg-primary" },
                                { title: "Skill-Based Progression", desc: "Move from Junior Agent to Operations Manager roles. Unlock higher-paying tiers and leadership responsibilities.", icon: "trending_up", color: "bg-primary" },
                                { title: "Instant Payouts", desc: "No more waiting 30 days for payment. Once your task is verified, funds are available for immediate withdrawal.", icon: "bolt", color: "bg-primary" }
                            ].map((feature, i) => (
                                <div key={i} className="group flex flex-col gap-8 rounded-[2.5rem] border border-primary/5 bg-background-light p-12 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                                    <div className={`flex size-16 items-center justify-center rounded-2xl ${feature.color} text-white shadow-xl transition-transform group-hover:rotate-12`}>
                                        <span className="material-symbols-outlined text-4xl">{feature.icon}</span>
                                    </div>
                                    <div className="flex flex-col gap-4 relative z-10">
                                        <h3 className="text-text-main text-2xl font-bold font-display tracking-tight">{feature.title}</h3>
                                        <p className="text-text-secondary text-base lg:text-lg leading-relaxed font-medium">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 lg:px-40 py-24 flex justify-center bg-white">
                <div className="max-w-[1100px] w-full rounded-3xl bg-primary px-8 py-24 text-center flex flex-col items-center gap-12 shadow-2xl shadow-primary/40 relative overflow-hidden group">
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-white text-5xl lg:text-7xl font-bold font-display leading-tight tracking-tight">Ready to start?</h2>
                        <p className="text-white/90 text-2xl font-medium max-w-[700px] mx-auto">The verification process takes less than 5 minutes. Join the elite network of agents today.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-8 relative z-10 pt-4">
                        <Link href="/role-selection" className="bg-text-main text-white px-14 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all text-center font-display">Get Verified Now</Link>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}
