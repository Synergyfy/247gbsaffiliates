'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';

export default function AgentSettingsPage() {
    const { user, updateProfile, isUpdating } = useProfile();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            await updateProfile(formData);
            alert('Settings updated successfully!');
        } catch (error) {
            alert('Failed to update settings. Please try again.');
        }
    };

    return (
        <div className="p-8 lg:p-10 max-w-4xl mx-auto w-full font-display">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-text-main uppercase tracking-tighter italic">Settings</h1>
                <p className="text-text-secondary text-sm font-medium italic">Refine your strategic preferences and profile identity.</p>
            </header>

            <div className="space-y-8">
                <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-sm p-8">
                    <h3 className="text-sm font-black text-text-main mb-8 border-b border-slate-100 pb-4 uppercase tracking-widest italic">Profile Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3">Display Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-slate-300" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3">Electronic Mail</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-slate-300 opacity-50 select-none cursor-not-allowed" 
                                disabled
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-sm p-8">
                    <h3 className="text-sm font-black text-text-main mb-8 border-b border-slate-100 pb-4 uppercase tracking-widest italic">Strategic Notifications</h3>
                    <div className="space-y-6">
                        {['New Task Deployment', 'Commission Disbursement', 'Command Center Messages', 'System Evolutions'].map((item) => (
                            <div key={item} className="flex items-center justify-between group">
                                <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">{item}</span>
                                <label className="relative inline-flex items-center cursor-pointer scale-90">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-100 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="bg-primary text-white font-black text-xs uppercase tracking-widest px-10 py-4 rounded-2xl hover:bg-primary-hover hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating Strategic Systems...' : 'Commit Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
