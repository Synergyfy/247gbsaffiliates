"use client";

import { motion } from 'framer-motion';
import { FaBolt, FaWrench, FaHammer, FaPaintRoller, FaSnowflake, FaTools, FaBroom, FaLeaf } from 'react-icons/fa';
import FadeIn from '../FadeIn';

const categories = [
    {
        name: 'Electrical',
        icon: FaBolt,
        description: 'Wiring, repairs, installations',
        color: 'from-yellow-400 to-orange-500'
    },
    {
        name: 'Plumbing',
        icon: FaWrench,
        description: 'Pipes, fixtures, drainage',
        color: 'from-blue-400 to-blue-600'
    },
    {
        name: 'Carpentry',
        icon: FaHammer,
        description: 'Furniture, doors, custom work',
        color: 'from-amber-600 to-amber-800'
    },
    {
        name: 'Painting',
        icon: FaPaintRoller,
        description: 'Interior, exterior, decorative',
        color: 'from-purple-400 to-purple-600'
    },
    {
        name: 'HVAC',
        icon: FaSnowflake,
        description: 'AC, heating, ventilation',
        color: 'from-cyan-400 to-cyan-600'
    },
    {
        name: 'General Repairs',
        icon: FaTools,
        description: 'Maintenance, fixes, installations',
        color: 'from-gray-600 to-gray-800'
    },
    {
        name: 'Cleaning',
        icon: FaBroom,
        description: 'Deep cleaning, maintenance',
        color: 'from-green-400 to-green-600'
    },
    {
        name: 'Landscaping',
        icon: FaLeaf,
        description: 'Gardens, lawns, outdoor',
        color: 'from-emerald-500 to-emerald-700'
    }
];

export default function ServiceCategories() {
    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <FadeIn direction="up">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What do you need help with?
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Browse our verified professionals by service category
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
                    {categories.map((category, index) => (
                        <FadeIn key={category.name} delay={index * 0.05} direction="up">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center group"
                            >
                                <div className={`mb-4 p-4 rounded-xl bg-gradient-to-br ${category.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                                    <category.icon size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {category.description}
                                </p>
                            </motion.button>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={0.4} direction="up">
                    <div className="text-center mt-12">
                        <button className="text-brand-green font-semibold hover:underline text-lg">
                            View all services →
                        </button>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
