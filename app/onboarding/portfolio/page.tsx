"use client";

import React from "react";
import Link from "next/link";
import { useOnboardingStore } from "@/store/onboardingStore";

// Mock Data for initial projects (move outside or handle in store)
const INITIAL_PROJECTS = [
    {
        id: 1,
        title: "Modern Bathroom Renovation",
        description: "Full remodel of master bathroom including new tiling, vanity installation, and plumbing fixtures.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWkZKgodlEOYW6r-XvzaiAeDdcenhZESH0ivzJgnnZu99-bc7fh83T96mCqzX11nVAbf8Dkq3iU15s732MaU2PAhj_ihgFJvafajxtLe69m_NxrI9gT3_sSCRQ8H-lxcTKzMyoSB1Cry9MlE-WXKDoxzAWb7gK2X2bgY36Rj64oqqbDV1-9v_4T6VL3yRanKaFNXZnNZepjvb5-gX0bdkgf7VqJfgBYuxeNaxmhPAdZyJER4k5J99LaeskhmzHejF23DcRhOjXXejv",
        isCover: true,
    },
    {
        id: 2,
        title: "Custom Kitchen Cabinetry",
        description: "Designed and installed custom oak cabinets for a client's kitchen renovation project.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJZRStgtnKKoGHmCj9Flw4EtCKGQcAn9N6nSEQsamo8S9kqyYZ1HDstaau6ilxUtXURamQPRN1q6r9SveAyZxTZmhWQHiOcXG524s_EpZxznxpdtQ52cGRwKv6dpEycMMH-PsGISvGAR2gBYvP_vwbODXbNeROVqoFBhHKDuGKF6chBRk2WpCuUqcg6OKgIFnYsLZPUll3kAk7cuRBhGlszakKjTdpJXpHqFI6k2qT2uHanXE5-IkxqtapQAwgR2kFF9ks3y1eGIts",
        isCover: false,
    }
];

export default function PortfolioPage() {
    const { projects, updateData } = useOnboardingStore();

    // Initialize store with mock projects if empty
    React.useEffect(() => {
        if (projects.length === 0) {
            updateData({ projects: INITIAL_PROJECTS });
        }
    }, [projects.length, updateData]);

    const removeProject = (id: number) => {
        updateData({ projects: projects.filter((p: any) => (p as any).id !== id) });
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                        Show your best work
                    </h1>
                    <p className="text-gray-600 text-lg font-medium leading-relaxed">
                        Upload high-quality images of your past projects. A strong portfolio builds trust and helps clients visualize the quality of your craftsmanship.
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="text-right">
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-brand-green text-sm font-black border border-green-100">
                            {projects.length} projects added
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-10">
                {/* Upload Area */}
                <div className="relative w-full rounded-4xl bg-white p-12 group cursor-pointer transition-all hover:shadow-2xl hover:shadow-gray-200/50 border-4 border-dashed border-gray-100 hover:border-brand-green/30 overflow-hidden">
                    <div className="flex flex-col items-center justify-center text-center relative z-10">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-green-50 text-brand-green shadow-sm transition-all group-hover:scale-110 group-hover:bg-brand-green group-hover:text-white">
                            <span className="material-symbols-outlined text-5xl">cloud_upload</span>
                        </div>
                        <h3 className="mb-3 text-2xl font-black text-gray-900 uppercase tracking-tight">Post Your Latest Work</h3>
                        <p className="mb-8 max-w-md text-base text-gray-500 font-medium leading-relaxed">
                            Drag & drop your best project photos here. High resolution (JPG, PNG, WEBP) recommended for maximum impact.
                        </p>
                        <button className="rounded-2xl bg-gray-900 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-black hover:scale-105 active:scale-95">
                            Select Local Files
                        </button>
                    </div>
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-green-50/50 rounded-full blur-3xl group-hover:bg-green-100/50 transition-colors"></div>
                    <input type="file" multiple accept="image/*" className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-20" />
                </div>

                {/* Projects List */}
                <div>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-text-main">Uploaded Projects</h2>
                        <button className="text-sm font-medium text-primary hover:text-primary-hover hover:underline" onClick={() => updateData({ projects: [] })}>Clear all</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {projects.map((project: any, index: number) => (
                            <div key={project.id} className="group flex flex-col gap-8 overflow-hidden rounded-4xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-brand-green/20 hover:shadow-2xl hover:shadow-gray-200/50">
                                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-50">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <button
                                        onClick={() => removeProject(project.id)}
                                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-500 shadow-xl hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                    {project.isCover && (
                                        <div className="absolute left-4 top-4 rounded-xl bg-gray-900 px-4 py-2 text-[10px] font-black text-white border border-white/10 uppercase tracking-widest shadow-lg">
                                            Cover Asset
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Project Title</label>
                                        <input
                                            type="text"
                                            value={project.title}
                                            onChange={(e) => {
                                                const newProjects = [...projects];
                                                newProjects[index] = { ...newProjects[index], title: e.target.value };
                                                updateData({ projects: newProjects });
                                            }}
                                            className="w-full rounded-xl border border-gray-100 bg-white px-5 py-3.5 text-base font-black text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-brand-green/10 transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Project Narrative</label>
                                        <textarea
                                            rows={2}
                                            value={project.description}
                                            onChange={(e) => {
                                                const newProjects = [...projects];
                                                newProjects[index] = { ...newProjects[index], description: e.target.value };
                                                updateData({ projects: newProjects });
                                            }}
                                            className="w-full resize-none rounded-xl border border-gray-100 bg-white px-5 py-3.5 text-sm font-medium text-gray-600 placeholder:text-gray-300 focus:ring-4 focus:ring-brand-green/10 transition-all leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add More Placeholder */}
                        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-transparent p-8 text-center opacity-60 transition-opacity hover:opacity-100 cursor-pointer hover:border-primary/50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                <span className="material-symbols-outlined">add_a_photo</span>
                            </div>
                            <span className="text-sm font-medium text-text-secondary">Add more leads to increase visibility</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-white/90 backdrop-blur-md p-4 px-6 md:px-10 fixed bottom-0 left-0 md:left-72 right-0 z-10">
                <div className="max-w-[1100px] mx-auto flex items-center justify-between">
                    <Link href="/onboarding/profile">
                        <button className="text-text-secondary font-bold hover:text-text-main transition-colors flex items-center gap-2 px-2 py-2">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back
                        </button>
                    </Link>
                    <div className="flex gap-4">
                        <button className="hidden sm:block px-6 py-3 rounded-xl font-bold text-text-secondary hover:bg-gray-100 transition-colors">
                            Save as Draft
                        </button>
                        <Link href="/onboarding/availability">
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
