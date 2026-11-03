'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';

const navigation = [
    {
        title: 'Core Operations',
        items: [
            { name: 'Overview', href: '/dashboard/agent', icon: 'dashboard' },
            { name: 'My Profile', href: '/dashboard/agent/profile', icon: 'person' },
            { name: 'Verification', href: '/dashboard/agent/verification', icon: 'verified_user' },
        ],
    },
    {
        title: 'Advancement',
        items: [
            { name: 'Learning Hub', href: '/learning', icon: 'school' },
            { name: 'Assessment & Qualification', href: '/dashboard/agent/assessment', icon: 'quiz' },
        ],
    },
    {
        title: 'Execution',
        items: [
            { name: 'My Tasks', href: '/dashboard/agent/tasks', icon: 'assignment' },
            { name: 'Notifications', href: '/dashboard/agent/notifications', icon: 'notifications' },
            { name: 'Settings', href: '/dashboard/agent/settings', icon: 'settings' },
        ],
    },
];

function getName(user: ReturnType<typeof useAuthStore.getState>['user']) {
    return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'Affiliate';
}

export default function AgentLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const { logout, isLoggingOut } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [taskSearch, setTaskSearch] = useState('');
    const name = getName(user);
    const initials = useMemo(() => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A', [name]);
    const roleLabel = user?.role?.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Affiliate';
    const title = pathname === '/dashboard/agent' ? 'Dashboard' : pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Dashboard';

    const navigateToTaskSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = taskSearch.trim();
        router.push(query ? `/dashboard/agent/tasks?search=${encodeURIComponent(query)}` : '/dashboard/agent/tasks');
        setMenuOpen(false);
    };

    const isActive = (href: string) => href === '/dashboard/agent'
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`) || (href === '/learning' && pathname === '/learning');

    const navigationGroups = (onNavigate?: () => void) => navigation.map((group) => (
        <section key={group.title} className="mb-6">
            <h2 className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{group.title}</h2>
            <div className="space-y-1">
                {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            aria-current={active ? 'page' : undefined}
                            className={`flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors ${active ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                        >
                            <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    ));

    return (
        <div className="min-h-screen bg-[#f7f8fc] font-display text-slate-950 lg:flex">
            <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
                <div className="border-b border-slate-100 px-5 py-5">
                    <Link href="/dashboard/agent" aria-label="247GBS Affiliate dashboard" className="inline-flex">
                        <BrandLogo size="md" label="247GBS Affiliate" labelClassName="text-sm" />
                    </Link>
                </div>
                <nav aria-label="Affiliate navigation" className="flex-1 overflow-y-auto px-3 py-5">
                    {navigationGroups()}
                </nav>
                <div className="border-t border-slate-200 p-3">
                    <button type="button" onClick={() => setProfileMenuOpen((open) => !open)} className="flex w-full items-center gap-3 rounded-lg bg-[#202b42] p-3 text-left text-white hover:bg-[#273550]">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-700 text-xs font-bold">{initials}</span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold">{name}</span>
                            <span className="mt-0.5 block truncate text-[10px] text-slate-300">{roleLabel}</span>
                        </span>
                        <span className="material-symbols-outlined text-lg text-slate-300">{profileMenuOpen ? 'expand_more' : 'more_horiz'}</span>
                    </button>
                    {profileMenuOpen && <div className="mt-2 rounded-lg border border-slate-200 bg-white p-1 text-sm shadow-sm">
                        <Link href="/dashboard/agent/profile" onClick={() => setProfileMenuOpen(false)} className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-50">My Profile</Link>
                        <Link href="/dashboard/agent/settings" onClick={() => setProfileMenuOpen(false)} className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-50">Settings</Link>
                        <button type="button" disabled={isLoggingOut} onClick={() => void logout()} className="w-full rounded px-3 py-2 text-left text-red-700 hover:bg-red-50 disabled:opacity-50">{isLoggingOut ? 'Signing out…' : 'Sign out'}</button>
                    </div>}
                </div>
            </aside>

            <div className="min-w-0 flex-1">
                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
                    <div className="flex min-h-14 items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:min-h-[68px] lg:px-8">
                        <button type="button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="flex size-9 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-slate-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden">
                            <span className="material-symbols-outlined text-[18px]">menu</span>
                        </button>
                        <BrandLogo size="sm" iconClassName="size-5" label="247GBS Affiliate" labelClassName="text-[11px]" className="gap-1.5 md:hidden" />
                        <div className="hidden min-w-0 flex-1 md:block">
                            <h1 className="text-[15px] font-semibold text-slate-950">{title}</h1>
                            <p className="mt-0.5 text-xs text-slate-500">Your affiliate programme and progress at a glance</p>
                        </div>
                        <form onSubmit={navigateToTaskSearch} role="search" className="ml-auto hidden w-full max-w-[340px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 lg:flex xl:ml-0">
                            <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
                            <input value={taskSearch} onChange={(event) => setTaskSearch(event.target.value)} aria-label="Search assigned tasks" placeholder="Search your assigned tasks" className="h-10 min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400" />
                            <button type="submit" className="text-[11px] font-semibold text-blue-700">Search</button>
                        </form>
                        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-2">
                            <Link href="/dashboard/agent/notifications" aria-label="Notifications" className="relative flex size-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100">
                                <span className="material-symbols-outlined text-[21px]">notifications</span>
                            </Link>
                            <button type="button" onClick={() => setProfileMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={profileMenuOpen} className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-slate-50">
                                <span className="flex size-6 items-center justify-center rounded-full bg-blue-700 text-[9px] font-bold text-white sm:size-8 sm:text-[10px]">{initials}</span>
                                <span className="hidden max-w-32 truncate text-xs font-medium text-slate-800 lg:inline">{name}</span>
                                <span className="material-symbols-outlined hidden text-base text-slate-400 sm:inline">expand_more</span>
                            </button>
                            {profileMenuOpen && <div role="menu" className="absolute right-4 top-[60px] z-50 w-52 rounded-lg border border-slate-200 bg-white p-1 shadow-lg sm:right-6 lg:right-8">
                                <p className="truncate px-3 py-2 text-[11px] text-slate-500">{user?.email}</p>
                                <Link role="menuitem" href="/dashboard/agent/profile" onClick={() => setProfileMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">My Profile</Link>
                                <Link role="menuitem" href="/dashboard/agent/settings" onClick={() => setProfileMenuOpen(false)} className="block rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</Link>
                                <button role="menuitem" type="button" disabled={isLoggingOut} onClick={() => void logout()} className="w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50">{isLoggingOut ? 'Signing out…' : 'Sign out'}</button>
                            </div>}
                        </div>
                    </div>
                </header>

                <main className="min-h-[calc(100vh-56px)] px-3 py-3 pb-8 sm:px-6 sm:py-7 lg:min-h-[calc(100vh-68px)] lg:px-8">
                    {children}
                </main>
            </div>

            {menuOpen && <div className="fixed inset-0 z-50 lg:hidden">
                <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-slate-950/35" onClick={() => setMenuOpen(false)} />
                <aside className="relative flex h-full w-[min(82vw,300px)] flex-col bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                        <Link href="/dashboard/agent" onClick={() => setMenuOpen(false)}><BrandLogo size="sm" label="247GBS Affiliate" labelClassName="text-sm" /></Link>
                        <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"><span className="material-symbols-outlined">close</span></button>
                    </div>
                    <nav aria-label="Affiliate navigation" className="flex-1 overflow-y-auto px-3 py-5">{navigationGroups(() => setMenuOpen(false))}</nav>
                    <div className="border-t border-slate-200 p-4">
                        <p className="truncate text-xs font-semibold text-slate-900">{name}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{roleLabel}</p>
                        <button type="button" disabled={isLoggingOut} onClick={() => void logout()} className="mt-3 text-xs font-semibold text-red-700">{isLoggingOut ? 'Signing out…' : 'Sign out'}</button>
                    </div>
                </aside>
            </div>}
        </div>
    );
}
