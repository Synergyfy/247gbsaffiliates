"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { RoleWorkspaceHeader } from "@/components/dashboard/RoleWorkspaceHeader";
import { BrandLogo } from "../../../components/ui/BrandLogo";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { RoleMobileNavigation } from "@/components/dashboard/RoleMobileNavigation";
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
        { name: "Businesses", href: "/dashboard/consultant/businesses", icon: "storefront" },
        { name: "Tasks", href: "/dashboard/consultant/tasks", icon: "assignment" },
        { name: "Sessions", href: "/dashboard/consultant/sessions", icon: "calendar_today" },
        { name: "Messages", href: "/dashboard/consultant/messages", icon: "forum" },
        { name: "Earnings", href: "/dashboard/consultant/earnings", icon: "payments" },
        { name: "Profile", href: "/dashboard/consultant/profile", icon: "person" },
        { name: "Verification", href: "/dashboard/consultant/verification", icon: "verified_user" },
        { name: "Learning", href: "/dashboard/consultant/learning", icon: "school" },
        { name: "Assessment & Qualification", href: "/dashboard/consultant/assessment", icon: "quiz" },
        { name: "Notifications", href: "/dashboard/consultant/notifications", icon: "notifications" },
        { name: "Settings", href: "/dashboard/consultant/settings", icon: "settings" },
    ];
    const primaryMobileLinks = [
        sidebarLinks[0], sidebarLinks[1], sidebarLinks[2], sidebarLinks[4],
    ];

    return (
        <div className="bg-background-light min-h-screen font-sans text-text-main flex">
            {/* Sidebar */}
            <aside className="w-60 bg-surface-light border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen z-10">
                <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                       <BrandLogo size="md" label="247GBS Affiliate" labelClassName="text-sm" />
                    </div>
                </div>
                <nav aria-label="Consultant navigation" className="min-h-0 flex-1 overflow-y-auto py-3">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-2.5 px-5 py-2.5 text-xs font-semibold transition-all ${isActive
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
                <RoleWorkspaceHeader roleName="Consultant" profileHref="/dashboard/consultant/profile" settingsHref="/dashboard/consultant/profile" />
                <main className="flex-1 pb-20 lg:pb-0">
                    {children}
                </main>
            </div>
            <RoleMobileNavigation roleName="Consultant" items={sidebarLinks} primaryItems={primaryMobileLinks} />
        </div>
    );
}
