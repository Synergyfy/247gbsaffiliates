"use client";

import React from 'react';
import Link from 'next/link';
import StatsCard from '@/components/dashboard/StatsCard';
import { FaTasks, FaDollarSign, FaHeart, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

export default function ClientDashboard() {
    const { user } = useAuthStore();
    const currentUser = user || { name: "Customer" };

    const stats = [
        { icon: <FaTasks size={24} />, label: 'Active Requests', value: '3', color: 'blue' as const },
        { icon: <FaDollarSign size={24} />, label: 'Total Spent', value: '₦125K', color: 'green' as const },
        { icon: <FaHeart size={24} />, label: 'Favorite Artisans', value: '8', color: 'purple' as const },
        { icon: <FaStar size={24} />, label: 'Reviews Given', value: '12', color: 'orange' as const },
    ];

    const recommendedArtisans = [
        { id: 1, name: 'Chidi Okonkwo', specialty: 'Electrician', rating: 4.9, reviews: 127, image: null },
        { id: 2, name: 'Amina Bello', specialty: 'Plumber', rating: 5.0, reviews: 98, image: null },
        { id: 3, name: 'Tunde Adeyemi', specialty: 'Carpenter', rating: 4.8, reviews: 156, image: null },
    ];

    return (
        <div className="w-full min-h-full bg-white animate-fade-in-up p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                            Dashboard
                        </h1>
                        <p className="text-gray-500">Welcome back, {currentUser.name}. Manage your projects and find experts.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <StatsCard {...stat} />
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href="/explore" className="block">
                        <button className="w-full bg-gray-900 text-white p-10 rounded-[2.5rem] hover:bg-black transition-all shadow-2xl shadow-gray-300 group text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/20">
                                    <span className="material-symbols-outlined text-white text-3xl">search</span>
                                </div>
                                <span className="material-symbols-outlined text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Find Artisans</h3>
                            <p className="text-gray-400 font-medium">Browse verified professionals near you</p>
                        </button>
                    </Link>
                    <button className="bg-white border-2 border-gray-100 text-gray-900 p-10 rounded-[2.5rem] hover:border-brand-green/30 hover:shadow-2xl hover:shadow-gray-200 transition-all group text-left relative overflow-hidden w-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                                <span className="material-symbols-outlined text-brand-green text-3xl">add_task</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 group-hover:text-brand-green group-hover:translate-x-1 transition-all">arrow_forward</span>
                        </div>
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Post a Task</h3>
                        <p className="text-gray-500 font-medium">Describe your job and get quotes</p>
                    </button>
                </div>

                {/* Recommended Artisans */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Recommended Artisans</h3>
                        <Link href="/explore" className="text-[10px] font-black text-brand-green uppercase tracking-widest hover:underline">View All &rarr;</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recommendedArtisans.map((artisan) => (
                            <div key={artisan.id} className="border border-gray-100 rounded-3xl p-8 hover:border-brand-green/20 hover:shadow-2xl hover:shadow-gray-200/50 transition-all group bg-white">
                                <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-3xl font-black text-gray-400 mb-6 group-hover:bg-brand-green group-hover:text-white group-hover:scale-105 transition-all shadow-sm">
                                    {artisan.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h4 className="font-black text-gray-900 text-xl mb-1">{artisan.name}</h4>
                                <p className="text-[10px] font-black text-brand-green uppercase tracking-widest mb-6">{artisan.specialty}</p>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                        <FaStar className="text-yellow-400" size={12} />
                                        <span className="font-black text-gray-900 text-xs">{artisan.rating}</span>
                                    </div>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">{artisan.reviews} reviews</span>
                                </div>
                                <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
