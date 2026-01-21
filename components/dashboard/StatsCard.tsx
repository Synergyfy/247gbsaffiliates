"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorConfig = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
};

export default function StatsCard({ icon, label, value, trend, color = 'blue' }: StatsCardProps) {
    const config = colorConfig[color];
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group"
        >
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.text} transition-all group-hover:scale-110 flex items-center justify-center`}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${trend.isPositive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {trend.value}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 group-hover:text-gray-900 transition-colors">{label}</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{value}</h3>
                </div>
            </div>
        </motion.div>
    );
}
