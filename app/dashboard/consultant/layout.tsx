"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ConsultantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const sidebarLinks = [
        { name: "Dashboard", href: "/dashboard/consultant", icon: "dashboard" },
        { name: "Sessions", href: "#", icon: "calendar_today" },
        { name: "Earnings", href: "#", icon: "payments" },
        { name: "Profile", href: "#", icon: "person" },
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
                <div className="p-6 border-t border-slate-100">
                    <div className="bg-slate-800 rounded-xl p-4 text-white">
                        <p className="text-[10px] font-bold text-primary uppercase mb-1">
                            Support
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            Need help with your sessions?
                        </p>
                        <button className="text-xs font-bold underline hover:text-primary">
                            Contact Admin
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">{children}</div>
        </div>
    );
}
