'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import ReferralPanel from '@/components/dashboard/ReferralPanel';

type ProfileSubmission = {
    bio?: string | null;
    hourlyRate?: string | number | null;
    currency?: string | null;
};

type Profile = {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    profileImage?: string | null;
    avatar?: string | null;
    image?: string | null;
    status?: string | null;
    verificationStatus?: string | null;
    verificationSubmission?: ProfileSubmission | null;
    bio?: string | null;
    skills?: string[] | null;
    sectorId?: string | null;
    categoryId?: string | null;
    subCategoryId?: string | null;
    hourlyRate?: string | number | null;
    currency?: string | null;
    referralCode?: string | null;
    referralLink?: string | null;
};

type Sector = { id: string; name: string; categories?: Category[] };
type Category = { id: string; name: string; children?: Category[] };

function unwrap<T,>(value: unknown): T {
    if (value && typeof value === 'object' && 'data' in value) {
        const outer = (value as { data?: unknown }).data;
        if (outer && typeof outer === 'object' && 'data' in outer) return (outer as { data: T }).data;
        return outer as T;
    }
    return value as T;
}

function flattenCategories(categories: Category[] = []): Category[] {
    return categories.flatMap((category) => [category, ...flattenCategories(category.children || [])]);
}

function displayValue(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (Array.isArray(value)) {
        const values = value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
        return values.length ? values.join(', ') : null;
    }
    return null;
}

