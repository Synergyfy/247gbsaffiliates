export default function ApprovalPage() {
    return (
        <div className="flex flex-1 overflow-hidden h-[calc(100vh-65px)]">
            <aside className="w-80 bg-surface-light border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                        Items for Review
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 bg-primary/5 border-l-4 border-primary cursor-pointer transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-text-main leading-tight">
                                Product Blurbs Set A
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                NEW
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary mb-3">
                            Copywriting • 450 words
                        </p>
                        <div className="flex items-center gap-2">
                            <div
                                className="size-5 rounded-full bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCGRgjDoBYAzITP6zmKP7CEtIDmt47MxM_JRnNJ3IqJIc2XRZg23brJY-YJ2SshT7QNCBuUbToGOFg9sWnslIKz9alkDuPoj1inp4AHqg8rGAl0AArtxS3YqFA4Mzw77br9uQCRYqTZVIQdwOyn7QI6y09aH_QscIvgluRVOBX2WzpA51GkltMfhdyWCyFko7mWkvq3V3ZCOIVuLaUgo2fFg_9OfJXzCvqfbijYTQqJCjrfuuPYGpp4KR1qaXdWwRFD9FmWAfDcUI')",
                                }}
                            ></div>
                            <span className="text-[11px] font-medium text-text-main">
                                Sarah Chen
                            </span>
                        </div>
                    </div>
                    {/* Item 2 */}
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-text-main leading-tight">
                                SEO Audit Draft
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary mb-3">
                            Technical • PDF Report
                        </p>
                        <div className="flex items-center gap-2">
                            <div
                                className="size-5 rounded-full bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpWmmHkrH164X-iR4nyixeYI1O2syrx1mcZuXdrLEorbWl4Qnb9MNB75w1VvqlnlOpZjrUT-sdXQrojiRC5hs6pzEIi7OA2ixx25k2_LEsmRlgzuMEEbnT3YhombBa3MWOUqg4VRq-ryD8ZlopXPlI_qPVtWkUAZTyTNbrMiOdqwfUO96yIRU4vjpj2cULsokG3CirbxEevq_IZix0C7-pNbYRGsPr8fDfOm7ajnacwvjVPXcw1QeLXk3un7erKVYnRTXFyLrASwg')",
                                }}
                            ></div>
                            <span className="text-[11px] font-medium text-text-main">
                                Marcus Wright
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col bg-slate-50">
                <div className="h-16 bg-surface-light border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-text-main">
                            Product Blurbs Set A
                        </h2>
                        <span className="text-xs text-text-secondary">
                            Uploaded 2 hours ago
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2 rounded-lg border-2 border-slate-800 text-slate-800 font-bold text-sm hover:bg-slate-800 hover:text-white transition-all">
                            <span className="material-symbols-outlined text-[18px]">
                                history
                            </span>
                            Request Revision
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
                            <span className="material-symbols-outlined text-[18px]">
                                task_alt
                            </span>
                            Approve
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto bg-surface-light rounded-xl border border-slate-200 shadow-sm p-10 min-h-[800px]">
                        <article className="prose prose-slate max-w-none">
                            <div className="mb-8 border-b border-slate-100 pb-6">
                                <h1 className="text-3xl font-black text-text-main mb-2 tracking-tight">
                                    New Sustainable Runner 2.0
                                </h1>
                                <p className="text-text-secondary italic">
                                    Tagline: "The only footprint you'll leave is a better one."
                                </p>
                            </div>
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">
                                        Product Description
                                    </h3>
                                    <p className="text-text-main leading-relaxed text-lg">
                                        Crafted from 100% ocean-recycled polymers and bio-based
                                        eucalyptus fiber, the Runner 2.0 redefines what
                                        high-performance footwear looks like. Designed for the urban
                                        athlete who doesn't want to compromise on ethics or
                                        endurance.
                                    </p>
                                </section>
                                <section>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">
                                        Key Features
                                    </h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-primary mt-1">
                                                eco
                                            </span>
                                            <span className="text-text-main">
                                                Zero-Waste manufacturing process reducing carbon impact
                                                by 45%.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-primary mt-1">
                                                bolt
                                            </span>
                                            <span className="text-text-main">
                                                Kinetic Energy return sole for superior responsiveness.
                                            </span>
                                        </li>
                                    </ul>
                                </section>
                            </div>
                        </article>
                    </div>
                </div>
            </main>

            <aside className="w-80 bg-surface-light border-l border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                        Feedback
                    </h3>
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                        chat
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div
                                className="size-6 rounded-full bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCGRgjDoBYAzITP6zmKP7CEtIDmt47MxM_JRnNJ3IqJIc2XRZg23brJY-YJ2SshT7QNCBuUbToGOFg9sWnslIKz9alkDuPoj1inp4AHqg8rGAl0AArtxS3YqFA4Mzw77br9uQCRYqTZVIQdwOyn7QI6y09aH_QscIvgluRVOBX2WzpA51GkltMfhdyWCyFko7mWkvq3V3ZCOIVuLaUgo2fFg_9OfJXzCvqfbijYTQqJCjrfuuPYGpp4KR1qaXdWwRFD9FmWAfDcUI')",
                                }}
                            ></div>
                            <span className="text-xs font-bold text-text-main">
                                Sarah Chen
                            </span>
                            <span className="text-[10px] text-text-secondary ml-auto">
                                9:45 AM
                            </span>
                        </div>
                        <div className="bg-slate-100 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl text-xs leading-relaxed text-text-main">
                            I've adjusted the tone to be slightly more aggressive toward
                            performance.
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100">
                    <div className="relative">
                        <textarea
                            className="w-full text-xs bg-slate-50 border-slate-200 rounded-lg focus:ring-primary focus:border-primary resize-none p-3 pr-10"
                            placeholder="Type your feedback..."
                            rows={3}
                        ></textarea>
                        <button className="absolute bottom-3 right-3 text-primary hover:text-primary-hover">
                            <span className="material-symbols-outlined text-[20px]">
                                send
                            </span>
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}
