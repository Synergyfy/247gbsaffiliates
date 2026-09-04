"use client";

import React from 'react';
import { FormInput } from '@/components/ui/FormComponents'; // Assuming this exists or using simple implementation
import { useForm } from 'react-hook-form';

export default function AdminSettingsPage() {
    const { register } = useForm();

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-text-main mb-2">Platform Settings</h1>
                <p className="text-slate-500 font-medium">Configure general platform preferences and maintenance.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">tune</span>
                        General Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main">Site Name</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-primary transition-all font-medium" defaultValue="Help2Home" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main">Support Email</label>
                            <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-primary transition-all font-medium" defaultValue="support@help2home.com" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                    <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">security</span>
                        Access Control
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer group">
                            <div>
                                <p className="font-bold text-text-main group-hover:text-primary transition-colors">Maintenance Mode</p>
                                <p className="text-xs text-slate-500">Disable platform access for non-admin users</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                                <div className="absolute left-1 top-1 size-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer group">
                            <div>
                                <p className="font-bold text-text-main group-hover:text-primary transition-colors">New User Registration</p>
                                <p className="text-xs text-slate-500">Allow new users to sign up</p>
                            </div>
                            <div className="w-12 h-6 bg-primary rounded-full relative">
                                <div className="absolute right-1 top-1 size-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold font-display transition-all shadow-lg shadow-primary/20">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
