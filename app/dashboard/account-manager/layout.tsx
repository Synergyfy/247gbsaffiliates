"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        { name: "Campaigns", href: "#", icon: "campaign" },
        { name: "Agents", href: "#", icon: "groups" },
        { name: "Revenue", href: "#", icon: "payments" },
        { name: "Settings", href: "#", icon: "settings" },
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
                <div className="p-6 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                            AM
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-main">Sarah Jenkins</p>
                            <p className="text-xs text-text-secondary font-medium">
                                Account Manager
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">{children}</div>
        </div>
    );
}
