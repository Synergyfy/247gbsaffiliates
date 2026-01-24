"use client";

import React from 'react';

export default function AgentSettingsPage() {
    return (
        <div className="p-8 lg:p-10 max-w-4xl mx-auto w-full">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-text-main">Settings</h1>
                <p className="text-text-secondary text-sm font-medium">Manage your account preferences and notifications.</p>
            </header>

            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-text-main mb-6 border-b border-slate-100 pb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Display Name</label>
                            <input type="text" defaultValue="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Email Address</label>
                            <input type="email" defaultValue="john.doe@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-text-main mb-6 border-b border-slate-100 pb-4">Notifications</h3>
                    <div className="space-y-4">
                        {['New Task Available', 'Payment Received', 'Message from Manager', 'Platform Updates'].map((item) => (
                            <div key={item} className="flex items-center justify-between">
                                <span className="text-sm font-bold text-text-main">{item}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
