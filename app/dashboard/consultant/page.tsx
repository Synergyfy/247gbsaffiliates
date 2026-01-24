export default function ConsultantDashboard() {
    return (
        <>
            <div className="bg-amber-50 border-b border-amber-100 py-3 px-6 flex items-center justify-center gap-3">
                <span className="material-symbols-outlined text-amber-600 text-sm">
                    verified_user
                </span>
                <p className="text-sm font-medium text-amber-800">
                    Your Consultant credentials are being verified by our compliance team.
                    Some features may be limited.
                </p>
            </div>
            <header className="h-20 bg-surface-light border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
                <h1 className="text-xl font-bold text-text-main">
                    Consultant Dashboard
                </h1>
                <div className="flex items-center gap-6">
                    <button className="relative p-2 text-text-secondary hover:text-text-main transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                        <div className="text-right">
                            <p className="text-sm font-bold text-text-main">Sarah Jenkins</p>
                            <p className="text-xs text-text-secondary font-medium">
                                Senior Consultant
                            </p>
                        </div>
                        <div className="size-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                            <img
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5WQs5AcsGU5iEJYEdetO1a1E9jyhOFoI667C-RD0wQEHeejEfCv47tosiwIb8I7ziyt54R_f-rgG2sLBHqzSRXSN5Oxpc3cMM8BsLGvrAcPe7mGEV1gmF4F8jqXFgAGHC5L26aYoV5NxyxQJ3M8zSSpAoLEcDVK_C6eawQue2b4zkSfgYHob9kS9lBcfnnR_3raNLupAnQXZmDfbFkxrzxf4Z2qTfwpKxQHGkaP5HOK7nqmfxz0EHGmWCwsxTmnP0hhEsjUn_XF0"
                            />
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">
                                    attach_money
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                                    Hourly Rate
                                </p>
                                <p className="text-2xl font-black text-text-main">£185.00</p>
                                <p className="text-xs text-primary font-bold mt-1">
                                    +5% from last month
                                </p>
                            </div>
                        </div>
                        <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="size-14 rounded-xl bg-slate-600/10 flex items-center justify-center text-text-main">
                                <span className="material-symbols-outlined text-3xl">bolt</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                                    Strategic Impact Score
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-2xl font-black text-text-main">94</p>
                                    <span className="text-xs text-text-secondary font-bold">
                                        / 100
                                    </span>
                                </div>
                                <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: "94%" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 lg:col-span-1">
                            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">
                                    event_available
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                                    Active Sessions
                                </p>
                                <p className="text-2xl font-black text-text-main">12</p>
                                <p className="text-xs text-text-secondary font-medium mt-1">
                                    Next: Today, 2:00 PM
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Calendar Section */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="bg-surface-light rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                    <h3 className="font-bold text-text-main flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">
                                            calendar_month
                                        </span>
                                        Session Calendar
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button className="p-1 hover:bg-slate-50 rounded">
                                            <span className="material-symbols-outlined text-xl">
                                                chevron_left
                                            </span>
                                        </button>
                                        <span className="text-sm font-bold text-text-main">
                                            October 2024
                                        </span>
                                        <button className="p-1 hover:bg-slate-50 rounded">
                                            <span className="material-symbols-outlined text-xl">
                                                chevron_right
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-7 border-t border-l border-slate-200">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                                            (day) => (
                                                <div
                                                    key={day}
                                                    className="p-2 border-r border-b border-slate-200 bg-slate-50 text-[10px] font-black text-text-secondary uppercase text-center"
                                                >
                                                    {day}
                                                </div>
                                            )
                                        )}
                                        {/* Calendar Days */}
                                        {[27, 28, 29, 30].map((d) => (
                                            <div
                                                key={d}
                                                className="h-24 p-2 border-r border-b border-slate-200 text-sm text-slate-300"
                                            >
                                                {d}
                                            </div>
                                        ))}
                                        {[1, 2, 3, 4].map((d) => (
                                            <div
                                                key={d}
                                                className="h-24 p-2 border-r border-b border-slate-200 text-sm text-text-main font-bold"
                                            >
                                                {d}
                                            </div>
                                        ))}
                                        <div className="h-24 p-2 border-r border-b border-slate-200 text-sm text-text-main font-bold bg-primary/5 ring-1 ring-inset ring-primary">
                                            5
                                            <div className="mt-1 px-1.5 py-0.5 bg-primary text-[9px] text-white rounded font-bold truncate">
                                                Strategy Call: Nike
                                            </div>
                                        </div>
                                        <div className="h-24 p-2 border-r border-b border-slate-200 text-sm text-text-main font-bold">
                                            6
                                        </div>
                                        <div className="h-24 p-2 border-r border-b border-slate-200 text-sm text-text-main font-bold">
                                            7
                                            <div className="mt-1 px-1.5 py-0.5 bg-slate-800 text-[9px] text-white rounded font-bold truncate">
                                                Audit: Tesla
                                            </div>
                                        </div>
                                        {[8, 9, 10].map((d) => (
                                            <div
                                                key={d}
                                                className="h-24 p-2 border-r border-b border-slate-200 text-sm text-text-main font-bold"
                                            >
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Calls Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-surface-light rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h3 className="font-bold text-text-main mb-6 flex items-center justify-between">
                                    <span>Upcoming Calls</span>
                                    <a
                                        href="#"
                                        className="text-xs text-primary hover:underline"
                                    >
                                        View All
                                    </a>
                                </h3>
                                <div className="space-y-4">
                                    {/* Call 1 */}
                                    <div className="p-4 bg-background-light rounded-xl border border-slate-200 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="size-10 rounded-full overflow-hidden border border-white shadow-sm">
                                                <img
                                                    alt="Client"
                                                    className="w-full h-full object-cover"
                                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3q-tVF51umLMdMcKNDrIm3bGoG6vydb7mgaQvqi6T9sZxjtu61Y3nn8lqZZJgnabr9l-gOmQEYnyw2bM05ukWpuBEVLMm9vTl2BJrK_Pdjv3QDEnK-2KvADGCPwS2Z-BhLBA_q3inhyhB-8IHHnf1_Fugmn2IWJsfxCddx2zrn92TrTfmRK6ksuL_L1nDHozZZtN63DxOoOheMb8EXPuPCD9GyveiLfMNfaw7cE2C11RBqAFd44KDFPcd-NTJPkQGAkC93YgztWY"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-main">
                                                    Marcus Aurelius
                                                </p>
                                                <p className="text-[10px] text-text-secondary font-medium">
                                                    Chief Strategy Officer
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 text-text-main font-semibold">
                                                <span className="material-symbols-outlined text-sm text-primary">
                                                    schedule
                                                </span>
                                                Today, 2:00 PM
                                            </div>
                                            <button className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-[10px] hover:opacity-90">
                                                Join Call
                                            </button>
                                        </div>
                                    </div>

                                    {/* Call 2 */}
                                    <div className="p-4 bg-background-light rounded-xl border border-slate-200 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="size-10 rounded-full overflow-hidden border border-white shadow-sm">
                                                <img
                                                    alt="Client"
                                                    className="w-full h-full object-cover"
                                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDivQadxsYbT851NoYSMsRiZgH_zBwWB3nKAli1RbLbQh54NF9BtWXbvxMC2qOaYhvQRBLgeahEOU2gdjqfJ-QIBaCd5GUH8lQ7oU8ha1dvFg1f78a1ET_3QOTs3RBK4x8w8ZieeIGxbfnh7CCzD0SbgHsL-JhLyG66IYxH69KSMAzuZe8IR0Tvc6cMyyQYgT0csSrf4kCecN87UdnWEKN0JV_-iCog6rOms0oyrivnwpfdjEZf1fwpblXzm8rei21lym1O2LcWnqM"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-main">
                                                    Elena Rodriguez
                                                </p>
                                                <p className="text-[10px] text-text-secondary font-medium">
                                                    Founder, GreenTech
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 text-text-secondary font-semibold">
                                                <span className="material-symbols-outlined text-sm text-primary">
                                                    schedule
                                                </span>
                                                Tomorrow, 10:00 AM
                                            </div>
                                            <button className="px-3 py-1.5 border border-slate-300 text-text-main font-bold rounded-lg text-[10px] hover:bg-white">
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="font-bold text-sm mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                        <span className="material-symbols-outlined text-primary">
                                            add_box
                                        </span>
                                        <span className="text-[10px] font-bold">New Session</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                        <span className="material-symbols-outlined text-primary">
                                            description
                                        </span>
                                        <span className="text-[10px] font-bold">Reports</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
