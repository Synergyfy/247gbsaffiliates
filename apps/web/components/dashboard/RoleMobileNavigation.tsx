'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type RoleNavItem = { name: string; href: string; icon: string };

export function RoleMobileNavigation({ roleName, items, primaryItems }: { roleName: string; items: RoleNavItem[]; primaryItems: RoleNavItem[] }) {
    const pathname = usePathname();
    const [moreOpen, setMoreOpen] = useState(false);
    const remainingItems = items.filter((item) => !primaryItems.some((primary) => primary.href === item.href));
    const dashboardHref = primaryItems[0]?.href;
    const isActive = (href: string) => href === dashboardHref
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <>
            <nav aria-label={`${roleName} mobile navigation`} className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
                <div className="mx-auto grid h-16 max-w-xl grid-cols-5">
                    {primaryItems.map((item) => {
                        const active = isActive(item.href);
                        return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`flex min-w-0 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${active ? 'text-blue-700' : 'text-slate-500'}`}><span className={`material-symbols-outlined text-[21px] ${active ? 'font-semibold' : ''}`}>{item.icon}</span><span className="max-w-full truncate px-1">{item.name}</span></Link>;
                    })}
                    <button type="button" aria-haspopup="dialog" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)} className={`flex min-w-0 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${moreOpen || !primaryItems.some((item) => isActive(item.href)) ? 'text-blue-700' : 'text-slate-500'}`}><span className="material-symbols-outlined text-[21px]">more_horiz</span><span>More</span></button>
                </div>
            </nav>

            {moreOpen && <div className="fixed inset-0 z-50 lg:hidden">
                <button type="button" aria-label="Close more navigation" className="absolute inset-0 bg-slate-950/40" onClick={() => setMoreOpen(false)} />
                <section role="dialog" aria-modal="true" aria-labelledby="role-mobile-more-title" className="absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-slate-300" aria-hidden="true" />
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3"><h2 id="role-mobile-more-title" className="text-sm font-semibold text-slate-900">More {roleName} pages</h2><button type="button" aria-label="Close more navigation" onClick={() => setMoreOpen(false)} className="flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"><span className="material-symbols-outlined">close</span></button></div>
                    <nav aria-label={`More ${roleName} pages`} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                        <div className="space-y-1">{remainingItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} aria-current={isActive(item.href) ? 'page' : undefined} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium ${isActive(item.href) ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'}`}><span className="material-symbols-outlined text-[20px]">{item.icon}</span>{item.name}</Link>)}</div>
                    </nav>
                    <div className="border-t border-slate-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"><button type="button" onClick={() => setMoreOpen(false)} className="w-full rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button></div>
                </section>
            </div>}
        </>
    );
}
