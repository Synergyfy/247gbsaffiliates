"use client";

import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import FadeIn from '../FadeIn';

const featuredArtisans = [
    {
        id: 1,
        name: 'Chidi Okonkwo',
        specialty: 'Master Electrician',
        rating: 4.9,
        reviews: 127,
        location: 'Lagos, Nigeria',
        image: '/artisans/artisan1.jpg',
        verified: true,
        completedJobs: 230
    },
    {
        id: 2,
        name: 'Amina Bello',
        specialty: 'Expert Plumber',
        rating: 5.0,
        reviews: 98,
        location: 'Abuja, Nigeria',
        image: '/artisans/artisan2.jpg',
        verified: true,
        completedJobs: 185
    },
    {
        id: 3,
        name: 'Tunde Adeyemi',
        specialty: 'Professional Carpenter',
        rating: 4.8,
        reviews: 156,
        location: 'Port Harcourt, Nigeria',
        image: '/artisans/artisan3.jpg',
        verified: true,
        completedJobs: 312
    }
];

export default function FeaturedArtisans() {
    return (
        <section className="py-16 md:py-20 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
                <FadeIn direction="up">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Meet our top-rated professionals
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Verified artisans with proven track records
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {featuredArtisans.map((artisan, index) => (
                        <FadeIn key={artisan.id} delay={index * 0.1} direction="up">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
                            >
                                {/* Profile Image */}
                                <div className="relative h-64 bg-gradient-to-br from-brand-green/20 to-brand-green/5 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-600">
                                        {artisan.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    {artisan.verified && (
                                        <div className="absolute top-4 right-4 bg-brand-green text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                            <FaCheckCircle size={12} />
                                            Verified
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {artisan.name}
                                    </h3>
                                    <p className="text-brand-green font-medium mb-3">
                                        {artisan.specialty}
                                    </p>

                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center gap-1">
                                            <FaStar className="text-yellow-400" size={16} />
                                            <span className="font-bold text-gray-900">{artisan.rating}</span>
                                        </div>
                                        <span className="text-gray-500 text-sm">
                                            ({artisan.reviews} reviews)
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                                        <FaMapMarkerAlt className="text-brand-green" />
                                        {artisan.location}
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 mb-4">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-bold text-gray-900">{artisan.completedJobs}</span> jobs completed
                                        </p>
                                    </div>

                                    <button className="w-full bg-brand-green text-white py-3 rounded-xl font-semibold hover:bg-brand-green-hover transition-colors">
                                        View Profile
                                    </button>
                                </div>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={0.4} direction="up">
                    <div className="text-center mt-12">
                        <button className="bg-white text-brand-green border-2 border-brand-green px-8 py-3 rounded-xl font-semibold hover:bg-brand-green hover:text-white transition-all">
                            Browse all artisans
                        </button>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