function humanize(value?: string | null) {
    if (!value) return 'Affiliate';
    return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getVerificationLabel(status?: string | null, hasSubmission = false) {
    if (status === 'verified') return 'Verified';
    if (status === 'rejected') return 'Action required';
    if (status === 'pending' && hasSubmission) return 'Pending review';
    if (status === 'pending') return 'Submission needed';
    return 'Not submitted';
}

function getVerificationColor(status?: string | null) {
    if (status === 'verified') return 'bg-emerald-50 text-emerald-800';
    if (status === 'rejected') return 'bg-red-50 text-red-800';
    if (status === 'pending') return 'bg-amber-50 text-amber-900';
    return 'bg-slate-100 text-slate-700';
}

function ProfileField({ label, value, hint, wide = false }: { label: string; value: string | null; hint?: string; wide?: boolean }) {
    return (
        <div className={`min-w-0 border-b border-slate-100 py-3 last:border-0 ${wide ? 'sm:col-span-2' : ''}`}>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-500">{label}</dt>
            <dd className={`mt-1 break-words text-sm ${value ? 'text-slate-900' : 'text-slate-400'}`}>{value || '—'}</dd>
            {!value && hint && <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{hint}</p>}
        </div>
    );
}

export default function AgentProfilePage() {
    const pathname = usePathname();
    const dashboardRoot = pathname.split('/').slice(0, 3).join('/');
    const { user } = useAuthStore();
    const profileQuery = useQuery({
        queryKey: ['affiliate-dashboard-profile'],
        queryFn: async () => unwrap<Profile>((await apiClient.get('/auth/profile')).data),
    });
    const sectorsQuery = useQuery({
        queryKey: ['profile-sectors'],
        queryFn: async () => unwrap<Sector[]>((await apiClient.get('/sectors')).data),
    });
    const categoriesQuery = useQuery({
        queryKey: ['profile-categories'],
        queryFn: async () => unwrap<Category[]>((await apiClient.get('/categories')).data),
    });

    const profile = (profileQuery.data || user) as Profile | null;
    if (profileQuery.isLoading && !user) {
        return <p className="mx-auto max-w-6xl py-8 text-sm text-slate-500">Loading your profile…</p>;
    }
    if (!profile) {
        return <div role="alert" className="mx-auto max-w-6xl border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-900">Your profile could not be loaded. <button type="button" onClick={() => void profileQuery.refetch()} className="font-semibold underline">Try again</button></div>;
    }

    const submission = profile.verificationSubmission || {};
    const bio = displayValue(profile.bio) || displayValue(submission.bio);
    const hourlyRate = displayValue(profile.hourlyRate) || displayValue(submission.hourlyRate);
    const currency = displayValue(profile.currency) || displayValue(submission.currency);
    const fullName = [profile.firstName, profile.lastName].filter((part) => Boolean(part?.trim())).join(' ').trim() || displayValue(profile.name);
    const nameParts = fullName?.split(/\s+/) || [];
    const initials = nameParts.slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A';
    const skills = profile.skills?.filter(Boolean) || [];
    const hasVerificationSubmission = Boolean(profile.verificationSubmission);
    const verificationLabel = getVerificationLabel(profile.verificationStatus, hasVerificationSubmission);
    const avatar = profile.profileImage || profile.avatar || profile.image;

    const sectorMap = new Map((sectorsQuery.data || []).map((sector) => [sector.id, sector.name]));
    const categoryMap = new Map(flattenCategories(categoriesQuery.data || []).map((category) => [category.id, category.name]));
    const sectorValue = profile.sectorId ? sectorMap.get(profile.sectorId) || 'Saved selection' : null;
    const categoryValue = profile.categoryId ? categoryMap.get(profile.categoryId) || 'Saved selection' : null;
    const subCategoryValue = profile.subCategoryId ? categoryMap.get(profile.subCategoryId) || 'Saved selection' : null;
    const rateValue = hourlyRate ? [currency, hourlyRate].filter(Boolean).join(' ') : null;

    const completionItems = [
        { label: 'Full name', complete: Boolean(fullName) },
        { label: 'Account email', complete: Boolean(displayValue(profile.email)) },
        { label: 'Professional bio', complete: Boolean(bio) },
        { label: 'Skills', complete: skills.length > 0 },
        { label: 'Sector', complete: Boolean(profile.sectorId) },
        { label: 'Category', complete: Boolean(profile.categoryId) },
        { label: 'Sub-category', complete: Boolean(profile.subCategoryId) },
        { label: 'Target hourly rate', complete: Boolean(hourlyRate) },
    ];
    const completedCount = completionItems.filter((item) => item.complete).length;
    const completionPercent = Math.round((completedCount / completionItems.length) * 100);
    const imageUrl = avatar || undefined;

    return (
        <div className="mx-auto w-full max-w-[1500px] space-y-4 sm:space-y-5">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] text-slate-500">
                <Link href={dashboardRoot} className="hover:text-blue-700">Dashboard</Link>
                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span aria-current="page" className="font-medium text-blue-700">My Profile</span>
            </nav>

            <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">Profile management</p>
                    <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">My Profile</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">Manage your personal information, professional background and affiliate details.</p>
                </div>
            </header>

            {profileQuery.isError && user && <div role="status" className="border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-xs text-amber-900">Showing the profile details available in your signed-in session. Refresh the page to retry loading your latest details.</div>}

            <section className="border border-slate-200 bg-white p-4 sm:p-5" aria-label="Profile identity and completion">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#202b42] text-sm font-semibold text-white sm:size-14">
                            {imageUrl ? <img src={imageUrl} alt="" className="size-full object-cover" /> : initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg">{fullName || 'Name not added'}</h2>
                            <p className="mt-0.5 truncate text-xs text-slate-600">{profile.email || 'Email unavailable'}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                                <span className="font-medium text-slate-700">{humanize(profile.role)}</span>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium ${getVerificationColor(profile.verificationStatus)}`}>
                                    <span className="size-1.5 rounded-full bg-current" />{verificationLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Link href="/onboarding?edit-profile=1" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-xs font-semibold text-white hover:bg-blue-800 sm:text-sm">
                        <span className="material-symbols-outlined text-base">edit</span>Edit Profile
                    </Link>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3 sm:mt-5 sm:flex sm:items-center sm:gap-4">
                    <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-800">Profile completion</span>
                        <span className="tabular-nums text-slate-600">{completedCount} of {completionItems.length} fields · {completionPercent}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 sm:mt-0 sm:flex-1" role="progressbar" aria-label="Profile field completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPercent}>
                        <div className="h-full rounded-full bg-blue-700 transition-[width]" style={{ width: `${completionPercent}%` }} />
                    </div>
                </div>
            </section>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.9fr)] lg:gap-5">
                <div className="min-w-0 space-y-4 sm:space-y-5">
                    <section className="border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="personal-details-title">
                        <div className="mb-2 border-b border-slate-100 pb-3">
                            <h2 id="personal-details-title" className="text-sm font-semibold text-slate-950">Personal Information</h2>
                            <p className="mt-0.5 text-[11px] text-slate-500">Your account identity and professional summary.</p>
                        </div>
                        <dl className="grid gap-x-6 sm:grid-cols-2">
                            <ProfileField label="Full legal name" value={fullName || null} />
                            <ProfileField label="Registered email" value={displayValue(profile.email)} />
                            <ProfileField label="Professional bio" value={bio} hint="Add a short summary during profile setup." wide />
                        </dl>
                    </section>

                    <section className="border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="professional-details-title">
                        <div className="mb-2 border-b border-slate-100 pb-3">
                            <h2 id="professional-details-title" className="text-sm font-semibold text-slate-950">Professional Background</h2>
                            <p className="mt-0.5 text-[11px] text-slate-500">Skills and professional details saved to your account.</p>
                        </div>
                        {skills.length > 0 && <div className="border-b border-slate-100 py-3">
                            <h3 className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-500">Skills</h3>
                            <p className="mt-1 break-words text-sm text-slate-900">{skills.join(', ')}</p>
                        </div>}
                        <dl className="grid gap-x-6 sm:grid-cols-2">
                            {skills.length === 0 && <ProfileField label="Skills" value={null} hint="Choose your skills during profile setup." />}
                            <ProfileField label="Sector" value={sectorValue} />
                            <ProfileField label="Category" value={categoryValue} />
                            <ProfileField label="Sub-category" value={subCategoryValue} />
                            <ProfileField label="Target hourly rate" value={rateValue} />
                        </dl>
                    </section>
                </div>

                <aside className="min-w-0 space-y-4 sm:space-y-5" aria-label="Profile completion and setup">
                    <section className="border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="completion-title">
                        <div className="flex items-center justify-between gap-3">
                            <h2 id="completion-title" className="text-sm font-semibold text-slate-950">Profile completion</h2>
                            <span className="text-xs font-semibold tabular-nums text-blue-700">{completionPercent}%</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Field coverage only; separate from verification and qualification.</p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                            <div className="h-full rounded-full bg-blue-700" style={{ width: `${completionPercent}%` }} />
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-slate-500"><span>{completedCount} complete</span><span>{completionItems.length - completedCount} remaining</span></div>
                        <ul className="mt-4 space-y-1.5">
                            {completionItems.map((item) => <li key={item.label} className="flex min-w-0 items-center gap-2.5 rounded-md bg-slate-50 px-2.5 py-2 text-[11px]">
                                <span className={`material-symbols-outlined shrink-0 text-[15px] ${item.complete ? 'text-emerald-700' : 'text-slate-400'}`} aria-hidden="true">{item.complete ? 'check_circle' : 'radio_button_unchecked'}</span>
                                <span className="min-w-0 flex-1 text-slate-700">{item.label}</span>
                                <span className={`shrink-0 text-[10px] ${item.complete ? 'text-emerald-800' : 'text-slate-500'}`}>{item.complete ? 'Complete' : 'Missing'}</span>
                            </li>)}
                        </ul>
                    </section>

                    <ReferralPanel
                        referralCode={profile?.referralCode ?? user?.referralCode}
                        referralLink={profile?.referralLink ?? user?.referralLink}
                    />

                    <section className="bg-[#202b42] p-4 text-white sm:p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-blue-200">Next step</p>
                        <h2 className="mt-1.5 text-sm font-semibold">{completedCount === completionItems.length ? 'Review your profile details' : 'Continue profile setup'}</h2>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">{completedCount === completionItems.length ? 'You can update any profile details through the existing onboarding flow.' : 'Add the remaining profile details through the existing guided setup.'}</p>
                        <Link href={completedCount === completionItems.length ? '/onboarding?edit-profile=1' : '/onboarding'} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-500">
                            {completedCount === completionItems.length ? 'Edit profile' : 'Resume onboarding'}<span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                    </section>
                </aside>
            </div>
        </div>
    );
}
