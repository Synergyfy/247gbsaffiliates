"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { BrandLogo } from "../../../components/ui/BrandLogo";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { useAuthStore } from "@/store/useAuthStore";

export default function ConsultantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const userName = user?.name || "Consultant";
    const userRole = user?.role ? user.role.replaceAll('_', ' ') : "Consultant";
    const userInitials = userName
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'C';

    const sidebarLinks = [
        { name: "Dashboard", href: "/dashboard/consultant", icon: "dashboard" },
        { name: "Tasks", href: "/dashboard/consultant/tasks", icon: "assignment" },
        { name: "Sessions", href: "/dashboard/consultant/sessions", icon: "calendar_today" },
        { name: "Messages", href: "/dashboard/consultant/messages", icon: "forum" },
        { name: "Earnings", href: "/dashboard/consultant/earnings", icon: "payments" },
        { name: "Profile", href: "/dashboard/consultant/profile", icon: "person" },
    ];

    return (
        <div className="bg-background-light min-h-screen font-sans text-text-main flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface-light border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen z-10">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                       <BrandLogo/>
                    </div>
                </div>
                <nav className="flex-1 py-6">
                    <div className="px-4 mb-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                        Main Menu
                    </div>
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all ${isActive
                                    ? "text-primary bg-primary/5 border-r-4 border-primary"
                                    : "text-text-secondary hover:text-text-main hover:bg-slate-50"
                                    }`}
                            >
                                <span className="material-symbols-outlined">{link.icon}</span>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <UserMenu name={userName} role={userRole} initials={userInitials} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardPageHeader />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
