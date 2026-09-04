'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for classnames, if not I'll just use template literals or install clsx/tailwind-merge

interface BrandLogoProps {
    className?: string;
    variant?: 'default' | 'white';
    size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className, variant = 'default', size = 'md' }) => {
    const isWhite = variant === 'white';

    const sizeClasses = {
        sm: { icon: 'size-6', text: 'text-xl' },
        md: { icon: 'size-8', text: 'text-2xl' },
        lg: { icon: 'size-10', text: 'text-3xl' },
    };

    const { icon, text } = sizeClasses[size];

    return (
        <Link href="/" className={`flex items-center gap-3 font-display tracking-tight group ${className}`}>
            <div className={`${icon} ${isWhite ? 'text-white' : 'text-primary'} transition-transform group-hover:scale-110`}>
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                </svg>
            </div>
            <span className={`font-bold ${text} ${isWhite ? 'text-white' : 'text-text-main group-hover:text-primary transition-colors'}`}>
                247gbs
            </span>
        </Link>
    );
};
