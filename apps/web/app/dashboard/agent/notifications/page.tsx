import Link from 'next/link';

export default function NotificationsPage() {
    return (
        <div className="mx-auto max-w-3xl">
            <header className="mb-5"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">Execution</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">Notifications</h1><p className="mt-1 text-sm text-slate-600">Updates about your affiliate account and assigned work.</p></header>
            <section className="border border-slate-200 bg-white px-5 py-12 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-400">notifications_none</span>
                <h2 className="mt-3 text-sm font-semibold text-slate-900">No notifications to show</h2>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">A notification feed is not available in the current platform data. New notifications will appear here when that service is supported.</p>
                <Link href="/dashboard/agent/messages" className="mt-4 inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-blue-700 hover:underline">Open your inbox <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
            </section>
        </div>
    );
}
