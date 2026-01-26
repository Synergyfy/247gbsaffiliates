"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { UserMenu } from "@/components/dashboard/UserMenu";

export default function AccountManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const sidebarLinks = [
        {
            name: "Dashboard Overview",
            href: "/dashboard/account-manager",
            icon: "dashboard",
        },
        { name: "Campaigns", href: "/dashboard/account-manager/campaigns", icon: "campaign" },
        { name: "Agents", href: "/dashboard/account-manager/agents", icon: "groups" },
        { name: "Revenue", href: "/dashboard/account-manager/revenue", icon: "payments" },
        { name: "Settings", href: "/dashboard/account-manager/settings", icon: "settings" },
    ];

    return (
        <div className="bg-background-light min-h-screen font-sans text-text-main flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface-light border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen z-10">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined font-bold text-xl">
                                category
                            </span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-text-main">
                            Listeo
                        </h2>
                    </div>
                </div>
                <nav className="flex-1 py-6">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-colors ${isActive
                                    ? "bg-slate-50 text-primary border-r-4 border-primary"
                                    : "text-text-secondary hover:text-primary hover:bg-slate-50"
                                    }`}
                            >
                                <span className="material-symbols-outlined">{link.icon}</span>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <UserMenu name="Sarah Jenkins" role="Account Manager" initials="SJ" />
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
