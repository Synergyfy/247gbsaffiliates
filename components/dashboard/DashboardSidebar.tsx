'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { getDashboardLinks } from '@/lib/dashboard-config';

export const DashboardSidebar: React.FC = () => {
    const pathname = usePathname();
    const { role } = useOnboardingStore();
    const links = getDashboardLinks(role);

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col z-50">
            <div className="p-8">
                <BrandLogo />
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display">Menu</p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm font-display group ${isActive
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-text-main'
                                }`}
                        >
                            <span className={`material-symbols-outlined transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>
                                {link.icon}
                            </span>
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-50">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        D
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-text-main truncate">Daniel</p>
                        <p className="text-xs text-slate-400 truncate capitalize">{role?.replace('-', ' ')}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
