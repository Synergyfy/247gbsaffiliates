'use client'

import Navigation from "@/components/Navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";

const SERVICES = [
    {
        id: 'electrical',
        title: "Electrical Mastery",
        description: "From smart home integration to complex wiring layouts, our master electricians ensure precision and safety in every connection.",
        icon: "bolt",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2669&auto=format&fit=crop",
        tags: ["Wiring", "Smart Home", "Repairs"]
    },
    {
        id: 'plumbing',
        title: "Advanced Plumbing",
        description: "Modern fixture installation, leak detection, and master piping systems designed for long-term reliability and efficiency.",
        icon: "water_drop",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop",
        tags: ["Piping", "Installation", "Emergency"]
    },
    {
        id: 'carpentry',
        title: "Fine Carpentry",
        description: "Custom cabinetry, detailed structural framing, and restorative woodwork that brings elegance and warmth to your living space.",
        icon: "architecture",
        image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2669&auto=format&fit=crop",
        tags: ["Custom", "Restoration", "Furniture"]
    },
    {
        id: 'masonry',
        title: "Structural Masonry",
        description: "Precision brickwork, stone elevation, and expert tiling that builds the foundation of aesthetic and structural excellence.",
        icon: "foundation",
        image: "https://images.unsplash.com/photo-1541888941259-79974df19644?q=80&w=2670&auto=format&fit=crop",
        tags: ["Stone", "Tile", "Structural"]
    },
    {
        id: 'painting',
        title: "Artistic Finishing",
        description: "Exterior coating, premium interior finishing, and decorative textures applied by master painters for a flawless environment.",
        icon: "format_paint",
        image: "https://images.unsplash.com/photo-1589939705384-5185138a047a?q=80&w=2670&auto=format&fit=crop",
        tags: ["Interior", "Exterior", "Textures"]
    },
    {
        id: 'hvac',
        title: "Climate Control",
        description: "Expert HVAC installation and maintenance ensuring your home remains a sanctuary of comfort across all seasons.",
        icon: "ac_unit",
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2670&auto=format&fit=crop",
        tags: ["AC", "Heating", "Ventilation"]
    }
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-primary/20">
            <Navigation />

            {/* Premium Hero Section with Black-to-White Transition */}
            <section className="relative h-[80vh] flex items-center overflow-hidden bg-black">
                {/* Visual Transition Layer */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-white/10 opacity-80 shadow-inner"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=2678&auto=format&fit=crop')] bg-cover bg-fixed bg-center opacity-30 mix-blend-overlay"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-8"
                        >
                            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Master Artisan Network</span>
                        </motion.div>

                        <FadeIn direction="up">
                            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 uppercase">
                                Mastery in Every <br />
                                <span className="text-primary italic">Discipline.</span>
                            </h1>
                        </FadeIn>

                        <FadeIn direction="up" delay={0.2}>
                            <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl leading-relaxed mb-12">
                                We bridge the gap between architectural vision and technical execution. Connect with the elite 1% of artisans vetted for uncompromising quality.
                            </p>
                        </FadeIn>

                        <FadeIn direction="up" delay={0.4}>
                            <div className="flex flex-wrap gap-6 items-center">
                                <Link href="/explore">
                                    <button className="h-16 px-10 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5 group flex items-center gap-3 active:scale-95">
                                        Explore Engine
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">database</span>
                                    </button>
                                </Link>
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="size-12 rounded-full border-4 border-black bg-gray-800 overflow-hidden ring-1 ring-white/10">
                                            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Master Artisan" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    <div className="size-12 rounded-full border-4 border-black bg-primary flex items-center justify-center text-[10px] font-black text-white ring-1 ring-white/10">
                                        +2.4k
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>

                {/* Bottom transition scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <div className="w-[1px] h-20 bg-gradient-to-b from-white/50 to-transparent"></div>
                </motion.div>
            </section>

            {/* Service Discovery Section */}
            <section className="py-32 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
                        <div className="max-w-2xl text-black">
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">Expertise Categorized.</h2>
                            <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                Our artisans are specialized across core service domains, each requiring a master's level certification and a history of exceptional project delivery.
                            </p>
                        </div>

                        {/* Service Search Bar */}
                        <div className="w-full lg:w-96">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl group-hover:bg-primary/30 transition-all opacity-0 group-hover:opacity-100"></div>
                                <div className="relative bg-gray-50 border border-gray-100 p-2 rounded-2xl flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary ml-3">search</span>
                                    <input
                                        type="text"
                                        placeholder="Filter by skill..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold uppercase tracking-widest placeholder:text-gray-400"
                                    />
                                    <button className="size-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                                        <span className="material-symbols-outlined text-sm">tune</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {SERVICES.map((service, index) => (
                            <FadeIn key={service.id} direction="up" delay={index * 0.1}>
                                <div className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                                    {/* Glass-morphic Image Header */}
                                    <div className="relative h-56 rounded-3xl overflow-hidden mb-8 shadow-inner bg-gray-100">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                                            {service.tags.map(tag => (
                                                <span key={tag} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white border border-white/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="size-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                <span className="material-symbols-outlined text-xl">{service.icon}</span>
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tighter text-black">{service.title}</h3>
                                        </div>
                                        <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                            {service.description}
                                        </p>
                                    </div>

                                    <Link href={`/explore?category=${service.id}`} className="mt-auto">
                                        <button className="w-full py-4 border-2 border-primary/10 rounded-2xl text-primary font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 group/btn">
                                            Find Artisans
                                            <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_outward</span>
                                        </button>
                                    </Link>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quality Commitment Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="glass-morphism rounded-[4rem] p-12 md:p-20 relative overflow-hidden border-white">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full -ml-48 -mb-48 blur-3xl opacity-50"></div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-8 leading-[1.1]">
                                    Uncompromising <br />
                                    <span className="text-primary italic">Quality Standards.</span>
                                </h2>
                                <p className="text-lg text-gray-500 font-medium leading-relaxed mb-10">
                                    Every artisan on our platform undergoes a rigorous 5-step verification protocol, including background checks, portfolio authentication, and technical skill assessments by domain experts.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        { title: "Global Certification Check", detail: "Authentication of international and local trade certificates." },
                                        { title: "Physical Infrastructure Audit", detail: "Verification of workshop capacity and tool inventory." },
                                        { title: "Peer-to-Peer Peer Review", detail: "Endorsement from at least three verified master artisans." }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
                                                <span className="material-symbols-outlined text-xs">done_all</span>
                                            </div>
                                            <div>
                                                <h4 className="font-black uppercase tracking-widest text-[10px] text-black mb-1">{item.title}</h4>
                                                <p className="text-sm text-gray-500 font-medium">{item.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative aspect-square">
                                <div className="absolute inset-4 border-2 border-primary/20 rounded-[3rem] -z-10 rotate-3"></div>
                                <div className="absolute inset-0 bg-white shadow-2xl rounded-[3rem] overflow-hidden asymmetric-frame">
                                    <img
                                        src="https://images.unsplash.com/photo-1581578731548-c64695ce6958?q=80&w=2670&auto=format&fit=crop"
                                        alt="Quality Assurance"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                                    <div className="absolute bottom-8 left-8 right-8 bg-black/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                                        <p className="text-white text-sm font-medium leading-relaxed italic">
                                            "Our reputation is built on the collective excellence of the artisans we represent. We don't just find help; we curate mastery."
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Chief of Operations</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Artisans Global</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Placeholder for visual consistency */}
            <footer className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="p-2 bg-primary rounded-lg text-white">
                            <span className="material-symbols-outlined leading-none">handyman</span>
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight text-black uppercase">Artisans</h2>
                    </div>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto mb-12">
                        Connecting architectural vision with engineering execution through a verified network of elite master artisans.
                    </p>
                    <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocol</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/about" className="hover:text-primary transition-colors">About Legacy</Link>
                    </div>
                    <div className="mt-12 text-[10px] font-black uppercase tracking-widest text-gray-300">
                        © 2026 Artisans Services. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
