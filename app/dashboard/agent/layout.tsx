"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const sidebarLinks = [
        { name: "Dashboard", href: "/dashboard/agent", icon: "dashboard" },
        { name: "My Tasks", href: "#", icon: "assignment" },
        { name: "Earnings", href: "#", icon: "account_balance_wallet" },
        { name: "Messages", href: "#", icon: "chat_bubble" },
        { name: "Settings", href: "#", icon: "settings" },
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
                <div className="mt-auto p-8 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
                            JD
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate text-text-main">
                                John Doe
                            </p>
                            <p className="text-[10px] text-text-secondary uppercase tracking-widest">
                                Agent Level 1
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
