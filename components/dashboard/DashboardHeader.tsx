"use client";

import { useState } from 'react';
import { FaBell, FaSearch, FaUser, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const notifications = [
        { id: 1, text: 'New task assigned to you', time: '5m ago', unread: true },
        { id: 2, text: 'Payment received', time: '1h ago', unread: true },
        { id: 3, text: 'Review received', time: '2h ago', unread: false },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-4 flex items-center justify-between">
                {/* Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
                        className="lg:hidden p-2 text-gray-500 hover:text-brand-green transition-colors"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent w-64"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FaBell size={20} className="text-gray-600" />
                            {notifications.some(n => n.unread) && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50' : ''
                                                    }`}
                                            >
                                                <p className="text-sm text-gray-900">{notification.text}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 text-center border-t border-gray-200">
                                        <button className="text-sm text-brand-green font-medium hover:underline">
                                            View all notifications
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                JD
                            </div>
                            <FaChevronDown size={12} className="text-gray-600" />
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                                >
                                    <div className="p-3 border-b border-gray-200">
                                        <p className="font-semibold text-gray-900">John Doe</p>
                                        <p className="text-xs text-gray-500">john@example.com</p>
                                    </div>
                                    <div className="py-2">
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                                            Profile Settings
                                        </button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                                            Help & Support
                                        </button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
