'use client';

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaStar, FaLocationArrow, FaShieldAlt, FaMapMarkerAlt, FaTools } from "react-icons/fa";
import Link from "next/link";
import dynamic from 'next/dynamic';
import Navigation from "@/components/Navigation";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet components to avoid SSR issues
const Map = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

// Fix for default marker icon in Next.js
import L from 'leaflet';
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ARTISANS = [
    {
        id: 1,
        name: "Alex Johnson",
        specialty: "Master Plumber",
        rating: 4.9,
        reviews: 120,
        distance: "1.2 km",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfeQTMKdgjvnwJppdcFKKJUQ9tox6tm7KEvMO9zvHwQ1njb1PFXrLof8dDHu91P6y8teAhIEuv5SW_SzhRU_K5EgpzzeQ4_h0Ba9YJ5PZ8SCoxDzPFmyXYQbu3KT_bOoeR08T4d46d0btzmpoNHxhoF_pClpvwVoSijUoSWP5qixAu_h__zYbotzp1cjnAH24PgUUdHeJ2k8mtDoRxattM2UNHqW_XkulhwwY4bJiiI0xb3zJ5MTgHzGD9lVOK68uAZZHdtAWNtK-o",
        position: [6.5244, 3.3792], // Lagos Mainland
        icon: "plumbing",
        services: [
            { name: "Fix Leaky Pipe", price: 5000 },
            { name: "Install Sink", price: 15000 }
        ]
    },
    {
        id: 2,
        name: "Sarah Smith",
        specialty: "Senior Electrician",
        rating: 4.8,
        reviews: 210,
        distance: "2.5 km",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAh2joKIyFDRN51WHDzWGXyTEmXBr7vVoDUdpmZfFFbJT_0OipRYjga3B7Xy7wlsjrrCLVHyPICEgApGuH_tbmoJ1hWYl82PCArDajPnKulfUQmENMZG-7R1t7wpVTcd3qVlejBQLqgAWQ8tsxdBSTtcAcnXlKPShTuuOGxOLsUubp17xYIWmpmn9h1C9ze1fOl9UGm_9BTrcGxtEDBeCAgCRYIMHA1pQcdJIREhWX2On3MUdbo8PPfGPO0oIFe1BEFcIBktrqbY8C4",
        position: [6.4698, 3.5852], // Lekki
        icon: "electrical_services",
        services: [
            { name: "Install AC Unit", price: 12000 },
            { name: "Fix Power Outage", price: 8000 }
        ]
    },
    {
        id: 3,
        name: "Mike Chen",
        specialty: "Painter & Decorator",
        rating: 5.0,
        reviews: 45,
        distance: "0.8 km",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhem4-31L_eCRm0QMSSqvfX0kemf2HQIR1zsB6vbOoH5GbXRdv0qZ3seFYChNpunyr_kVN2GSRc2gsE06nIs-9qQKgCxqd_VTAY5Y33Z-jTxagNLpyAJmIUeCUFlAaYKQ2ePRCZLLh2ZVgEfMyxomCIH_3fRH-_g5Fvhmm6je63JeNHUiq5iupGhoAqNQdJ3rmayYnIdd_HJflfmA2CzesYu_r2uIT8ceI7uJq4IBaThV0VfHChwKjVh_cQzxvIQY2up_Is5q7msQ_",
        position: [6.6018, 3.3515], // Ikeja
        icon: "format_paint",
        recommended: true,
        services: [
            { name: "Paint Room (Standard)", price: 25000 },
            { name: "Wallpaper Installation", price: 18000 }
        ]
    }
];

