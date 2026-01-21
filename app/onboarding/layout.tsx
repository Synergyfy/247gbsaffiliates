"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useOnboardingStore } from "@/store/onboardingStore";

const steps = [
    {
        id: "profile",
        label: "Profile Details",
        path: "/onboarding/profile",
        number: 1,
        roles: ['client', 'artisan']
    },
    {
        id: "services",
        label: "Services & Rates",
        path: "/onboarding/services",
        number: 2,
        roles: ['artisan']
    },
    {
        id: "portfolio",
        label: "Portfolio",
        path: "/onboarding/portfolio",
        number: 3,
        roles: ['artisan']
    },
    {
        id: "availability",
        label: "Availability & Area",
        path: "/onboarding/availability",
        number: 4,
        roles: ['artisan']
    },
    {
        id: "verification",
        label: "Verification",
        path: "/onboarding/verification",
        number: 5,
        roles: ['artisan']
    },
    {
        id: "review",
        label: "Review",
        path: "/onboarding/review",
        number: 6,
        roles: ['client', 'artisan']
    },
];

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { activeRole } = useOnboardingStore();

    // Filter steps based on active role
    // Default to displaying all or none, depending on preference. 
    // Since activeRole should be set during signup, we can default to artisan if missing for dev, or handle null.
    // Let's default to showing all if no role set (or maybe just client steps if simpler? No, artisan is default in original).
    const filteredSteps = steps.filter(step => !activeRole || step.roles.includes(activeRole)).map((step, index) => ({
        ...step,
        number: index + 1 // Renumber steps dynamically
    }));

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white text-text-main">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-xl">handyman</span>
                    </div>
                    <h1 className="text-text-main text-lg font-bold tracking-tight">Artisans</h1>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-text-main"
                >
                    <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 h-full bg-white border-r border-gray-100 flex flex-col 
                fixed md:static inset-y-0 left-0 z-40 transition-transform duration-300 transform 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header (Desktop only padding adjustments) */}
                <div className="p-8 pb-4 pt-20 md:pt-8">
                    <div className="md:flex hidden items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center shadow-lg shadow-brand-green/20">
                            <span className="material-symbols-outlined text-white text-xl">handyman</span>
                        </div>
                        <h1 className="text-gray-900 text-xl font-bold tracking-tight">Artisans</h1>
                    </div>
                    <p className="text-text-secondary text-sm font-medium ml-0 md:ml-10">Artisan Onboarding</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                    {filteredSteps.map((step, index) => {
                        const isActive = pathname?.startsWith(step.path);
                        const currentStepIndex = filteredSteps.findIndex(s => pathname?.startsWith(s.path));
                        const isCompleted = currentStepIndex > index;

                        return (
                            <Link
                                key={step.id}
                                href={step.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer
                  ${isActive
                                        ? "bg-primary/10 border border-primary/10"
                                        : "hover:bg-gray-50"
                                    }
                  ${!isActive && !isCompleted ? "opacity-60" : "opacity-100"}
                `}
                            >
                                {/* Icon/Number */}
                                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors
                  ${isCompleted
                                        ? "bg-primary/20 text-primary"
                                        : isActive
                                            ? "bg-primary text-white"
                                            : "border-2 border-gray-200 text-gray-400"
                                    }
                `}>
                                    {isCompleted ? (
                                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                                    ) : (
                                        <span className="text-xs font-bold">{step.number}</span>
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`
                  text-sm font-medium transition-colors
                  ${isActive
                                        ? "text-primary font-bold"
                                        : "text-text-main"
                                    }
                `}>
                                    {step.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="p-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-white shadow-sm">
                            <img
                                className="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuARXNH-vkGwvmEhwQRV0IBO_YK7Xod_Wo3k6CMwblM4Ws7uMmpyWIT5Ci-rHoheNbf_tLN2oQc8kcW9m9Tuym1MPeHL5weg6KkSNIJ4SvAnBQjcmFGMSSXG8Ar6ipUgF3YK8OwS3iMuqrzhYiL7Ad1HbxsVMWUYgilEndXUlLsE7QNfbzf2ggec8jaB4UoYJPo6fXKLfeGtSuVg2Trz9gmwQTPZy7SHeLT_7Kzp-fuOUTiTPJx8crF1TzcRaCPP1T6Dj2S263LUNwbL"
                                alt="User Profile"
                            />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-sm font-bold text-text-main truncate">Alex Artisan</p>
                            <p className="text-xs text-text-secondary truncate">Plumber • Tier 1</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0 bg-white">
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 lg:p-16 scroll-smooth bg-white">
                    <div className="max-w-[1100px] mx-auto pb-24">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
