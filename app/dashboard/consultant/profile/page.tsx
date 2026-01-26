"use client";

import React from 'react';

export default function ConsultantProfilePage() {
    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-text-main">Consultant Profile</h1>
                <p className="text-text-secondary text-sm font-medium">Manage your public profile and expertise.</p>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-3xl">
                <div className="flex items-center gap-6 mb-8">
                    <div className="size-24 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden">
                        <img
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5WQs5AcsGU5iEJYEdetO1a1E9jyhOFoI667C-RD0wQEHeejEfCv47tosiwIb8I7ziyt54R_f-rgG2sLBHqzSRXSN5Oxpc3cMM8BsLGvrAcPe7mGEV1gmF4F8jqXFgAGHC5L26aYoV5NxyxQJ3M8zSSpAoLEcDVK_C6eawQue2b4zkSfgYHob9kS9lBcfnnR_3raNLupAnQXZmDfbFkxrzxf4Z2qTfwpKxQHGkaP5HOK7nqmfxz0EHGmWCwsxTmnP0hhEsjUn_XF0"
                        />
                    </div>
                    <div>
                        <button className="bg-slate-100 hover:bg-slate-200 text-text-main font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                            Change Photo
                        </button>
                    </div>
                </div>

                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">First Name</label>
                            <input type="text" defaultValue="Sarah" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Last Name</label>
                            <input type="text" defaultValue="Jenkins" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Expertise</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {['Strategic Planning', 'Business Auditing', 'Growth Marketing'].map((skill) => (
                                <span key={skill} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    {skill}
                                    <button type="button" className="hover:text-red-500">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input type="text" placeholder="Add a skill..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Bio</label>
                        <textarea rows={4} defaultValue="Senior Business Consultant with over 10 years of experience in scaling enterprise operations." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
