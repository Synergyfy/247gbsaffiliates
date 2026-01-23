"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function Navigation() {
    const { isAuthenticated, user } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" : "bg-white/95 backdrop-blur-md border-b border-gray-100"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm group-hover:bg-primary-hover transition-colors">
                            <span className="material-icons-round text-2xl">handyman</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">Artisans</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link className="text-sm font-bold text-gray-600 hover:text-green-600 transition-colors" href="/explore">Find Artisans</Link>
                        <Link className="text-sm font-bold text-gray-600 hover:text-green-600 transition-colors" href="/services">Services</Link>
                        <Link className="text-sm font-bold text-gray-600 hover:text-green-600 transition-colors" href="/signup">Join as Pro</Link>
                        <Link className="text-sm font-bold text-gray-600 hover:text-green-600 transition-colors" href="/faq">FAQ</Link>
                        <Link className="text-sm font-bold text-gray-600 hover:text-green-600 transition-colors" href="/#how-it-works">How it Works</Link>
                    </div>

                    {/* Auth Buttons & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link
                                href={
                                    user?.role === 'agent' ||
                                        user?.role === 'account-manager' ||
                                        user?.role === 'consultant'
                                        ? `/dashboard/${user.role}`
                                        : '/dashboard/client'
                                }
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100 group"
                            >
                                <div
                                    className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform bg-cover bg-center"
                                    style={{ backgroundImage: `url(${user?.image || 'https://ui-avatars.com/api/?name=' + user?.name})` }}
                                >
                                </div>
                                <span className="text-sm font-black text-gray-900 hidden sm:block">Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link href="/signin" className="text-sm font-bold text-gray-600 hover:text-green-600 transition-colors hidden sm:block">
                                    Log in
                                </Link>
                                <Link href="/signup" className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-full transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transform hover:-translate-y-0.5">
                                    Get Started
                                </Link>
                            </>
                        )}
                        <div className="md:hidden">
                            <button className="text-gray-600 hover:text-green-600">
                                <span className="material-icons-round text-3xl">menu</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
