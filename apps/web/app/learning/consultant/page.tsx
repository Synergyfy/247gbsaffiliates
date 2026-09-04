"use client";

import React from 'react';

export default function ConsultantLearningPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-[#0d121b] font-display min-h-screen flex flex-col overflow-x-hidden relative">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] px-6 lg:px-10 py-3 bg-white dark:bg-[#1a202c]">
                <div className="flex items-center gap-4 text-[#0d121b] dark:text-white">
                    <div className="size-8 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">local_library</span>
                    </div>
                    <h2 className="text-[#0d121b] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">Listeo</h2>
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-100">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        <span className="text-xs font-bold uppercase tracking-wide">Retake Pending</span>
                    </div>
                    <button className="flex items-center justify-center overflow-hidden rounded-full size-10 bg-[#e7ebf3] hover:bg-[#dbeafe] text-[#0d121b] transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-white shadow-sm cursor-pointer" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC7XR66lQHV5EvJRffeEiSe4ArHmu1NNL8BCSGHw4KCl5hScar6IokfqtUp0QYHE29esGDGi6yLDCjFwRoNd0bUp093Q-43a-JRMihF6le-KhQjt-_AWMSyj_ImteDdF9EU4omWxyvpH1bDpSINF8djIXXuHjJRcORzzLaa_rNo1OM9rON1ljLNh01_hEZl11RvUNSmkpxgoLO3RU0Eo3-tila2JQ0ziLpfdZX2k_o8pBLXUWod9rNQRxPYX2r5Y7PW7qN9HTHu0nw")' }}>
                    </div>
                </div>
            </header>
            <main className="flex-1 w-full max-w-[1440px] mx-auto p-6 lg:p-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 border-b border-[#e7ebf3] pb-8">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <p className="text-primary text-sm font-bold uppercase tracking-wide">Consultant Level • Retake Preparation Zone</p>
                        <h1 className="text-[#0d121b] dark:text-white text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">Personalized Training Hub</h1>
                        <p className="text-[#4c669a] text-lg font-normal leading-normal mt-2">
                            Focus on your weak points. Based on your last attempt, we've curated a strategy to boost your <span className="font-bold text-[#0d121b] dark:text-gray-200">Auditing</span> and <span className="font-bold text-[#0d121b] dark:text-gray-200">Strategy</span> scores.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 bg-white dark:bg-[#1a202c] p-4 rounded-xl shadow-sm border border-[#e7ebf3] min-w-[320px]">
                        <div className="flex items-center gap-2 mb-2 text-[#4c669a]">
                            <span className="material-symbols-outlined text-[20px]">timer</span>
                            <span className="text-xs font-bold uppercase tracking-wider">Retake Eligibility Window</span>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex grow basis-0 flex-col items-center gap-1">
                                <div className="flex h-12 w-full items-center justify-center rounded-lg bg-background-light dark:bg-gray-800 border border-[#e7ebf3] dark:border-gray-700">
                                    <p className="text-primary text-xl font-bold">04</p>
                                </div>
                                <p className="text-[#4c669a] text-xs font-medium">Days</p>
                            </div>
                            <div className="flex grow basis-0 flex-col items-center gap-1">
                                <div className="flex h-12 w-full items-center justify-center rounded-lg bg-background-light dark:bg-gray-800 border border-[#e7ebf3] dark:border-gray-700">
                                    <p className="text-primary text-xl font-bold">12</p>
                                </div>
                                <p className="text-[#4c669a] text-xs font-medium">Hours</p>
                            </div>
                            <div className="flex grow basis-0 flex-col items-center gap-1">
                                <div className="flex h-12 w-full items-center justify-center rounded-lg bg-background-light dark:bg-gray-800 border border-[#e7ebf3] dark:border-gray-700">
                                    <p className="text-primary text-xl font-bold">45</p>
                                </div>
                                <p className="text-[#4c669a] text-xs font-medium">Mins</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[#0d121b] dark:text-white text-2xl font-bold leading-tight">Performance Diagnostics</h2>
                                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                    View Full Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="mb-4">
                                        <p className="text-[#4c669a] text-sm font-medium mb-1">Growth Bottleneck Identification</p>
                                        <div className="flex items-end gap-3">
                                            <p className="text-[#0d121b] dark:text-white text-4xl font-bold leading-none">65%</p>
                                            <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold mb-1">Needs Improvement</span>
                                        </div>
                                        <p className="text-[#4c669a] text-sm mt-2">Target Score: <span className="font-bold text-primary">85%</span></p>
                                    </div>
                                    <p className="text-sm text-[#4c669a] leading-relaxed">
                                        Your analysis of sales channels is strong, but auditing capabilities lagged in the simulation. Focus your efforts on the <span className="text-[#0d121b] dark:text-gray-200 font-bold">Advanced Business Auditing</span> module.
                                    </p>
                                </div>
                                <div className="flex-1 flex flex-col justify-end">
                                    <div className="grid grid-cols-4 gap-4 h-[180px] items-end px-2">
                                        <div className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                                            <div className="relative w-full bg-[#f1f5f9] rounded-t-md h-full flex items-end overflow-hidden group-hover:bg-[#e2e8f0] transition-colors">
                                                <div className="w-full bg-amber-400 opacity-90 rounded-t-md" style={{ height: '40%' }}></div>
                                            </div>
                                            <p className="text-[#4c669a] text-xs font-bold tracking-wide">Audit</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                                            <div className="relative w-full bg-[#f1f5f9] rounded-t-md h-full flex items-end overflow-hidden group-hover:bg-[#e2e8f0] transition-colors">
                                                <div className="w-full bg-primary opacity-80 rounded-t-md" style={{ height: '70%' }}></div>
                                            </div>
                                            <p className="text-[#4c669a] text-xs font-bold tracking-wide">Strategy</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                                            <div className="relative w-full bg-[#f1f5f9] rounded-t-md h-full flex items-end overflow-hidden group-hover:bg-[#e2e8f0] transition-colors">
                                                <div className="w-full bg-primary rounded-t-md" style={{ height: '90%' }}></div>
                                            </div>
                                            <p className="text-[#4c669a] text-xs font-bold tracking-wide">Sales</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                                            <div className="relative w-full bg-[#f1f5f9] rounded-t-md h-full flex items-end overflow-hidden group-hover:bg-[#e2e8f0] transition-colors">
                                                <div className="w-full bg-primary opacity-80 rounded-t-md" style={{ height: '65%' }}></div>
                                            </div>
                                            <p className="text-[#4c669a] text-xs font-bold tracking-wide">Retain</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[#0d121b] dark:text-white text-xl font-bold mb-4">Strategic Study Modules</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-l-4 border-l-primary border-y-[#e7ebf3] border-r-[#e7ebf3] p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-50 text-primary p-2 rounded-lg">
                                            <span className="material-symbols-outlined">analytics</span>
                                        </div>
                                        <span className="bg-blue-50 text-primary text-xs font-bold px-2 py-1 rounded">In Progress</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">Advanced Business Auditing</h4>
                                    <p className="text-sm text-[#4c669a] mb-4">Deep dive into financial forensics and operational efficiency analysis.</p>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[20%] rounded-full"></div>
                                        </div>
                                        <span className="text-xs font-bold text-[#0d121b] dark:text-white">20%</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-medium text-[#4c669a] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span> 45 min left
                                        </span>
                                        <button className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Resume</button>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">High Priority</div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-gray-100 text-gray-600 p-2 rounded-lg">
                                            <span className="material-symbols-outlined">lightbulb</span>
                                        </div>
                                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">Not Started</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">Growth Bottlenecks</h4>
                                    <p className="text-sm text-[#4c669a] mb-4">Identify and solve scalability issues in enterprise environments.</p>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                                            <div className="h-full bg-gray-300 w-0 rounded-full"></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">0%</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-medium text-[#4c669a] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span> 1.5 hrs
                                        </span>
                                        <button className="bg-white border border-[#e7ebf3] text-[#0d121b] text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Start Module</button>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] p-5 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-green-50 text-green-700 p-2 rounded-lg">
                                            <span className="material-symbols-outlined">check_circle</span>
                                        </div>
                                        <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded">Mastered</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2">Client Retention</h4>
                                    <p className="text-sm text-[#4c669a] mb-4">Strategies for maintaining high-value client relationships long-term.</p>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-full rounded-full"></div>
                                        </div>
                                        <span className="text-xs font-bold text-green-700">100%</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-medium text-[#4c669a] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">verified</span> Completed
                                        </span>
                                        <button className="text-[#4c669a] text-sm font-bold px-4 py-2 hover:text-primary transition-colors">Review</button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#151b26] rounded-xl border border-dashed border-[#d1d5db] p-5 flex flex-col justify-center items-center text-center">
                                    <div className="bg-gray-200 text-gray-500 p-3 rounded-full mb-3">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                    <h4 className="text-md font-bold text-gray-500 mb-1">Final Retake Exam</h4>
                                    <p className="text-xs text-gray-400 mb-4 max-w-[200px]">Unlock by completing 'Advanced Business Auditing' module.</p>
                                    <button className="bg-gray-200 text-gray-400 text-sm font-bold px-4 py-2 rounded-lg cursor-not-allowed" disabled>Locked</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <aside className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] shadow-sm p-6">
                            <h3 className="text-[#0d121b] dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">library_books</span>
                                Recommended Reading
                            </h3>
                            <div className="flex flex-col gap-4">
                                <a className="group flex gap-3 items-start p-3 rounded-lg hover:bg-background-light transition-colors" href="#">
                                    <div className="w-12 h-16 bg-linear-to-br from-gray-200 to-gray-300 rounded shadow-sm flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-gray-500 text-xl">picture_as_pdf</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#0d121b] dark:text-white group-hover:text-primary transition-colors leading-tight mb-1">The Art of the Audit</h4>
                                        <p className="text-xs text-[#4c669a]">PDF • 15 min read</p>
                                        <p className="text-[11px] text-[#4c669a] mt-1 bg-gray-100 dark:bg-gray-700 w-fit px-1.5 py-0.5 rounded">Essential for Retake</p>
                                    </div>
                                </a>
                                <div className="h-px bg-[#e7ebf3] w-full"></div>
                                <a className="group flex gap-3 items-start p-3 rounded-lg hover:bg-background-light transition-colors" href="#">
                                    <div className="w-12 h-16 bg-linear-to-br from-gray-200 to-gray-300 rounded shadow-sm flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-gray-500 text-xl">description</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#0d121b] dark:text-white group-hover:text-primary transition-colors leading-tight mb-1">Q3 Market Analysis</h4>
                                        <p className="text-xs text-[#4c669a]">Case Study • 25 min read</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className="bg-primary/5 rounded-xl border border-primary/10 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-cover bg-center rounded-full size-8" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA3tgKOMcYOswNPlOSuKIGe3dg1n3u2-yhcy6sIlievzcVEQAnEq_ALOii7XyODiYNSCMDvzQ0S2MkpB8kHMeFeXYWW33l9Dmhl4A2Iu9GN-tIweIwhYJ7XClPxcuMGBQK9eLq6WW1AiOTWIrwVtOokqAyMAhrswtuX8j1t4rW8-d6NrtMGqWQ36AQiG16cc0pA39_WxD7hAxO_Bq1eOIjFz7p0TBJU2ihTrSwsNp_N75L5lQcsesA8jaqH5VRuhehE2FmGmzQkcEc")' }}>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase">Mentor Note</p>
                                    <p className="text-xs text-[#4c669a]">Sarah J. • 2 hours ago</p>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute -top-2 -left-1 text-primary/20 text-4xl select-none">format_quote</span>
                                <p className="text-sm text-[#0d121b] dark:text-white relative z-10 italic leading-relaxed pl-2">
                                    "Don't get too caught up in the details of the 'Strategy' section. Your main bottleneck was the auditing compliance checklist. Review the 'Advanced Business Auditing' module first."
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] p-5">
                            <h3 className="text-[#0d121b] dark:text-white text-sm font-bold mb-3">Need extra help?</h3>
                            <button className="w-full flex items-center justify-center gap-2 text-sm font-bold text-[#4c669a] bg-[#f8f9fc] hover:bg-[#e7ebf3] border border-[#e7ebf3] py-2.5 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                Book 1:1 Coaching
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-[600px] blur-sm">
                <div className="bg-[#101622] text-white p-4 rounded-xl shadow-xl flex items-center justify-between gap-4 border border-gray-700/50 bg-opacity-95">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-300">
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold">Ready to retake?</p>
                            <p className="text-xs text-gray-400">Complete 1 more module to unlock.</p>
                        </div>
                    </div>
                    <button className="bg-gray-700 text-gray-400 cursor-not-allowed font-bold text-sm px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap" disabled>
                        Schedule Exam
                    </button>
                </div>
            </div>
        </div>
    );
}
