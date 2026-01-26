"use client";

import React from 'react';

export default function SessionsPage() {
    return (
        <div className="p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-text-main">Sessions</h1>
                    <p className="text-text-secondary text-sm font-medium">Manage your upcoming consultations.</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                    Set Availability
                </button>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <h3 className="font-bold text-lg text-text-main">Upcoming Sessions</h3>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">3 This Week</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { client: 'Marcus Aurelius', time: 'Today, 2:00 PM', topic: 'Strategic Planning', status: 'Confirmed' },
                        { client: 'Elena Rodriguez', time: 'Tomorrow, 10:00 AM', topic: 'Audit Review', status: 'Pending' },
                        { client: 'TechStart Corp', time: 'Fri, 11:30 AM', topic: 'Growth Consultation', status: 'Confirmed' },
                    ].map((session, i) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                    {session.time.split(',')[0].substring(0, 3)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-main">{session.topic}</h4>
                                    <p className="text-sm text-text-secondary">with {session.client} • {session.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${session.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {session.status}
                                </span>
                                <button className="text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">more_vert</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
