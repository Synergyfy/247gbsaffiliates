'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

function humanize(value?: string | null) {
    if (!value) return 'Affiliate';
    return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AgentSettingsPage() {
    const { user } = useAuthStore();
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.name || 'Affiliate';
    const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A';

    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-4 font-display sm:space-y-5">
            <header>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">Account</p>
                <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Settings</h1>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">Manage your profile and account preferences.</p>
            </header>

            <section className="border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="settings-account-title">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#202b42] text-sm font-semibold text-white sm:size-12">{initials}</span>
                    <div className="min-w-0 flex-1">
                        <h2 id="settings-account-title" className="truncate text-sm font-semibold text-slate-950 sm:text-base">{name}</h2>
                        <p className="mt-0.5 truncate text-xs text-slate-600">{user?.email || 'Email unavailable'}</p>
                        <p className="mt-1 text-[10px] capitalize text-slate-500">{humanize(user?.role)} account</p>
                    </div>
                    {user?.verificationStatus && <span className={`shrink-0 text-[10px] font-medium capitalize ${user.verificationStatus === 'verified' ? 'text-emerald-700' : user.verificationStatus === 'rejected' ? 'text-red-700' : 'text-slate-500'}`}>{user.verificationStatus.replaceAll('_', ' ')}</span>}
                </div>
            </section>

            <section aria-labelledby="settings-links-title">
                <div className="mb-2"><h2 id="settings-links-title" className="text-sm font-semibold text-slate-900">Account preferences</h2><p className="mt-0.5 text-[11px] text-slate-500">Open a page to update its available settings.</p></div>
                <div className="divide-y divide-slate-100 border border-slate-200 bg-white">
                    <Link href="/onboarding?edit-profile=1" className="group flex min-h-[76px] items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:px-5">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700"><span className="material-symbols-outlined text-[19px]">person</span></span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">Profile information</span><span className="mt-0.5 block text-xs leading-relaxed text-slate-500">Edit your personal and professional details through onboarding.</span></span>
                        <span className="material-symbols-outlined shrink-0 text-[20px] text-slate-400 group-hover:text-blue-700">arrow_forward</span>
                    </Link>
                    <Link href="/dashboard/agent/notifications" className="group flex min-h-[76px] items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:px-5">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700"><span className="material-symbols-outlined text-[19px]">notifications</span></span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">Notifications</span><span className="mt-0.5 block text-xs leading-relaxed text-slate-500">Review updates about your account and assigned work.</span></span>
                        <span className="material-symbols-outlined shrink-0 text-[20px] text-slate-400 group-hover:text-blue-700">arrow_forward</span>
                    </Link>
                </div>
            </section>

            <section className="flex items-start gap-3 border border-slate-200 bg-white p-4 sm:p-5">
                <span className="material-symbols-outlined shrink-0 text-[19px] text-slate-500">shield</span>
                <div className="min-w-0"><h2 className="text-xs font-semibold text-slate-900">Sign-in and account security</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">Your affiliate account is connected through Central Hub Solutions. Sign-in credentials are managed by your Central Hub account.</p></div>
            </section>
        </div>
    );
}
