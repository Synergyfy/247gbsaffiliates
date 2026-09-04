"use client";

import React from 'react';
import Image from 'next/image';

export default function AgentLearningPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white min-h-screen flex flex-col font-display selection:bg-primary/20">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-card-dark/90 backdrop-blur-md border-b border-[#e6f4f2] dark:border-[#1F3A37]">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 text-text-main dark:text-white">
                            <div className="size-8 text-primary">
                                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Listeo</h2>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a className="text-text-muted dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium" href="#">Dashboard</a>
                            <a className="text-primary font-semibold text-sm" href="#">Training Hub</a>
                            <a className="text-text-muted dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium" href="#">My Performance</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative hidden sm:block">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </span>
                            <input className="w-64 bg-[#e6f4f2] dark:bg-[#2A4A46] border-none rounded-lg py-2 pl-10 pr-4 text-sm text-text-main dark:text-white placeholder-primary/70 focus:ring-2 focus:ring-primary/50" placeholder="Search resources..." type="text" />
                        </div>
                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white dark:ring-card-dark shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCtrdVxKWU8Uteauu25EZkZPsLupA-iJw3Sf4HrJEqY3vrdr24y-PUNy2qW3WrIGhLU2EQHhBrk1FPKJyJiRNbArZe2PDnqX-rymYXBEEwwFG_E_Z8zLSRFd0QyqUhsTns0n2MUHQ7-wC1nAhRNaBCz8LDct0ioqVgxiMXi4cIQUfZsWV23Hjk_9aVxvhtRZT2Q1uVd3PQeT3FVb5DMpJ6BWnLlvSagYC0KIFuf8VDnrntHmxcwbS4Wx1iaJSDWhc8AZVAwWfp97ZY")' }}></div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-10 py-8 flex flex-col gap-10">
                {/* Header Section: Intro & Timer */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Text Intro */}
                    <div className="lg:col-span-7 flex flex-col gap-4 pt-2">
                        <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wide">
                            <span className="material-symbols-outlined text-sm">warning</span> Action Required
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-text-main dark:text-white leading-[1.1]">
                            Retake Prep:<br />Recommended Study Path
                        </h1>
                        <p className="text-lg text-text-muted dark:text-gray-400 max-w-2xl leading-relaxed">
                            Don't worry, you're almost there. We've curated these specific lessons to help you master the topics covered in the questions you missed.
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <button className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all">
                                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                                <span className="text-sm font-semibold text-text-main dark:text-white group-hover:text-primary transition-colors">View Quiz Results</span>
                            </button>
                            <a className="text-sm font-medium text-primary hover:text-primary-dark underline decoration-2 underline-offset-4" href="#">Why do I need to retake?</a>
                        </div>
                    </div>
                    {/* Right: Countdown Timer Card */}
                    <div className="lg:col-span-5 w-full">
                        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-soft border border-primary/10 dark:border-primary/20 relative overflow-hidden">
                            {/* Decor element */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div>
                                    <h3 className="text-lg font-bold text-text-main dark:text-white">Retake Unlocks In</h3>
                                    <p className="text-sm text-text-muted dark:text-gray-400">Available after 24hr cooldown</p>
                                </div>
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <span className="material-symbols-outlined">timer</span>
                                </div>
                            </div>
                            <div className="flex gap-3 relative z-10">
                                {/* Hours */}
                                <div className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full aspect-4/3 bg-[#e6f4f2] dark:bg-[#1F3A37] rounded-xl flex items-center justify-center border border-primary/10">
                                        <span className="text-3xl font-bold text-primary">23</span>
                                    </div>
                                    <span className="text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wide">Hours</span>
                                </div>
                                {/* Separator */}
                                <div className="flex flex-col justify-center pb-6">
                                    <span className="text-2xl font-bold text-primary/30">:</span>
                                </div>
                                {/* Minutes */}
                                <div className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full aspect-4/3 bg-[#e6f4f2] dark:bg-[#1F3A37] rounded-xl flex items-center justify-center border border-primary/10">
                                        <span className="text-3xl font-bold text-primary">45</span>
                                    </div>
                                    <span className="text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wide">Mins</span>
                                </div>
                                {/* Separator */}
                                <div className="flex flex-col justify-center pb-6">
                                    <span className="text-2xl font-bold text-primary/30">:</span>
                                </div>
                                {/* Seconds */}
                                <div className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full aspect-4/3 bg-[#e6f4f2] dark:bg-[#1F3A37] rounded-xl flex items-center justify-center border border-primary/10">
                                        <span className="text-3xl font-bold text-primary">12</span>
                                    </div>
                                    <span className="text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wide">Secs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-end justify-between px-1">
                        <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-3">
                            Priority Lessons
                            <span className="text-sm font-normal text-text-muted dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">3 Lessons</span>
                        </h2>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-text-main dark:text-white mb-1">0/3 Reviewed</p>
                            <p className="text-xs text-text-muted dark:text-gray-400">0% Complete</p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-0 transition-all duration-500" style={{ width: '5%' }}></div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="group bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft hover:shadow-hover border border-transparent hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
                        <div className="relative h-40 rounded-xl overflow-hidden mb-5 bg-gray-100">
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-text-main dark:text-white flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-sm text-red-500">priority_high</span> Missed Q4
                            </div>
                            <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDiBLaGfIOTNRLauh2KaL-pUdShsUTj6xgyPXeNG-O6q5Zhsg_oHTAqBPTm8LKuMvQWGrYi8N0psf6vQetZvwksZ0xtREJ3Gc_AKhVVc-rFTIdjkPY3ZLIPSW_R1aNupOr794eQEYBOSli2Y6vsoso6X0pnfek1slz0cDwnjd4gj-tYetd0243LsV2Q3-drTLFgCqIRWZMDJq5cwlMtFlcJFKgD8aObkXNf_ntZMjgcn-jnbFnXQ2YJPJU7abwoptnoyDyB1Pemwx8")' }}></div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-primary">
                                <span className="material-symbols-outlined text-sm">schedule</span> 15 Mins
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>Marketing</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-main dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">Advanced SEO Blurbs</h3>
                            <p className="text-sm text-text-muted dark:text-gray-400 mb-6 line-clamp-2">Master the art of writing concise, keyword-rich blurbs that drive traffic without stuffing.</p>
                            <div className="mt-auto">
                                <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                    Start Lesson
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div className="group bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft hover:shadow-hover border border-transparent hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
                        <div className="relative h-40 rounded-xl overflow-hidden mb-5 bg-gray-100">
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-text-main dark:text-white flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-sm text-red-500">priority_high</span> Missed Q7 & Q9
                            </div>
                            <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCQI7tgcP65_kWfjLfJaHYAlPZMEAQLSjcnDE_Kn3-IkixNb-3zYQN51Yef1Mmt8wD5G03ouvy8Kq9OM8ABw2W2IjiodTXW6uopl9k1tuKDPCtsFESAmIl742GmNs3n4R2VV1Fqsswh5LWKxgBiIDAU11f6uw5c6A6DkgG3_ZIWqQz9wFzJ_ekFpcx3yF89NTIhhOpEahvDuk_czUxHs_h-tT1uYVcxXYFeGKEatUWkft1YM0L-wRk0Mgcx99RUmk2KRRuda2CQOyU")' }}></div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-primary">
                                <span className="material-symbols-outlined text-sm">schedule</span> 10 Mins
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>Soft Skills</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-main dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">Time Management 101</h3>
                            <p className="text-sm text-text-muted dark:text-gray-400 mb-6 line-clamp-2">Strategies for prioritizing tasks and managing your schedule effectively as an agent.</p>
                            <div className="mt-auto">
                                <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                    Start Lesson
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Card 3 */}
                    <div className="group bg-white dark:bg-card-dark rounded-2xl p-5 shadow-soft hover:shadow-hover border border-transparent hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
                        <div className="relative h-40 rounded-xl overflow-hidden mb-5 bg-gray-100">
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-text-main dark:text-white flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-sm text-red-500">priority_high</span> Missed Q12
                            </div>
                            <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGivyL1JzAs_3w043m8qHtLh9EcTjEKeGa72-PEJUwsz_8XFAWEc794B-uUZHajzVKkrDdrdj2MW0guVtFZuXlNstxsyzDYezyBABB0H3Fyllhc8q7NUxpo5Ntb1dNB8K3LcsqDtbDAcKE7wdXaxNeRfjHKNCijhbu3g6XwDjZcEkqmBR227tDHs5NbsoWhwmsAExz0NSIeaIRda3-Bowd2YQPTCE-Bz-5DFbGO6ogi9SOCKwqGp9MLsoyjO8tfbBbH3GhKRPxfDc")' }}></div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-primary">
                                <span className="material-symbols-outlined text-sm">schedule</span> 20 Mins
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>Compliance</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-main dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">Platform Ethics & Guidelines</h3>
                            <p className="text-sm text-text-muted dark:text-gray-400 mb-6 line-clamp-2">A deep dive into the community standards and ethical responsibilities of every agent.</p>
                            <div className="mt-auto">
                                <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                    Start Lesson
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Help Section */}
                <div className="mt-8 bg-[#e6f4f2] dark:bg-[#152e2a] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-card-dark rounded-full text-primary shadow-sm">
                            <span className="material-symbols-outlined text-2xl">help</span>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-text-main dark:text-white">Need extra help?</h4>
                            <p className="text-sm text-text-muted dark:text-gray-400">Our mentors are available for a quick chat to clarify doubts.</p>
                        </div>
                    </div>
                    <button className="whitespace-nowrap px-6 py-3 bg-white dark:bg-card-dark text-text-main dark:text-white font-bold rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors">
                        Contact Mentor
                    </button>
                </div>
            </main>
        </div>
    );
}
