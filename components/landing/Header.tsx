"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingHeader() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b border-solid transition-all duration-300 px-6 lg:px-40 py-4 ${scrolled
                    ? "bg-background-light/95 backdrop-blur-md border-primary/10 shadow-sm"
                    : "bg-background-light/80 backdrop-blur-md border-primary/5"
                }`}
        >
            <div className="mx-auto flex max-w-[1240px] items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-primary group">
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
                <div className="hidden md:flex flex-1 justify-center gap-10">
                    <Link
                        href="/for-account-manager"
                        className="text-text-main/80 text-sm font-semibold hover:text-primary transition-colors"
                    >
                        For Account Managers
                    </Link>
                    <Link
                        href="/for-agent"
                        className="text-text-main/80 text-sm font-semibold hover:text-primary transition-colors"
                    >
                        For Agents
                    </Link>
                    <Link
                        href="/for-consultant"
                        className="text-text-main/80 text-sm font-semibold hover:text-primary transition-colors"
                    >
                        For Consultants
                    </Link>
                    <Link
                        href="/#how-it-works"
                        className="text-text-main/80 text-sm font-semibold hover:text-primary transition-colors"
                    >
                        How it Works
                    </Link>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/login"
                        className="hidden sm:flex min-w-[100px] items-center justify-center rounded-xl h-11 px-6 bg-white text-text-main text-sm font-semibold border border-primary/10 hover:bg-slate-50 transition-all font-display"
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
            </div>
        </header>
    );
}
