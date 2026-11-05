'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import { useMcomWallet } from '@/hooks/useMcomWallet';
import { useAuthStore } from '@/store/useAuthStore';

const navigation = [
    {
        title: 'Core Operations',
        items: [
            { name: 'Overview', href: '/dashboard/agent', icon: 'dashboard' },
            { name: 'My Businesses', href: '/dashboard/agent/businesses', icon: 'storefront' },
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
            { name: 'Earnings', href: '/dashboard/agent/earnings', icon: 'payments' },
            { name: 'Messages', href: '/dashboard/agent/messages', icon: 'mail' },
            { name: 'Notifications', href: '/dashboard/agent/notifications', icon: 'notifications' },
            { name: 'Settings', href: '/dashboard/agent/settings', icon: 'settings' },
        ],
    },
];

const primaryMobileLinks = [
    { name: 'Dashboard', href: '/dashboard/agent', icon: 'dashboard' },
    { name: 'Tasks', href: '/dashboard/agent/tasks', icon: 'assignment' },
    { name: 'Missions', href: '/dashboard/agent/my-missions', icon: 'rocket_launch' },
    { name: 'Earnings', href: '/dashboard/agent/earnings', icon: 'payments' },
];

function getName(user: ReturnType<typeof useAuthStore.getState>['user']) {
    return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'Affiliate';
}

export default function AgentLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const { logout, isLoggingOut } = useAuth();
    const { wallet } = useMcomWallet();
    const [moreOpen, setMoreOpen] = useState(false);
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
    };

    const isActive = (href: string) => href === '/dashboard/agent'
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`) || (href === '/learning' && pathname === '/learning');

    const moreNavigation = navigation.map((group) => ({
        ...group,
        items: group.items.filter((item) => !primaryMobileLinks.some((primary) => primary.href === item.href)),
    })).filter((group) => group.items.length > 0);

    const navigationGroups = (groups = navigation, onNavigate?: () => void) => groups.map((group) => (
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
                            <Link href="/dashboard/agent/earnings" className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 hover:border-blue-300 sm:gap-2 sm:px-2.5" aria-label="View earnings and MCOM wallet">
                                <span className="hidden text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:inline">MCOM</span>
                                <span className="text-[11px] font-bold tabular-nums text-slate-900 sm:text-xs">
                                    {Number(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </Link>
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

                <main className={pathname === '/dashboard/agent/messages'
                    ? 'h-[calc(100dvh-120px)] min-h-0 overflow-hidden p-0 lg:h-[calc(100dvh-68px)]'
                    : pathname.startsWith('/dashboard/agent/assessment/')
                    ? 'min-h-[calc(100vh-56px)] px-3 py-1 pb-20 sm:px-6 sm:py-5 lg:min-h-[calc(100vh-68px)] lg:px-8 lg:pb-8'
                    : 'min-h-[calc(100vh-56px)] px-3 py-3 pb-24 sm:px-6 sm:py-7 lg:min-h-[calc(100vh-68px)] lg:px-8 lg:pb-8'}>
                    {children}
                </main>
            </div>

            <nav aria-label="Affiliate mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
                <div className="mx-auto grid h-16 max-w-xl grid-cols-5">
                    {primaryMobileLinks.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`flex min-w-0 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${active ? 'text-blue-700' : 'text-slate-500'}`}>
                                <span className={`material-symbols-outlined text-[21px] ${active ? 'font-semibold' : ''}`}>{item.icon}</span>
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                    <button type="button" aria-haspopup="dialog" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)} className={`flex min-w-0 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${moreOpen || !primaryMobileLinks.some((item) => isActive(item.href)) ? 'text-blue-700' : 'text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[21px]">more_horiz</span>
                        <span>More</span>
                    </button>
                </div>
            </nav>

            {moreOpen && <div className="fixed inset-0 z-50 lg:hidden">
                <button type="button" aria-label="Close more navigation" className="absolute inset-0 bg-slate-950/40" onClick={() => setMoreOpen(false)} />
                <section role="dialog" aria-modal="true" aria-labelledby="mobile-more-title" className="absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-slate-300" aria-hidden="true" />
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                        <h2 id="mobile-more-title" className="text-sm font-semibold text-slate-900">More</h2>
                        <button type="button" aria-label="Close more navigation" onClick={() => setMoreOpen(false)} className="flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"><span className="material-symbols-outlined">close</span></button>
                    </div>
                    <nav aria-label="More affiliate pages" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{navigationGroups(moreNavigation, () => setMoreOpen(false))}</nav>
                    <div className="border-t border-slate-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        <button type="button" onClick={() => setMoreOpen(false)} className="w-full rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                    </div>
                </section>
            </div>}
        </div>
    );
}
