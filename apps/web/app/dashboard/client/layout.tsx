"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-display text-text-main flex flex-col">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-surface-light px-6 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-text-main">
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined font-bold text-2xl">
                                category
                            </span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">
                            Listeo Monitor
                        </h2>
                    </div>
                    <label className="flex flex-col min-w-40 h-10 max-w-64">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                            <div className="text-text-secondary flex border-none bg-slate-100 items-center justify-center pl-4 rounded-l-lg border-r-0">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-main focus:outline-0 focus:ring-0 border-none bg-slate-100 focus:border-none h-full placeholder:text-text-secondary px-4 rounded-l-none border-l-0 pl-2 text-base font-normal"
                                placeholder="Search tasks..."
                            />
                        </div>
                    </label>
                </div>
                <div className="flex items-center gap-6">
                    <nav className="hidden lg:flex items-center gap-6">
                        <Link
                            href="/dashboard/client"
                            className={`text-sm font-medium transition-colors ${pathname === "/dashboard/client"
                                    ? "text-primary"
                                    : "text-text-main hover:text-primary"
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/client/performance"
                            className={`text-sm font-medium transition-colors ${pathname === "/dashboard/client/performance"
                                    ? "text-primary"
                                    : "text-text-main hover:text-primary"
                                }`}
                        >
                            Performance
                        </Link>
                        <Link
                            href="/dashboard/client/approval"
                            className={`text-sm font-medium transition-colors ${pathname === "/dashboard/client/approval"
                                    ? "text-primary"
                                    : "text-text-main hover:text-primary"
                                }`}
                        >
                            Approvals
                        </Link>
                        <Link
                            href="/dashboard/client/history"
                            className={`text-sm font-medium transition-colors ${pathname === "/dashboard/client/history"
                                    ? "text-primary"
                                    : "text-text-main hover:text-primary"
                                }`}
                        >
                            History
                        </Link>
                    </nav>
                    <div className="flex gap-2">
                        <button className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                            <span className="truncate">Add Task</span>
                        </button>
                        <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 text-text-main">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20"
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA8dAGFqOOx99-YB97Xm2h8tDF5QoIekq7zdjAxxz789H6_8czoAQOnHf8sIR9Qng2G6LAtFi2tF-6m5MXEUgHynW35-ITcPyZxarBbdQx9inzKAKOeyg2RhSYnWXrOoavUSSiggKxnpi56FyMVOQ-8mxtAqnWLbD7UrB19ku9Dd9lbAVPbyOCGKmrOIzroO0q3QHEtZgY9yJPzY9QEBK41XYFWlBU677fJ_RF-NUlW9vAJw_GKaMYgXR_shbVCVf6Bxi4hJHXSA-Q")',
                            }}
                        ></div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
        </div>
    );
}
