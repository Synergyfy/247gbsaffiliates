"use client";

import React from 'react';

export default function AccountManagerSettingsPage() {
    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-text-main">Settings</h1>
                <p className="text-text-secondary text-sm font-medium">Configure your dashboard and account preferences.</p>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl">
                <h3 className="text-lg font-bold text-text-main mb-6 border-b border-slate-100 pb-4">General Settings</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Company Name</label>
                        <input type="text" defaultValue="WealthWise Inc." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Timezone</label>
                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                                <option>GMT (London)</option>
                                <option>EST (New York)</option>
                                <option>PST (Los Angeles)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Currency</label>
                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                                <option>GBP (£)</option>
                                <option>USD ($)</option>
                                <option>EUR (€)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20" defaultChecked />
                            <span className="text-sm font-bold text-text-main">Enable Email Notifications for New Campaigns</span>
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
