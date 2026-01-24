export default function ClientMonitorPage() {
    return (
        <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6">
            {/* Left & Center Content: Campaign Stats + Kanban */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* Campaign Summary Section */}
                <section className="bg-surface-light rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-text-main text-3xl font-black tracking-tight">
                                Q4 Brand Awareness - Nike
                            </p>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <span className="material-symbols-outlined text-sm">
                                    person
                                </span>
                                <p className="text-sm font-normal">
                                    Campaign Manager: Sarah Jenkins
                                </p>
                                <span className="mx-2">•</span>
                                <span className="material-symbols-outlined text-sm">
                                    business
                                </span>
                                <p className="text-sm font-normal">Client: Nike Global</p>
                            </div>
                        </div>
                        <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-text-main text-sm font-bold hover:bg-slate-200 transition-colors">
                            <span className="material-symbols-outlined text-lg mr-2">
                                edit
                            </span>
                            <span className="truncate">Edit Campaign</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200">
                        {/* Budget Burn Progress */}
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-6 justify-between items-end">
                                <p className="text-text-main text-base font-semibold">
                                    Budget Burn Rate
                                </p>
                                <p className="text-primary text-sm font-bold">60%</p>
                            </div>
                            <div className="rounded-full bg-slate-200 h-2.5 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: "60%" }}
                                ></div>
                            </div>
                            <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                                £12,000 / £20,000 spent
                            </p>
                        </div>
                        {/* Time Elapsed Progress */}
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-6 justify-between items-end">
                                <p className="text-text-main text-base font-semibold">
                                    Time Elapsed
                                </p>
                                <p className="text-text-main text-sm font-bold">14 / 30 Days</p>
                            </div>
                            <div className="rounded-full bg-slate-200 h-2.5 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: "46%" }}
                                ></div>
                            </div>
                            <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                                46% of campaign duration completed
                            </p>
                        </div>
                    </div>
                </section>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* To-Do Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-text-main font-bold text-lg flex items-center gap-2">
                                To-Do
                                <span className="bg-slate-100 text-primary text-xs px-2 py-0.5 rounded-full">
                                    4
                                </span>
                            </h3>
                            <button className="text-text-secondary hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">add_circle</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Alert Card (High Priority) */}
                            <div className="bg-surface-light p-4 rounded-xl border-l-4 border-red-600 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                        Missed Deadline
                                    </span>
                                    <span className="material-symbols-outlined text-gray-400 text-sm">
                                        open_in_full
                                    </span>
                                </div>
                                <h4 className="font-bold text-text-main mb-2 leading-tight">
                                    Finalize Q4 Video Scripts
                                </h4>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                                    The creative team is waiting for the final approval on the
                                    influencer scripts...
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <div
                                            className="w-7 h-7 rounded-full border-2 border-white bg-cover bg-center"
                                            style={{
                                                backgroundImage:
                                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1yzSfsqoFmun9pDQQUC3Ma_nXFcc91iww_zY6q-XFE7veUrk4rvMalfN-ADH8C6lMtOofp-oU_pmrUgm9P0cyosUEsH95A_ljVBxwnGDCzY9RHYU2SU7kKWc5-WnDSA92Ar8ZxY5WDrwInzPGlst6kkRXZPRY98WIu01HEO7Vk-54GOB5IwkOcw39p22jxfzpf5yWF5ocWoiOrj6iENWsj2oymVBho4FUFe6vitmTaqa8D9aUqWAB-9-Dw0opiZwrQu9ycwaRPYw')",
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-red-600 font-bold">
                                        2 Days Overdue
                                    </span>
                                </div>
                            </div>
                            {/* Regular Card */}
                            <div className="bg-surface-light p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                                        Creative
                                    </span>
                                    <span className="material-symbols-outlined text-gray-400 text-sm">
                                        open_in_full
                                    </span>
                                </div>
                                <h4 className="font-bold text-text-main mb-2 leading-tight">
                                    Batch Resize Display Ads
                                </h4>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                                    Need 1080x1080 and 1920x1080 variants for all banner sets.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <div
                                            className="w-7 h-7 rounded-full border-2 border-white bg-cover bg-center"
                                            style={{
                                                backgroundImage:
                                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD1kiS6NzFwCsY1KR51NWKLSuXclJBlmjByZSfwyb-0Vge7lNKB0Sc4LgMWUHKuOZj0diBTRxYKyC7oKgHsdLD51EmbiqQkZxMkte2c_g_I-8qn2XC_liTCjZg2gnwAIkLdosOWIIZvv9OkcCZeDWUkjcjwtAia1O-ADDC1rgXBSGq-xnzeYkkpN7idbvvs8i45bJpWRKvjAHNwzTY_R9LDTEj5DYSjJy5iY4JB4KCgyKG1_e4ePr8RoomgQO2NWvd43wRueyxzM2I')",
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-text-secondary">
                                        Dec 24
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* In-Progress Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-text-main font-bold text-lg flex items-center gap-2">
                                In-Progress
                                <span className="bg-slate-100 text-primary text-xs px-2 py-0.5 rounded-full">
                                    2
                                </span>
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-surface-light p-4 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                                        Media Buy
                                    </span>
                                    <span className="material-symbols-outlined text-gray-400 text-sm">
                                        open_in_full
                                    </span>
                                </div>
                                <h4 className="font-bold text-text-main mb-2 leading-tight">
                                    Instagram Story Placement
                                </h4>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full mb-3">
                                    <div
                                        className="bg-primary h-full rounded-full"
                                        style={{ width: "75%" }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <div
                                            className="w-7 h-7 rounded-full border-2 border-white bg-cover bg-center"
                                            style={{
                                                backgroundImage:
                                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDI7NtFoXGjbn1vmYwWHxi9ZKy8Odq-I73MGw8xmknKXidVaTBdoLrZ-7zd8pBRs6kiEImAyqnqirXrAFLnHI_iAA2O2hZrAKlUEGHia-rYKHRSG3V_0wRNkS-GwbMu8FcCTJCSXwdbJXCXQmcmyBpAvnI9deMFPHlzjD6eLRPlK5uEtZj-6TT2VG-xjCXkVJvh8OmEp0GCUl_NTgX0ej4CfOhQEVCrlM8kmez0JKo3fXcciIZ7iCctTAkQ65k_gyOkVHiaWVo0NNs')",
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-text-secondary font-bold">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ready for Review Column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-text-main font-bold text-lg flex items-center gap-2">
                                Ready for Review
                                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                    3
                                </span>
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-surface-light p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                        SEO Audit
                                    </span>
                                    <span className="material-symbols-outlined text-gray-400 text-sm">
                                        open_in_full
                                    </span>
                                </div>
                                <h4 className="font-bold text-text-main mb-2 leading-tight">
                                    Monthly Keyword Mapping
                                </h4>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                                    All top-tier landing pages mapped to new Q4 target terms.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <div
                                            className="w-7 h-7 rounded-full border-2 border-white bg-cover bg-center"
                                            style={{
                                                backgroundImage:
                                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBx0d1AITqHiUBbccjZYwC8XBN93Yvx5vaq2G50du8V51So3vaocKWZ3PajPK_2yA58ZbckosZBNQk-MYBlFNEoF2i9BYfDP4cwNI8dd4uzldrkCT1QSE3cVi3CiUBTctu-pJwyqxlkCWf1fqZQ1GpfQAbh0ghZuVshX_izhBYkP2JpXn65y5qeVUFL1g_6icEILlXyMAJcS3kLVhWfkLfpiHG7KykwURAqwgHomuP_Sev2087HlEZ8ekXZAoGbhHf-6CUR8lZfEm4')",
                                            }}
                                        ></div>
                                    </div>
                                    <button className="bg-primary text-white text-[10px] px-2 py-1 rounded font-bold uppercase">
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Agent Activity */}
            <aside className="col-span-12 lg:col-span-3 space-y-6">
                <div className="bg-surface-light rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[600px]">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-surface-light sticky top-0">
                        <h3 className="font-bold text-text-main">Agent Activity</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-[10px] font-bold text-primary uppercase">
                                Live
                            </span>
                        </div>
                    </div>
                    <div className="p-4 space-y-6 overflow-y-auto">
                        {/* Activity Item 1 */}
                        <div className="flex gap-3">
                            <div
                                className="w-8 h-8 rounded-full shrink-0 bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDj0oEUch2F4qH-yiMjquYau2TFvlt_kmDmJLyflgx5mP_TxRdrRbCNVe9oxUeOyLJTjBRi-uMxC2D40AKqSDnPyK9LpwvJNyNDf77-nBguu7RMhn4HADWVdZSbCv5D3eFeRF7hvsXNvicFlww6e2HZUilemqj0Dx9jLZylQhE_NPKHbK6Tr22bSz14kB7m4jXgmUib-6n1HNtzw4KJqT4LeSuuHEGm1BT_XNJcgcPAE_HcfBgucUPhL2Ewe5kB2pJoACE8I_eg-so')",
                                }}
                            ></div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-text-main leading-tight">
                                    <span className="font-bold">Alex M.</span> moved{" "}
                                    <span className="text-primary font-medium">SEO Audit</span> to
                                    Review
                                </p>
                                <span className="text-[10px] text-text-secondary">2m ago</span>
                            </div>
                        </div>
                        {/* Message Item */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary text-base">
                                    mail
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                                    Client Message
                                </span>
                            </div>
                            <p className="text-xs text-text-main italic">
                                "Please check the latest budget burn for the Instagram
                                placements."
                            </p>
                            <div className="mt-2 flex justify-end">
                                <span className="text-[10px] text-text-secondary">15m ago</span>
                            </div>
                        </div>
                        {/* Activity Item 2 */}
                        <div className="flex gap-3">
                            <div
                                className="w-8 h-8 rounded-full shrink-0 bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAe3-N75ZFf7Vg1TRxxJ-tg-JTMMnipskcxLHbb97NyYY_ESErcHt1jA6aRtci-Vf_Z82U0sAwl9Al3TTIEkXqWK_en6aMMfKM2GfM5ChsRtUTk7LInyrqeEJP99XwPz_slg3IP33PgCaWdiA42F9-xmdzdpVrjiXYWo57VXaFjdgr2cZEXbHurWiY9VOq7dq7Qg89pe3HO10ZEmGuXNHJ-_ClrknOMsfVPcYQWFLkAEN9t4Q7B409jlYOqQLdBiL5rd0cgLxPEqq4')",
                                }}
                            ></div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-text-main leading-tight">
                                    <span className="font-bold">Jordan S.</span> completed{" "}
                                    <span className="text-primary font-medium">
                                        Holiday Asset Export
                                    </span>
                                </p>
                                <span className="text-[10px] text-text-secondary">1h ago</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 mt-auto border-t border-slate-200">
                        <button className="w-full py-2 bg-slate-100 text-primary text-xs font-bold rounded-lg hover:bg-primary/10 transition-colors uppercase tracking-wider">
                            View Full History
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}
