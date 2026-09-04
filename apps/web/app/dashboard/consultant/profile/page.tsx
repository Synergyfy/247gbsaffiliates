'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';

export default function ConsultantProfilePage() {
    const { user, updateProfile, isUpdating } = useProfile();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || 'Senior Strategic Advisor with expert-level proficiency in tactical analysis and platform optimization.',
        skills: user?.skills || ['Strategic Planning', 'Business Auditing', 'Tactical Growth'],
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || 'Senior Strategic Advisor with expert-level proficiency in tactical analysis and platform optimization.',
                skills: user.skills || ['Strategic Planning', 'Business Auditing', 'Tactical Growth'],
            });
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            alert('Strategic profile updated successfully!');
        } catch (error) {
            alert('Failed to update strategic profile.');
        }
    };

    return (
        <div className="p-8 lg:p-10 max-w-5xl mx-auto w-full font-display">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-text-main uppercase tracking-tighter italic">Strategic Profile</h1>
                <p className="text-text-secondary text-sm font-medium italic">Manage your public expert identity and tactical expertise.</p>
            </header>

            <div className="bg-surface-light rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
                <div className="flex items-center gap-10 mb-12">
                    <div className="relative group">
                        <div className="size-32 rounded-[2.5rem] bg-slate-800 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center text-white text-3xl font-black italic">
                            {user?.name.slice(0, 2).toUpperCase()}
                        </div>
                        <button className="absolute -bottom-2 -right-2 size-10 bg-primary text-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center hover:scale-110 transition-all">
                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                        </button>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-text-main italic">{user?.name}</h2>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic border-b border-primary/20 pb-1 w-fit">Tactical Consultant ID: #{user?.id.slice(0, 8)}</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3">Professional Nomenclature</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all italic" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3">Tactical Expertise Index</label>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {formData.skills.map((skill) => (
                                <span key={skill} className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 italic tracking-widest border border-slate-800 shadow-md">
                                    {skill}
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })}
                                        className="hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Attribute new skill matrix..." 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = (e.target as HTMLInputElement).value.trim();
                                        if (val && !formData.skills.includes(val)) {
                                            setFormData({ ...formData, skills: [...formData.skills, val] });
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }
                                }}
                                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all italic placeholder:text-slate-300" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3">Operational Directive / Bio</label>
                        <textarea 
                            rows={5} 
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all italic leading-relaxed" 
                        />
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button 
                            type="submit"
                            disabled={isUpdating}
                            className="bg-primary text-white font-black text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-2xl hover:bg-primary-hover hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {isUpdating ? 'Executing Tactical Update...' : 'Commit Strategic Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
