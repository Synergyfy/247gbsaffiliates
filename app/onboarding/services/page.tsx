"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function ServicesPage() {
    const { services, updateData } = useOnboardingStore();
    const [newService, setNewService] = useState({ name: "", price: "" });

    const handleAddService = () => {
        if (!newService.name || !newService.price) return;

        const serviceToAdd = {
            id: Date.now().toString(),
            name: newService.name,
            price: parseInt(newService.price.replace(/,/g, ''), 10)
        };

        updateData({ services: [...services, serviceToAdd] });
        setNewService({ name: "", price: "" });
    };

    const removeService = (id: string) => {
        updateData({ services: services.filter(s => s.id !== id) });
    };

    return (
        <div className="animate-fade-in-up">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                    Set Your Service Menu
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl font-medium">
                    List specific tasks you perform and your rate for each. Clients prefer clear pricing over hourly estimates.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Column: Form */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Input Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg shadow-gray-200/50">
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-green">add_task</span>
                            Add a New Service
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Service Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Install AC Unit"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all placeholder:text-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Price (₦)</label>
                                <input
                                    type="number"
                                    placeholder="5000"
                                    value={newService.price}
                                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-brand-green/10 transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleAddService}
                                disabled={!newService.name || !newService.price}
                                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Add to List
                            </button>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Your Services ({services.length})</h3>
                        </div>

                        {services.length === 0 ? (
                            <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
                                <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">format_list_bulleted</span>
                                <p className="text-gray-500 font-medium">No services added yet. Add at least one to continue.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {services.map((service) => (
                                    <div key={service.id} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between hover:border-brand-green/30 hover:shadow-md transition-all">
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900">{service.name}</h4>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-xl font-black text-brand-green">₦{service.price.toLocaleString()}</span>
                                            <button
                                                onClick={() => removeService(service.id)}
                                                className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Preview/Tips */}
                <div className="lg:col-span-4 hidden lg:block">
                    <div className="bg-brand-green/5 rounded-3xl p-8 sticky top-32">
                        <h3 className="text-lg font-black text-brand-green mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined">lightbulb</span>
                            Pro Tips
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-sm font-medium text-gray-600 leading-relaxed">
                                <span className="material-symbols-outlined text-brand-green shrink-0">check_circle</span>
                                Break down big jobs into smaller tasks (e.g., "Room Painting" vs "Whole House").
                            </li>
                            <li className="flex gap-3 text-sm font-medium text-gray-600 leading-relaxed">
                                <span className="material-symbols-outlined text-brand-green shrink-0">check_circle</span>
                                Competitive fixed prices attract 60% more clients than hourly rates.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="border-t border-gray-200 bg-white/90 backdrop-blur-md p-4 px-6 md:px-10 fixed bottom-0 left-0 md:left-72 right-0 z-10">
                <div className="max-w-[1100px] mx-auto flex items-center justify-between">
                    <Link href="/onboarding/profile">
                        <button className="text-gray-500 font-bold hover:text-gray-900 transition-colors flex items-center gap-2 px-2 py-2">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back
                        </button>
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/onboarding/portfolio">
                            <button
                                disabled={services.length === 0}
                                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="h-24"></div>
        </div>
    );
}
