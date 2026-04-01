"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    const name = user?.name || "John Doe";
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
        <div className="bg-background-light min-h-screen font-sans text-text-main flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface-light border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen z-10">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined font-bold text-xl">
                                category
                            </span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-text-main">
                            Listeo
                        </h2>
                    </div>
                    <nav className="space-y-1">
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all rounded-lg ${isActive
                                        ? "bg-primary/10 text-primary border-r-4 border-primary"
                                        : "text-text-secondary hover:text-text-main hover:bg-slate-50"
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{link.icon}</span>
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t border-slate-50">
                    <UserMenu name={name} role={roleTitle} initials={initials} />
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
