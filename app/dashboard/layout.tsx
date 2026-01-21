"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout, isLoggingOut } = useAuth();
    const { user } = useAuthStore();

    // Fallback for mock/loading state
    const currentUser = user || {
        name: "Alex Artisan",
        role: "artisan",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuARXNH-vkGwvmEhwQRV0IBO_YK7Xod_Wo3k6CMwblM4Ws7uMmpyWIT5Ci-rHoheNbf_tLN2oQc8kcW9m9Tuym1MPeHL5weg6KkSNIJ4SvAnBQjcmFGMSSXG8Ar6ipUgF3YK8OwS3iMuqrzhYiL7Ad1HbxsVMWUYgilEndXUlLsE7QNfbzf2ggec8jaB4UoYJPo6fXKLfeGtSuVg2Trz9gmwQTPZy7SHeLT_7Kzp-fuOUTiTPJx8crF1TzcRaCPP1T6Dj2S263LUNwbL"
    };

    const navItems = [
        { name: "Overview", icon: "dashboard", path: `/dashboard/${currentUser.role}`, active: pathname === `/dashboard/${currentUser.role}` },
        { name: "Explore", icon: "map", path: "/explore", active: pathname === "/explore" },
        { name: "My Tasks", icon: "task", path: "/dashboard/tasks", active: pathname === "/dashboard/tasks" },
        { name: "Messages", icon: "chat", path: "/dashboard/messages", active: pathname === "/dashboard/messages" },
        { name: "Wallet", icon: "account_balance_wallet", path: "/dashboard/wallet", active: pathname === "/dashboard/wallet" },
        { name: "Profile", icon: "person", path: "/dashboard/profile", active: pathname === "/dashboard/profile" },
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white text-gray-900">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center shadow-lg shadow-brand-green/20">
                        <span className="material-symbols-outlined text-white text-xl">handyman</span>
                    </div>
                    <h1 className="text-gray-900 text-lg font-bold tracking-tight">Artisans</h1>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-600 hover:text-brand-green transition-colors"
                >
                    <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 h-full bg-white border-r border-gray-100 flex flex-col 
                fixed md:static inset-y-0 left-0 z-40 transition-transform duration-300 transform shrink-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8 pb-8 pt-20 md:pt-8">
                    <div className="hidden md:flex items-center gap-3 group px-2 py-1">
                        <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shadow-lg shadow-brand-green/20 group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-white text-2xl">handyman</span>
                        </div>
                        <h1 className="text-gray-900 text-2xl font-black tracking-tight">Artisans</h1>
                    </div>
                </div>
                <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group
                                ${item.active
                                    ? "bg-green-50 text-brand-green border border-brand-green/10"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }
                            `}
                        >
                            <span className={`material-symbols-outlined transition-colors ${item.active ? "text-brand-green" : "group-hover:text-brand-green"}`}>
                                {item.icon}
                            </span>
                            <span className="text-[15px] font-bold tracking-tight">{item.name}</span>
                            {item.active && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            )}
                        </Link>
                    ))}
                </nav>
                <div className="p-6 border-t border-gray-50">
                    <div className="group relative flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-brand-green/30 transition-all cursor-pointer">
                        <div className="w-11 h-11 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-all">
                            {currentUser.avatar ? (
                                <img
                                    className="w-full h-full object-cover"
                                    src={currentUser.avatar}
                                    alt="User Profile"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-brand-green/5 text-brand-green font-black text-xl">
                                    {currentUser.name[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <p className="text-[15px] font-black text-gray-900 truncate group-hover:text-brand-green transition-colors">{currentUser.name}</p>
                            <p className="text-[13px] text-gray-400 font-bold uppercase tracking-wider truncate">{currentUser.role}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); logout(); }}
                            disabled={isLoggingOut}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
                            title="Log Out"
                        >
                            <span className="material-symbols-outlined text-[20px]">{isLoggingOut ? 'sync' : 'logout'}</span>
                        </button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative pt-16 md:pt-0">
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center text-sm font-bold text-gray-400">
                            <span className="hover:text-gray-900 cursor-pointer transition-colors">Dashboard</span>
                            <span className="mx-2 text-gray-300">/</span>
                            <span className="text-gray-900">{navItems.find(i => i.active)?.name || "Overview"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-brand-green/20 w-64 placeholder:text-gray-400"
                            />
                        </div>
                        <div className="h-8 w-px bg-gray-100 mx-2"></div>
                        <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-brand-green hover:border-brand-green hover:bg-green-50 transition-all shadow-sm">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-brand-green hover:border-brand-green hover:bg-green-50 transition-all shadow-sm">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </header>
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto scroll-smooth min-h-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
