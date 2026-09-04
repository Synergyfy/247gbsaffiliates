'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CustomSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const CustomSpinner: React.FC<CustomSpinnerProps> = ({ className, size = 'md' }) => {

    const sizeConfig = {
        sm: { size: 32, stroke: 3, text: 'text-[8px]' },
        md: { size: 48, stroke: 4, text: 'text-[10px]' },
        lg: { size: 64, stroke: 5, text: 'text-xs' },
    };

    const { size: dimensions, stroke, text } = sizeConfig[size];
    const center = dimensions / 2;
    const radius = center - stroke;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: dimensions, height: dimensions }}>
            <motion.svg
                width={dimensions}
                height={dimensions}
                viewBox={`0 0 ${dimensions} ${dimensions}`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 text-primary"
            >
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className="opacity-25"
                />
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `1 ${circumference}`, strokeDashoffset: 0 }}
                    animate={{
                        strokeDasharray: [`1 ${circumference}`, `${circumference * 0.9} ${circumference}`, `1 ${circumference}`],
                        strokeDashoffset: [0, -circumference * 0.4, -circumference],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </motion.svg>
            <div className={`absolute inset-0 flex items-center justify-center font-display font-bold text-primary ${text}`}>
                GBS
            </div>
        </div>
    );
};
