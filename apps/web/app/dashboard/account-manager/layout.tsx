"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { RoleWorkspaceHeader } from "@/components/dashboard/RoleWorkspaceHeader";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { RoleMobileNavigation } from "@/components/dashboard/RoleMobileNavigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AccountManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    
    // Fallback initials and name while the session hydrates
    const userName = user?.name || "Account Manager";
    const userRole = user?.role ? user.role.replaceAll('_', ' ') : "Account Manager";
    const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : "AM";

    const sidebarLinks = [
        {
            name: "Dashboard Overview",
            href: "/dashboard/account-manager",
            icon: "dashboard",
        },
        { name: "Businesses", href: "/dashboard/account-manager/businesses", icon: "storefront" },
        { name: "Campaigns", href: "/dashboard/account-manager/campaigns", icon: "campaign" },
        { name: "Tasks", href: "/dashboard/account-manager/tasks", icon: "assignment" },
        { name: "Agents", href: "/dashboard/account-manager/agents", icon: "groups" },
        { name: "Messages", href: "/dashboard/account-manager/messages", icon: "forum" },
        { name: "Earnings", href: "/dashboard/account-manager/revenue", icon: "payments" },
        { name: "My Profile", href: "/dashboard/account-manager/profile", icon: "person" },
        { name: "Verification", href: "/dashboard/account-manager/verification", icon: "verified_user" },
        { name: "Learning", href: "/dashboard/account-manager/learning", icon: "school" },
        { name: "Assessment & Qualification", href: "/dashboard/account-manager/assessment", icon: "quiz" },
        { name: "Notifications", href: "/dashboard/account-manager/notifications", icon: "notifications" },
        { name: "Settings", href: "/dashboard/account-manager/settings", icon: "settings" },
    ];
    const primaryMobileLinks = [
        sidebarLinks[0], sidebarLinks[2], sidebarLinks[1], sidebarLinks[4],
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
                <nav aria-label="Account Manager navigation" className="min-h-0 flex-1 overflow-y-auto py-3">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-2.5 px-5 py-2.5 text-xs font-semibold transition-colors ${isActive
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
                    <UserMenu name={userName} role={userRole} initials={userInitials} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <RoleWorkspaceHeader roleName="Account Manager" profileHref="/dashboard/account-manager/profile" settingsHref="/dashboard/account-manager/settings" />
                <main className="min-w-0 flex-1 overflow-x-clip pb-20 lg:pb-0">
                    {children}
                </main>
            </div>
            <RoleMobileNavigation roleName="Account Manager" items={sidebarLinks} primaryItems={primaryMobileLinks} />
        </div>
    );
}
