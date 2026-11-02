"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { useAuthStore } from "@/store/useAuthStore";

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    // Derived user fields
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || user?.email?.split('@')[0] || "Affiliate Agent";
    const initials = name.substring(0, 2).toUpperCase();
    
    let roleTitle = 'Agent Level 1';
    if (user?.roles?.includes('account-manager') || user?.role === 'account_manager') {
        roleTitle = 'Account Manager';
    } else if (user?.roles?.includes('consultant') || user?.role === 'consultant') {
        roleTitle = 'Consultant';
    } else if (user?.roles?.includes('admin') || user?.role === 'admin') {
        roleTitle = 'Administrator';
    }

    const sidebarLinks = [
        { name: "Dashboard", href: "/dashboard/agent", icon: "dashboard" },
        { name: "Available Tasks", href: "/dashboard/agent/tasks", icon: "assignment" },
        { name: "My Missions", href: "/dashboard/agent/my-missions", icon: "rocket_launch" },
        { name: "Earnings", href: "/dashboard/agent/earnings", icon: "account_balance_wallet" },
        { name: "Messages", href: "/dashboard/agent/messages", icon: "chat_bubble" },
        { name: "Settings", href: "/dashboard/agent/settings", icon: "settings" },
    ];

    return (
        <div className="bg-background-light min-h-screen font-sans text-text-main flex flex-col lg:flex-row">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-surface-light border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen z-30">
                <div className="p-6">
                    <div className="mb-8">
                        <BrandLogo size="md" />
                    </div>
                    <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-display">
                        Affiliate Portal
                    </p>
                    <nav className="space-y-1">
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-bold transition-all rounded-xl ${
                                        isActive
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "text-slate-600 hover:text-text-main hover:bg-slate-100/70"
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-lg ${isActive ? "text-white" : "text-slate-400"}`}>
                                        {link.icon}
                                    </span>
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t border-slate-200/80 bg-slate-50/50">
                    <UserMenu name={name} role={roleTitle} initials={initials} />
                </div>
            </aside>

            {/* Shared mobile header for every Agent page */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden">
                <BrandLogo
                    size="sm"
                    label="247GBS Affiliate"
                    labelClassName="text-[15px]"
                    className="min-w-0 gap-2"
                />
                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                    {user?.avatar || user?.image
                        ? <img src={user?.avatar || user?.image || ''} alt="" className="size-full object-cover" />
                        : initials}
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="hidden lg:block"><DashboardPageHeader /></div>
                <main className="flex-1 w-full pb-20 lg:pb-0">
                    {children}
                </main>
            </div>

            {/* Shared mobile bottom navigation for every Agent page */}
            <nav aria-label="Agent navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-1 pb-[env(safe-area-inset-bottom)] lg:hidden">
                <div className="mx-auto grid max-w-lg grid-cols-5">
                    {[
                        { name: "Dashboard", href: "/dashboard/agent", icon: "dashboard" },
                        { name: "Tasks", href: "/dashboard/agent/tasks", icon: "assignment" },
                        { name: "Missions", href: "/dashboard/agent/my-missions", icon: "military_tech" },
                        { name: "Earnings", href: "/dashboard/agent/earnings", icon: "payments" },
                        { name: "Inbox", href: "/dashboard/agent/messages", icon: "mail" },
                    ].map((item) => {
                        const active = item.href === "/dashboard/agent"
                            ? pathname === item.href
                            : pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[8px] font-semibold uppercase tracking-wide ${active ? "text-blue-700" : "text-slate-600"}`}
                            >
                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
