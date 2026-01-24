'use client';

import React from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 font-display">
            <DashboardSidebar />
            <div className="lg:ml-64 min-h-screen flex flex-col">
                <DashboardHeader />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};
