'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';

export function RoleWorkspaceHeader({ roleName, profileHref, settingsHref }: { roleName: string; profileHref: string; settingsHref: string }) {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const { logout, isLoggingOut } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const name = user?.name || roleName;
    const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
    const title = pathname === `/dashboard/${roleName.toLowerCase().replaceAll(' ', '-')}`
        ? 'Dashboard'
        : pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Dashboard';

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white font-display">
            <div className="flex min-h-14 items-center justify-between gap-3 px-3 sm:px-5 lg:min-h-[68px] lg:px-8">
                <BrandLogo size="sm" iconClassName="size-5" label="247GBS Affiliate" labelClassName="text-[11px] sm:text-xs" className="gap-1.5 md:hidden" />
                <div className="hidden min-w-0 flex-1 md:block">
                    <h1 className="truncate text-[15px] font-semibold text-slate-950">{title}</h1>
                    <p className="mt-0.5 text-xs text-slate-500">{roleName} workspace</p>
                </div>
                <div className="relative ml-auto flex shrink-0 items-center gap-2">
                    <span className="hidden max-w-40 truncate text-xs font-medium text-slate-700 sm:inline">{name}</span>
                    <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Open account menu" aria-haspopup="menu" aria-expanded={menuOpen} className="flex items-center gap-1.5 rounded-md p-1 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                        <span className="flex size-7 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">{initials}</span>
                        <span className="material-symbols-outlined text-base text-slate-500">expand_more</span>
                    </button>
                    {menuOpen && <div role="menu" className="absolute right-0 top-10 z-50 w-52 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                        <p className="truncate px-3 py-2 text-[11px] text-slate-500">{user?.email}</p>
                        <Link role="menuitem" href={profileHref} onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</Link>
                        <Link role="menuitem" href={settingsHref} onClick={() => setMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</Link>
                        <button role="menuitem" type="button" disabled={isLoggingOut} onClick={() => void logout()} className="w-full rounded px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-50">{isLoggingOut ? 'Signing out…' : 'Sign out'}</button>
                    </div>}
                </div>
            </div>
        </header>
    );
}
