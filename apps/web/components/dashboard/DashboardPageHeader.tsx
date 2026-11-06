"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export const DashboardPageHeader = () => {
    const pathname = usePathname();

    // Standard title when onboarded
    const getPageTitle = () => {
        const parts = pathname.split('/').filter(p => p !== '');
        if (parts.length < 2) return 'Dashboard';
        const relevantParts = parts.slice(1);
        return relevantParts.map(part => {
            return part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }).join(' / ');
    };

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20 font-display">
            <h1 className="text-lg font-bold text-text-main">{getPageTitle()}</h1>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="text-slate-400 hover:text-primary transition-colors relative size-8 rounded-lg hover:bg-slate-50 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-xl">notifications</span>
                    <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};
