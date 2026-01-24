'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
    roleTitle: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, roleTitle }) => {
    const { user, clearAuth } = useAuthStore();
    const { assessmentSkipped, quizResult } = useOnboardingStore();
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const navItems = [
        { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
        { label: 'Messages', icon: 'chat_bubble', href: '#' },
        { label: 'Analytics', icon: 'insights', href: '#' },
        { label: 'Settings', icon: 'settings', href: '#' },
    ];

    return (
        <div className="bg-background-light min-h-screen font-body text-text-main flex relative">
            {/* Assessment Lock Overlay */}
            {assessmentSkipped && !quizResult && (
                <div className="absolute inset-0 z-50 bg-white/30 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-100">
                        <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                            <span className="material-symbols-outlined text-3xl">lock</span>
                        </div>
                        <h2 className="text-2xl font-bold text-text-main mb-3 font-display">Dashboard Locked</h2>
                        <p className="text-slate-500 mb-8 font-medium">
                            You skipped the mandatory role assessment. To access your dashboard and receive paid assignments, you must verify your skills.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push('/onboarding')}
                                className="w-full py-3 px-6 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 font-display uppercase tracking-wider text-xs"
                            >
                                Complete Assessment
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full py-3 px-6 bg-slate-50 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-colors font-display uppercase tracking-wider text-xs"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="text-primary size-8">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-text-main font-display">247gbs affiliate</h2>
                    </div>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${item.label === 'Dashboard'
                                    ? 'bg-primary/5 text-primary border-r-4 border-primary'
                                    : 'text-slate-400 hover:text-text-main hover:bg-slate-50'
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user?.name?.substring(0, 2).toUpperCase() || 'JD'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-text-main">{user?.name || 'John Doe'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-display">{roleTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-text-main font-display">{roleTitle} Dashboard</h1>
                        <span className="px-2.5 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Online</span>
                        {quizResult && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                Verified
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-400 hover:text-text-main transition-colors">
                            <span className="material-symbols-outlined text-2xl">notifications</span>
                            <span className="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter font-display">Current Balance</span>
                            <span className="text-sm font-bold text-text-main">£1,240.50</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </div>

                <footer className="mt-auto py-8 border-t border-slate-100 bg-white/50 px-8">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-display">© 2026 247gbs affiliate professional marketplace</p>
                        <div className="flex gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest font-display">
                            <Link className="hover:text-primary transition-colors" href="#">Support</Link>
                            <Link className="hover:text-primary transition-colors" href="#">Community</Link>
                            <Link className="hover:text-primary transition-colors" href="#">Terms</Link>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};
