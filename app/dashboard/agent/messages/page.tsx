"use client";

import React from 'react';

export default function AgentMessagesPage() {
    return (
        <div className="h-[calc(100vh-80px)] flex flex-col">
            <div className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-text-main mb-4">Messages</h2>
                        <input type="text" placeholder="Search..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${i === 1 ? 'bg-primary/5 border-primary/10' : ''}`}>
                                <div className="flex items-start gap-3">
                                    <div className="size-10 rounded-full bg-slate-200 shrink-0"></div>
                                    <div className="min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="text-sm font-bold text-text-main truncate">Sarah Jenkins (Manager)</h4>
                                            <span className="text-[10px] text-text-secondary">2m</span>
                                        </div>
                                        <p className="text-xs text-text-secondary truncate">Hey, can you update the product description regarding...</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50">
                    <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-slate-200"></div>
                            <div>
                                <h3 className="text-sm font-bold text-text-main">Sarah Jenkins</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="size-2 bg-green-500 rounded-full"></span>
                                    <span className="text-xs text-text-secondary">Online</span>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="flex justify-center">
                            <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Today</span>
                        </div>

                        <div className="flex justify-end">
                            <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none max-w-sm text-sm shadow-sm">
                                <p>Hi Sarah, I've just submitted the product descriptions for review.</p>
                            </div>
                        </div>

                        <div className="flex justify-start">
                            <div className="bg-white text-text-main p-3 rounded-2xl rounded-tl-none max-w-sm text-sm shadow-sm border border-slate-200">
                                <p>Great! I'll take a look shortly. Thanks for the quick turnaround.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border-t border-slate-200">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-full">
                                <span className="material-symbols-outlined">attach_file</span>
                            </button>
                            <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                            <button className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
