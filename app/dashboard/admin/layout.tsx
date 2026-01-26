"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const sidebarLinks = [
        { name: "Overview", href: "/dashboard/admin", icon: "dashboard" },
        { name: "User Management", href: "/dashboard/admin/users", icon: "manage_accounts" },
        { name: "Platform Settings", href: "/dashboard/admin/settings", icon: "settings_suggest" },
        { name: "Reports", href: "/dashboard/admin/reports", icon: "summarize" },
    ];

    return (
        <div className="bg-background-light min-h-screen font-sans text-text-main flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden lg:flex flex-col sticky top-0 h-screen z-10 text-white">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="size-8 bg-red-500 rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined font-bold text-xl">
                                admin_panel_settings
                            </span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Admin Panel
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
                                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{link.icon}</span>
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-8 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">
                            AD
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate text-white">
                                Super Admin
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                System Owner
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20">
                    <h1 className="text-lg font-bold text-text-main">Platform Administration</h1>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                    </div>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
