"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export const DashboardPageHeader = () => {
    const pathname = usePathname();

    // Convert path to readable title
    // e.g., /dashboard/agent/tasks -> Agent / My Tasks
    const getPageTitle = () => {
        const parts = pathname.split('/').filter(p => p !== '');

        if (parts.length < 2) return 'Dashboard';

        // Remove 'dashboard'
        const relevantParts = parts.slice(1);

        return relevantParts.map(part => {
            return part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }).join(' / ');
    };

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20">
            <h1 className="text-lg font-bold text-text-main">{getPageTitle()}</h1>
            <div className="flex items-center gap-4">
                <button className="text-slate-400 hover:text-primary transition-colors relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};
