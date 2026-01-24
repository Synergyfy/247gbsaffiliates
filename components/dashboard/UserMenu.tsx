"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
    name: string;
    role: string;
    initials: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({ name, role, initials }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { resetOnboarding } = useOnboardingStore();
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        resetOnboarding();
        router.push('/login');
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Popover Menu (Drop-up) */}
            {isOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-50">
                    <div className="p-2 space-y-1">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-main hover:bg-slate-50 rounded-lg transition-colors text-left">
                            <span className="material-symbols-outlined text-lg">person</span>
                            Profile
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-main hover:bg-slate-50 rounded-lg transition-colors text-left">
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Settings
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            )}

            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isOpen ? 'bg-white shadow-md' : 'hover:bg-slate-100'
                    }`}
            >
                <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {initials}
                </div>
                <div className="overflow-hidden flex-1 text-left">
                    <p className="text-xs font-bold truncate text-text-main">
                        {name}
                    </p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest truncate">
                        {role}
                    </p>
                </div>
                <span className="material-symbols-outlined text-slate-400">
                    {isOpen ? 'expand_more' : 'expand_less'}
                </span>
            </button>
        </div>
    );
};
