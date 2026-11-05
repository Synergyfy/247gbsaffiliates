"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { useAuthStore } from "@/store/useAuthStore";


export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const userName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Admin";
    const userInitials = userName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "AD";

    const sidebarLinks = [
        { name: "Overview", href: "/dashboard/admin", icon: "dashboard" },
        { name: "Affiliates", href: "/dashboard/admin/users", icon: "manage_accounts" },
        { name: "Business Acquisition", href: "/dashboard/admin/business-acquisition", icon: "storefront" },
        { name: "Verifications", href: "/dashboard/admin/verifications", icon: "verified_user" },
        { name: "Learning Materials", href: "/dashboard/admin/learning", icon: "school" },
        { name: "Assessments", href: "/dashboard/admin/assessments", icon: "quiz" },
        { name: "Tasks", href: "/dashboard/admin/tasks", icon: "assignment" },
        { name: "Messages", href: "/dashboard/admin/messages", icon: "forum" },
        { name: "Settings", href: "/dashboard/admin/settings", icon: "settings_suggest" },
        { name: "Reports", href: "/dashboard/admin/reports", icon: "summarize" },
    ];

    return (
        <div className="bg-background-light min-h-screen font-sans text-text-main flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface-light border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen z-10 text-white">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-10">
                        <BrandLogo />
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
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
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all rounded-lg ${isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
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
                    <div className="mt-auto p-4 border-t border-slate-50">
                        <UserMenu name={userName} role={user?.role || "Admin"} initials={userInitials} />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20">
                    <h1 className="text-lg font-bold text-text-main">Platform Administration</h1>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-primary transition-colors">
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
