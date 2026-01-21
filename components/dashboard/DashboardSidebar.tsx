"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FaHome, FaUser, FaCog, FaBell, FaSignOutAlt,
    FaUsers, FaCheckCircle, FaTasks, FaDollarSign,
    FaHammer, FaBriefcase, FaStar, FaCalendar,
    FaSearch, FaPlus, FaHeart, FaFileInvoiceDollar
} from 'react-icons/fa';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

const roleNavItems: Record<string, NavItem[]> = {
    admin: [
        { label: 'Overview', href: '/dashboard/admin', icon: FaHome },
        { label: 'Users', href: '/dashboard/admin/users', icon: FaUsers },
        { label: 'Artisans', href: '/dashboard/admin/artisans', icon: FaCheckCircle },
        { label: 'Tasks', href: '/dashboard/admin/tasks', icon: FaTasks },
        { label: 'Payments', href: '/dashboard/admin/payments', icon: FaDollarSign },
        { label: 'Settings', href: '/dashboard/admin/settings', icon: FaCog },
    ],
    artisan: [
        { label: 'Overview', href: '/dashboard/artisan', icon: FaHome },
        { label: 'Marketplace', href: '/dashboard/artisan/marketplace', icon: FaSearch },
        { label: 'My Tasks', href: '/dashboard/artisan/tasks', icon: FaTasks },
        { label: 'Earnings', href: '/dashboard/artisan/earnings', icon: FaDollarSign },
        { label: 'Reviews', href: '/dashboard/artisan/reviews', icon: FaStar },
        { label: 'Profile', href: '/dashboard/artisan/profile', icon: FaUser },
        { label: 'Availability', href: '/dashboard/artisan/availability', icon: FaCalendar },
    ],
    client: [
        { label: 'Overview', href: '/dashboard/client', icon: FaHome },
        { label: 'Find Artisans', href: '/dashboard/client/find-artisans', icon: FaSearch },
        { label: 'Post Task', href: '/dashboard/client/post-task', icon: FaPlus },
        { label: 'My Requests', href: '/dashboard/client/requests', icon: FaBriefcase },
        { label: 'Payments', href: '/dashboard/client/payments', icon: FaFileInvoiceDollar },
        { label: 'Favorites', href: '/dashboard/client/favorites', icon: FaHeart },
        { label: 'Profile', href: '/dashboard/client/profile', icon: FaUser },
    ],
};

interface DashboardSidebarProps {
    role: 'admin' | 'artisan' | 'client';
    onClose?: () => void;
}

export default function DashboardSidebar({ role, onClose }: DashboardSidebarProps) {
    const pathname = usePathname();
    const navItems = roleNavItems[role] || [];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <Link href="/">
                        <h1 className="text-2xl font-bold text-brand-green cursor-pointer">
                            Artisans
                        </h1>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{role} Dashboard</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:text-brand-green">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link href={item.href}>
                                    <div
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-brand-green text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
                <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all w-full">
                    <FaSignOutAlt size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
}
