'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export const DashboardHeader: React.FC = () => {
    const pathname = usePathname();
    const { logout } = useAuthStore();

    // Simple breadcrumb logic
    const pathSegments = pathname.split('/').filter(Boolean);
    const currentPage = pathSegments[pathSegments.length - 1] || 'Dashboard';

    return (
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
            <h2 className="text-xl font-bold text-text-main capitalize font-display">
                {currentPage.replace('-', ' ')}
            </h2>

            <div className="flex items-center gap-4">
                <button className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <button
                    onClick={logout}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors font-display"
                >
                    Log out
                </button>
            </div>
        </header>
    );
};
