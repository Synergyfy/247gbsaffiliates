"use client";

import React from "react";
import Link from "next/link";
import { useOnboardingStore } from "@/store/onboardingStore";

const DAYS = [
    { name: "Monday", defaultChecked: true },
    { name: "Tuesday", defaultChecked: true },
    { name: "Wednesday", defaultChecked: true },
    { name: "Thursday", defaultChecked: true },
    { name: "Friday", defaultChecked: true },
    { name: "Saturday", defaultChecked: false },
    { name: "Sunday", defaultChecked: false },
];

export default function AvailabilityPage() {
    const { schedule, radius, updateData } = useOnboardingStore();

    // Initialize store with default schedule if empty
    React.useEffect(() => {
        if (schedule.length === 0) {
            updateData({
                schedule: DAYS.map((d) => ({
                    ...d,
                    start: "09:00",
                    end: "17:00",
                    active: d.defaultChecked,
                }))
            });
        }
    }, [schedule.length, updateData]);

    const setRadius = (newRadius: number) => updateData({ radius: newRadius });
    const setSchedule = (newSchedule: any[]) => updateData({ schedule: newSchedule });

    const toggleDay = (index: number) => {
        const newSchedule = [...schedule];
        newSchedule[index].active = !newSchedule[index].active;
        setSchedule(newSchedule);
    };

    const updateTime = (index: number, field: "start" | "end", value: string) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    const applyMonFri = () => {
        const monSchedule = schedule[0];
        const newSchedule = schedule.map((day, i) => {
            if (i >= 0 && i <= 4) {
                return { ...day, start: monSchedule.start, end: monSchedule.end, active: true };
            }
            return day;
        });
        setSchedule(newSchedule);
    };

    return (
        <div className="animate-fade-in-up">
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                    Set your availability & service area
                </h1>
                <p className="text-gray-600 text-lg font-medium max-w-2xl leading-relaxed">
                    Define when you want to work and how far you are willing to travel. These settings can be changed at any time.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left Column: Work Schedule */}
                <section className="xl:col-span-7 flex flex-col gap-8">
                    <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-brand-green">calendar_clock</span>
                                    </div>
                                    Work Schedule
                                </h2>
                            </div>
                            <button
                                onClick={applyMonFri}
                                className="text-brand-green text-sm font-black hover:text-green-700 transition-colors uppercase tracking-widest"
                            >
                                Apply Mon-Fri
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {schedule.map((day, index) => (
                                <div
                                    key={day.name}
                                    className={`
                    group flex flex-col sm:flex-row sm:items-center justify-between p-6 px-8 transition-all gap-4
                    ${day.active ? "bg-white hover:bg-gray-50/50" : "bg-gray-50/50 grayscale-[0.5] opacity-60"}
                  `}
                                >
                                    <div className="flex items-center gap-6 min-w-[160px]">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={day.active}
                                                onChange={() => toggleDay(index)}
                                            />
                                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                                        </label>
                                        <span className={`text-lg font-black ${day.active ? "text-gray-900" : "text-gray-400"}`}>
                                            {day.name}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-4 w-full sm:w-auto ${!day.active ? "pointer-events-none select-none" : ""}`}>
                                        <div className="relative flex-1 sm:flex-none">
                                            <input
                                                type="time"
                                                value={day.start}
                                                onChange={(e) => updateTime(index, 'start', e.target.value)}
                                                disabled={!day.active}
                                                className="block w-full sm:w-36 rounded-xl border-none bg-gray-100 px-4 py-3 text-base font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all"
                                            />
                                        </div>
                                        <span className="text-gray-300 font-black text-xl">–</span>
                                        <div className="relative flex-1 sm:flex-none">
                                            <input
                                                type="time"
                                                value={day.end}
                                                onChange={(e) => updateTime(index, 'end', e.target.value)}
                                                disabled={!day.active}
                                                className="block w-full sm:w-36 rounded-xl border-none bg-gray-100 px-4 py-3 text-base font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Right Column: Service Area */}
                <section className="xl:col-span-5 flex flex-col gap-6 sticky top-6">
                    <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 flex flex-col gap-8 h-full">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-brand-green">distance</span>
                                </div>
                                Service Area
                            </h2>
                            <p className="text-gray-600 font-medium">Where are you available to work?</p>
                        </div>

                        <div className="flex flex-col gap-6">
                            <label className="block space-y-3">
                                <span className="text-sm font-black text-gray-900 uppercase tracking-widest block">City or Zip Code</span>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400">search</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. Seattle, WA"
                                        defaultValue="Seattle, WA"
                                        className="block w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-gray-50 text-base font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all shadow-inner"
                                    />
                                </div>
                            </label>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-5">
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Service Radius</span>
                                    <span className="inline-flex items-center px-3 py-1 bg-brand-green text-white text-xs font-black rounded-lg shadow-lg shadow-brand-green/20">
                                        {radius} km
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="100"
                                    value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-green"
                                />
                                <div className="flex justify-between mt-3">
                                    <span className="text-[10px] text-gray-400 font-black">5 KM</span>
                                    <span className="text-[10px] text-gray-400 font-black">100 KM</span>
                                </div>
                            </div>
                        </div>

                        {/* Map Visualization */}
                        <div className="relative w-full aspect-square sm:aspect-video xl:aspect-square rounded-xl overflow-hidden shadow-inner border border-gray-100 group cursor-grab active:cursor-grabbing">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHTW013ZEHp_cBZBz42ZLL5rHqe4H2a67_5LVqeQmVtccPi-opuCZ4hDYaepHliWbEV1W89wyvZYZSiop13W6seBP7v-83ElpdHsmq5IwC5l5aHhDKY6fLdkvIamatf_TfmQiW1jgBxF5mahVx6uqqnVQ4ZZQzmozvuqaV37Xa-NCoQay89M8tZe-yFuiVaQOe3s-RDjIb44aIoYWsYPnzEiATv3IA682TH1qFfLpfufBCMGrXXvUB3nFmajR1IKGNWu3bS2WkpcVj"
                                data-location="Seattle"
                                alt="Grayscale map view of a city grid used for selecting service area"
                                className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Radius Circle Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative flex items-center justify-center">
                                    {/* Pulsing effect */}
                                    <div
                                        className="absolute bg-primary rounded-full opacity-20 animate-ping"
                                        style={{ width: `${radius * 5}px`, height: `${radius * 5}px`, maxWidth: '100%', maxHeight: '100%' }}
                                    ></div>
                                    {/* Main Circle */}
                                    <div
                                        className="bg-primary/20 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(61,123,82,0.3)] backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-300"
                                        style={{ width: `${radius * 5}px`, height: `${radius * 5}px`, maxWidth: '90%', maxHeight: '90%' }}
                                    >
                                        {/* Center Pin */}
                                        <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-md relative">
                                            <div className="absolute -top-8 -left-[14px] bg-surface-light text-text-main text-[10px] font-bold py-1 px-2 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                You are here
                                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-light rotate-45"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Controls (Visual only) */}
                            <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                                <button className="w-8 h-8 bg-white rounded-md shadow-md flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-lg">add</span>
                                </button>
                                <button className="w-8 h-8 bg-white rounded-md shadow-md flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-lg">remove</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-white/90 backdrop-blur-md p-4 px-6 md:px-10 fixed bottom-0 left-0 md:left-72 right-0 z-10">
                <div className="max-w-[1100px] mx-auto flex items-center justify-between">
                    <Link href="/onboarding/portfolio">
                        <button className="text-text-secondary font-bold hover:text-text-main transition-colors flex items-center gap-2 px-2 py-2">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back
                        </button>
                    </Link>
                    <div className="flex gap-4">
                        <button className="hidden sm:block px-6 py-3 rounded-xl font-bold text-text-secondary hover:bg-gray-100 transition-colors">
                            Save as Draft
                        </button>
                        <Link href="/onboarding/verification">
                            <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                                Continue
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="h-20"></div> {/* Spacer for fixed footer */}
        </div>
    );
}
