export default function HistoryPage() {
    return (
        <div className="max-w-[1200px] mx-auto p-6 space-y-6">
            <div className="flex flex-wrap gap-2 items-center">
                <a className="text-text-secondary text-sm font-medium hover:text-primary" href="#">
                    Client Portal
                </a>
                <span className="text-text-secondary text-sm">/</span>
                <span className="text-text-main text-sm font-medium">
                    Approval History Log
                </span>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-col gap-1">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em]">
                        Approval History
                    </h1>
                    <p className="text-text-secondary text-base font-normal">
                        Audit trail of all campaign items and assets approved by the account
                        management team.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold tracking-[0.015em] shadow-lg shadow-primary/20 hover:opacity-90 transition-colors">
                        <span className="material-symbols-outlined mr-2 text-[18px]">
                            file_download
                        </span>
                        <span>Export All Approved</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                        Today, Oct 24
                    </span>
                    <div className="h-px grow bg-slate-200"></div>
                </div>

                {/* Log Item 1 */}
                <div className="bg-surface-light rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[28px]">
                                ad_units
                            </span>
                        </div>
                        <div>
                            <h4 className="text-text-main font-bold text-base leading-none">
                                Summer Outreach Social Assets
                            </h4>
                            <p className="text-text-secondary text-sm mt-1">
                                Campaign:{" "}
                                <span className="text-text-main font-medium">Summer 2024</span>{" "}
                                • ID: #APP-2045
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <p className="text-xs text-text-secondary font-medium uppercase tracking-tighter">
                                Approved By
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div
                                    className="size-6 rounded-full bg-cover bg-center"
                                    style={{
                                        backgroundImage:
                                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDaoyuSTtHs7VK6t41X_heEl52LC-awkr9GTUGWyhDIWU93_S2hLUNpsPfwp0xIYSbgEccek0ydjhAAfbxkuyk7HVBZJvcm2tj-0K_jZVDVn51YFhyRMJYZOY2_22qSUkEoAiUFDTa8oJv1wX0w38D_0-oj-Xf6ZvolbohgvdBsQkBj9VKFMJrsOmqIlTOQksl62obwd6d-vKSa2zy8eKoTy-4Vx3G7LupVKfacDKdvouOXjiUkeBCvGwNnTdcpxMhgZbrYLkLSQjE')",
                                    }}
                                ></div>
                                <span className="text-sm font-bold text-text-main">
                                    Alex Sterling
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-text-secondary font-medium uppercase tracking-tighter">
                                Status
                            </p>
                            <span className="inline-flex items-center gap-1 text-primary font-bold text-sm mt-0.5">
                                <span className="material-symbols-outlined text-[16px] fill-1">
                                    check_circle
                                </span>
                                Finalized
                            </span>
                        </div>
                    </div>
                </div>

                {/* Log Item 2 */}
                <div className="bg-surface-light rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[28px]">
                                description
                            </span>
                        </div>
                        <div>
                            <h4 className="text-text-main font-bold text-base leading-none">
                                Q4 Budget Proposal & Projections
                            </h4>
                            <p className="text-text-secondary text-sm mt-1">
                                Campaign:{" "}
                                <span className="text-text-main font-medium">
                                    Annual Growth
                                </span>{" "}
                                • ID: #APP-2044
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <p className="text-xs text-text-secondary font-medium uppercase tracking-tighter">
                                Approved By
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div
                                    className="size-6 rounded-full bg-cover bg-center"
                                    style={{
                                        backgroundImage:
                                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCGRgjDoBYAzITP6zmKP7CEtIDmt47MxM_JRnNJ3IqJIc2XRZg23brJY-YJ2SshT7QNCBuUbToGOFg9sWnslIKz9alkDuPoj1inp4AHqg8rGAl0AArtxS3YqFA4Mzw77br9uQCRYqTZVIQdwOyn7QI6y09aH_QscIvgluRVOBX2WzpA51GkltMfhdyWCyFko7mWkvq3V3ZCOIVuLaUgo2fFg_9OfJXzCvqfbijYTQqJCjrfuuPYGpp4KR1qaXdWwRFD9FmWAfDcUI')",
                                    }}
                                ></div>
                                <span className="text-sm font-bold text-text-main">
                                    Sarah Chen
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-text-secondary font-medium uppercase tracking-tighter">
                                Status
                            </p>
                            <span className="inline-flex items-center gap-1 text-primary font-bold text-sm mt-0.5">
                                <span className="material-symbols-outlined text-[16px] fill-1">
                                    check_circle
                                </span>
                                Finalized
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
