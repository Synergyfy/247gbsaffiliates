export default function AccountManagerDashboard() {
    return (
        <>
            <header className="bg-surface-light border-b border-slate-200 px-8 py-6 sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-text-main">
                            Account Manager Dashboard
                        </h1>
                        <p className="text-text-secondary text-sm font-medium">
                            Overview for Q4 Project Management
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-text-secondary hover:text-text-main transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                            New Campaign
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {/* Stat 1 */}
                    <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                Retention Rate
                            </span>
                            <span className="material-symbols-outlined text-primary">
                                trending_up
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-text-main leading-none">
                                94.8%
                            </span>
                            <span className="text-xs font-bold text-primary mb-0.5">
                                +2.4%
                            </span>
                        </div>
                    </div>
                    {/* Stat 2 */}
                    <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                Total Revenue Managed
                            </span>
                            <span className="material-symbols-outlined text-primary">
                                monetization_on
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-text-main leading-none">
                                £1.24M
                            </span>
                            <span className="text-xs font-bold text-primary mb-0.5">
                                +12%
                            </span>
                        </div>
                    </div>
                    {/* Stat 3 */}
                    <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                Active Projects
                            </span>
                            <span className="material-symbols-outlined text-primary">
                                folder_open
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-text-main leading-none">
                                24
                            </span>
                            <span className="text-xs font-bold text-text-secondary mb-0.5">
                                Projects
                            </span>
                        </div>
                    </div>
                    {/* Stat 4 */}
                    <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                Avg. Response Time
                            </span>
                            <span className="material-symbols-outlined text-primary">
                                speed
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-text-main leading-none">
                                1.2h
                            </span>
                            <span className="text-xs font-bold text-primary mb-0.5">
                                -15m
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 flex flex-col lg:flex-row gap-8">
                {/* Campaign Overview Table */}
                <div className="flex-2 bg-surface-light rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-bold text-text-main">Campaign Overview</h3>
                        <button className="text-xs font-bold text-primary hover:underline">
                            View All Projects
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        Project Name
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        Assigned Agents
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-text-main text-sm">
                                                Fintech UI Redesign
                                            </span>
                                            <span className="text-xs text-text-secondary">
                                                Project ID: #1024
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-text-main">
                                            Oct 24, 2024
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            <div className="size-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                JD
                                            </div>
                                            <div className="size-7 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-green-600">
                                                SK
                                            </div>
                                            <div className="size-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                +2
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">
                                            On Track
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-text-main text-sm">
                                                Crypto Wallet App
                                            </span>
                                            <span className="text-xs text-text-secondary">
                                                Project ID: #1028
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-text-main">
                                            Nov 02, 2024
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            <div className="size-7 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-600">
                                                AM
                                            </div>
                                            <div className="size-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-orange-600">
                                                TH
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-full">
                                            Needs Review
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-text-main text-sm">
                                                HealthTech Marketplace
                                            </span>
                                            <span className="text-xs text-text-secondary">
                                                Project ID: #1035
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-text-main">
                                            Nov 15, 2024
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            <div className="size-7 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-pink-600">
                                                RB
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">
                                            On Track
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Messaging Hub */}
                <div className="flex-1 bg-surface-light rounded-2xl shadow-sm border border-slate-200 flex flex-col min-w-[320px]">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-xl">
                                forum
                            </span>
                            <h3 className="font-bold text-text-main text-sm">
                                Messaging Hub
                            </h3>
                        </div>
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                            3 New
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px]">
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                <div className="size-10 rounded-full bg-slate-800 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                                    AK
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-xs font-bold text-text-main truncate">
                                            Alex Klein (Agent)
                                        </span>
                                        <span className="text-[10px] text-text-secondary">
                                            2m ago
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary truncate">
                                        I've completed the initial wireframes for the Fintech
                                        project.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 rounded-xl bg-white border border-transparent hover:bg-slate-50 transition-all cursor-pointer">
                                <div className="size-10 rounded-full bg-primary/20 shrink-0 flex items-center justify-center text-primary text-xs font-bold">
                                    MS
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-xs font-bold text-text-main truncate">
                                            Modern Soft (Client)
                                        </span>
                                        <span className="text-[10px] text-text-secondary">
                                            1h ago
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary truncate">
                                        Can we schedule a quick sync for tomorrow morning?
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                        <div className="relative">
                            <input
                                className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-4 pr-10 text-xs focus:ring-primary focus:border-primary"
                                placeholder="Quick reply..."
                                type="text"
                            />
                            <button className="absolute right-2 top-1.5 text-primary">
                                <span className="material-symbols-outlined text-xl">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
