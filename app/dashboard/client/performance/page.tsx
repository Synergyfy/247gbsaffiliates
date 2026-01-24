export default function PerformancePage() {
    return (
        <div className="max-w-[1200px] mx-auto p-6 space-y-6">
            <div className="flex flex-wrap gap-2 items-center">
                <a className="text-text-secondary text-sm font-medium hover:text-primary" href="#">
                    Campaigns
                </a>
                <span className="text-text-secondary text-sm">/</span>
                <span className="text-text-main text-sm font-medium">
                    Summer Outreach 2024
                </span>
            </div>

            <div className="flex flex-wrap justify-between items-end gap-3">
                <div className="flex flex-col gap-1">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em]">
                        Campaign Analytics
                    </h1>
                    <p className="text-text-secondary text-base font-normal">
                        Monitoring agent productivity and marketplace ROI for{" "}
                        <span className="text-text-main font-semibold">
                            Summer Outreach
                        </span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-text-main text-sm font-bold tracking-[0.015em] hover:bg-slate-200 transition-colors">
                        <span className="material-symbols-outlined mr-2 text-[18px]">
                            download
                        </span>
                        <span>Export Report</span>
                    </button>
                    <button className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold tracking-[0.015em] shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors">
                        <span className="material-symbols-outlined mr-2 text-[18px]">
                            edit
                        </span>
                        <span>Edit Campaign</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-8">
                    <a
                        className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-text-secondary pb-4 pt-2 hover:text-text-main transition-colors"
                        href="#"
                    >
                        <p className="text-sm font-bold tracking-[0.015em]">Tasks</p>
                    </a>
                    <a
                        className="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-text-main pb-4 pt-2"
                        href="#"
                    >
                        <p className="text-sm font-bold tracking-[0.015em]">Performance</p>
                    </a>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Spend", value: "£12,400", change: "+2.1%", positive: true },
                    { label: "Campaign ROI", value: "24.5%", change: "+5.4%", positive: true },
                    { label: "Completed Tasks", value: "1,250", change: "+12%", positive: true },
                    { label: "Avg. Agent Rating", value: "4.8/5", change: "-0.2%", positive: false },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light border border-slate-200 shadow-sm"
                    >
                        <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">
                            {stat.label}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-text-main tracking-light text-3xl font-bold leading-tight">
                                {stat.value}
                            </p>
                            <span
                                className={`text-sm font-bold px-1.5 py-0.5 rounded ${stat.positive
                                    ? "text-green-600 bg-green-100"
                                    : "text-red-500 bg-red-100"
                                    }`}
                            >
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agent Productivity Chart Placeholder */}
                <div className="bg-surface-light rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-text-main font-bold text-lg">
                            Agent Productivity
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-[10px] font-bold text-text-secondary bg-slate-100 px-2 py-1 rounded">
                                TASKS / DAY
                            </span>
                        </div>
                    </div>
                    <div className="h-64 w-full relative overflow-hidden rounded-lg bg-slate-50 flex items-end justify-between px-4 pb-2">
                        {[40, 60, 85, 55, 95, 45, 75].map((h, i) => (
                            <div
                                key={i}
                                className="w-8 bg-primary rounded-t"
                                style={{ height: `${h}%`, opacity: 0.5 + i * 0.05 }}
                            ></div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-text-secondary font-bold px-2">
                        <span>MON</span>
                        <span>TUE</span>
                        <span>WED</span>
                        <span>THU</span>
                        <span>FRI</span>
                        <span>SAT</span>
                        <span>SUN</span>
                    </div>
                </div>

                {/* Campaign ROI Chart Placeholder */}
                <div className="bg-surface-light rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-text-main font-bold text-lg">
                            Campaign ROI Performance
                        </h3>
                        <span className="text-primary material-symbols-outlined">
                            trending_up
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center gap-4 py-4">
                        <div className="relative size-40 rounded-full border-12 border-slate-100 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-12 border-primary border-t-transparent border-r-transparent transform -rotate-45"></div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-text-main">24.5%</p>
                                <p className="text-xs text-text-secondary font-medium">
                                    Net Margin
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 w-full gap-4 mt-2">
                            <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <p className="text-text-secondary text-[10px] uppercase font-bold">
                                    Invested
                                </p>
                                <p className="text-text-main font-bold">£12.4k</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <p className="text-text-secondary text-[10px] uppercase font-bold">
                                    Returned
                                </p>
                                <p className="text-primary font-bold">£15.4k</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