export default function ExplorePage() {
    const [showLocationModal, setShowLocationModal] = useState(true);
    const [selectedArtisan, setSelectedArtisan] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const center = [6.5244, 3.3792]; // Lagos, Nigeria

    const selectedArtisanData = useMemo(() =>
        ARTISANS.find(a => a.id === selectedArtisan),
        [selectedArtisan]);

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-white text-gray-900 font-sans">
            <Navigation />
            <div className="h-20 shrink-0" /> {/* Spacer for fixed nav */}

            <main className="relative flex flex-1 w-full overflow-hidden bg-gray-50">
                {/* Map Interface */}
                <div className="absolute inset-0 z-0">
                    {isMounted && (
                        <Map center={center as L.LatLngExpression} zoom={12} className="w-full h-full z-0">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            {ARTISANS.map((artisan) => (
                                <Marker
                                    key={artisan.id}
                                    position={artisan.position as L.LatLngExpression}
                                    eventHandlers={{
                                        click: () => setSelectedArtisan(artisan.id),
                                    }}
                                >
                                </Marker>
                            ))}
                        </Map>
                    )}

                    {/* Map Controls */}
                    <div className="absolute bottom-10 right-10 flex flex-col gap-3 z-[400]">
                        <button className="w-12 h-12 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center text-gray-900 hover:text-brand-green transition-all hover:scale-110">
                            <FaLocationArrow size={18} />
                        </button>
                    </div>
                </div>

                {/* Discovery Sidebar */}
                <div className="relative z-[500] w-full max-w-lg bg-white/95 backdrop-blur-3xl shadow-2xl border-r border-gray-100 flex flex-col h-full pointer-events-auto">
                    <div className="p-8 border-b border-gray-50 space-y-8">
                        {/* Search */}
                        <div className="relative group">
                            <div className="flex items-center bg-gray-50 rounded-4xl px-6 py-5 border border-gray-100 group-focus-within:border-brand-green/30 group-focus-within:bg-white transition-all shadow-inner">
                                <FaSearch className="text-gray-400 mr-4" />
                                <input
                                    type="text"
                                    placeholder="What service do you need?"
                                    className="bg-transparent border-none focus:ring-0 text-gray-900 font-black tracking-tight placeholder:text-gray-300 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:text-brand-green transition-all active:scale-95">
                                    <span className="material-symbols-outlined text-lg">tune</span>
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {["All", "Top Rated", "Nearest", "Available Now"].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeFilter === filter
                                        ? "bg-gray-900 text-brand-green border-gray-900 shadow-xl shadow-gray-200"
                                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-900 hover:text-gray-900"
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Nearby Experts</h3>
                            <span className="px-3 py-1 bg-green-50 text-brand-green rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100">12 Found</span>
                        </div>

                        <div className="space-y-6">
                            {ARTISANS.map((artisan) => (
                                <motion.div
                                    key={artisan.id}
                                    whileHover={{ y: -5 }}
                                    onClick={() => setSelectedArtisan(artisan.id)}
                                    className={`relative p-6 rounded-4xl border transition-all cursor-pointer bg-white group ${selectedArtisan === artisan.id
                                        ? "border-brand-green/30 shadow-2xl shadow-brand-green/10 ring-4 ring-brand-green/5"
                                        : "border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50"
                                        }`}
                                >
                                    {artisan.recommended && (
                                        <div className="absolute -top-3 right-8 bg-brand-green text-gray-900 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border-4 border-white">
                                            Artisans Choice
                                        </div>
                                    )}
                                    <div className="flex gap-6 mb-6">
                                        <div className="relative w-16 h-16 shrink-0">
                                            <img src={artisan.image} alt={artisan.name} className="w-full h-full object-cover rounded-2xl shadow-sm group-hover:scale-105 transition-transform" />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-green border-2 border-white rounded-full shadow-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">{artisan.name}</h4>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{artisan.specialty}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                                    <FaStar className="text-amber-400" size={10} />
                                                    <span className="text-[10px] font-black text-amber-600">{artisan.rating}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{artisan.reviews} reviews</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services Preview - NEW */}
                                    <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <FaTools className="text-brand-green" /> Popular Services
                                        </p>
                                        <div className="space-y-2">
                                            {artisan.services.slice(0, 2).map((service, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm font-bold text-gray-700">
                                                    <span>{service.name}</span>
                                                    <span className="text-gray-900">₦{service.price.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <FaMapMarkerAlt size={12} className="text-brand-green" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{artisan.distance} away</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedArtisan === artisan.id
                                                ? "bg-gray-100 text-gray-900 border border-gray-200"
                                                : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                                                }`}>
                                                Details
                                            </button>
                                            <Link href="/track/job-123" className="px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gray-900 text-brand-green shadow-xl shadow-gray-200 hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Location Permission Modal */}
            <AnimatePresence>
                {showLocationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-4xl p-12 max-w-lg w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-full -mr-20 -mt-20 -z-10" />

                            <div className="w-24 h-24 bg-green-50 rounded-4xl flex items-center justify-center text-brand-green mb-8 shadow-xl shadow-green-100 relative">
                                <FaMapMarkerAlt size={40} className="animate-bounce" />
                                <div className="absolute -inset-4 bg-brand-green/20 rounded-full animate-ping" />
                            </div>

                            <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tight mb-4 uppercase">Unlock Your Local Network</h2>
                            <p className="text-gray-500 font-medium leading-relaxed mb-10 px-4">
                                Handflow uses your location to connect you with the highest-rated artisans in your immediate vicinity. Verify your coordinates to begin discovery.
                            </p>

                            <div className="space-y-4 w-full">
                                <button
                                    onClick={() => setShowLocationModal(false)}
                                    className="w-full bg-gray-900 text-brand-green py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    Enable Location Engine <FaShieldAlt className="text-white" />
                                </button>
                                <button
                                    onClick={() => setShowLocationModal(false)}
                                    className="w-full bg-white text-gray-400 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-gray-900 transition-all"
                                >
                                    Search Manually Instead
                                </button>
                            </div>

                            <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest pt-8 border-t border-gray-50 w-full justify-center">
                                <FaShieldAlt size={12} /> Privacy First Encryption Active
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

