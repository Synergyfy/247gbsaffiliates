"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function LandingHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        }
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: "For Account Managers", href: "/for-account-manager" },
        { name: "For Agents", href: "/for-agent" },
        { name: "For Consultants", href: "/for-consultant" },
        { name: "How it Works", href: "/#how-it-works" },
    ];

    return (
        <>
            <header
                className={`sticky top-0 z-50 w-full border-b border-solid transition-all duration-300 px-6 lg:px-40 py-4 ${scrolled
                    ? "bg-background-light/95 backdrop-blur-md border-primary/10 shadow-sm"
                    : "bg-background-light/80 backdrop-blur-md border-primary/5"
                    }`}
            >
                <div className="mx-auto flex max-w-[1240px] items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-primary group z-50 relative">
                        <div className="size-8">
                            <svg
                                fill="currentColor"
                                viewBox="0 0 48 48"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    clipRule="evenodd"
                                    d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                                    fillRule="evenodd"
                                ></path>
                            </svg>
                        </div>
                        <h2 className="text-text-main text-2xl font-bold font-display tracking-tight group-hover:text-primary transition-colors">
                            247gbs affiliate
                        </h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex flex-1 justify-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-text-main/80 text-sm font-semibold hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex gap-4">
                        <Link
                            href="/login"
                            className="flex min-w-[100px] items-center justify-center rounded-xl h-11 px-6 bg-white text-text-main text-sm font-semibold border border-primary/10 hover:bg-slate-50 transition-all font-display"
                        >
                            Login
                        </Link>
                        <Link
                            href="/role-selection"
                            className="flex min-w-[110px] items-center justify-center rounded-xl h-11 px-6 bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-display"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        className="lg:hidden z-50 relative p-2 text-text-main hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined text-3xl">
                            {isMobileMenuOpen ? "close" : "menu"}
                        </span>
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-background-light z-40 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="h-20 flex items-center px-8 border-b border-slate-100">
                    {/* Placeholder for alignment with header */}
                </div>

                <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-6">
                    <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-lg font-bold text-text-main hover:text-primary transition-colors py-2 border-b border-slate-50"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-8 flex flex-col gap-4">
                        <Link
                            href="/login"
                            className="flex w-full items-center justify-center rounded-xl h-12 px-6 bg-white text-text-main text-base font-bold border border-primary/10 hover:bg-slate-50 transition-all font-display"
                        >
                            Login
                        </Link>
                        <Link
                            href="/role-selection"
                            className="flex w-full items-center justify-center rounded-xl h-12 px-6 bg-primary text-white text-base font-bold shadow-lg shadow-primary/20 hover:brightness-105 transition-all font-display"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100">
                    <p className="text-xs text-text-secondary text-center">
                        © 2026 247gbs affiliate. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
}
