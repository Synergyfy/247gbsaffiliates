'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdminAffiliate } from '@/hooks/useAdminUsers';
import apiClient from '@/lib/apiClient';
import { getVisibleSubmissionEntries } from '@/lib/profile-submission';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';

const display = (value: unknown) => {
    if (value == null || value === '') return 'Not provided';
    if (Array.isArray(value)) return value.join(', ') || 'Not provided';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

export default function AdminAffiliateProfilePage() {
    const params = useParams<{ id: string }>();
    const { data: affiliate, isLoading, isError, error, refetch } = useAdminAffiliate(params.id);

    const openIdentityDocument = async () => {
        if (!affiliate?.profile?.verificationDocumentMimeType) return;
        const response = await apiClient.get(`/admin/verifications/${affiliate.id}/document`, { responseType: 'blob' });
        const url = URL.createObjectURL(response.data);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = String(affiliate.profile.verificationDocumentName || 'identity-document');
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    };

    if (isLoading && !isError) return <div className="flex min-h-48 items-center justify-center"><span className="size-8 animate-spin rounded-full border-4 border-primary/20 border-b-primary" /></div>;
    if (isError || !affiliate) return <div className="mx-auto max-w-5xl space-y-4"><Link href="/dashboard/admin/users" className="text-sm font-semibold text-primary hover:underline">← Back to affiliates</Link><RequestErrorState area="Admin affiliate profile" label="Affiliate profile" error={error} onRetry={() => void refetch()} supportHref="/dashboard/admin" compact={false} /></div>;

    const attempts = affiliate.assessmentAttempts || [];
    const profile = affiliate.profile || {};
    const submission = profile.verificationSubmission && typeof profile.verificationSubmission === 'object' ? profile.verificationSubmission as Record<string, unknown> : {};
    const visibleSubmission = getVisibleSubmissionEntries(submission);

    return (
        <div className="mx-auto max-w-5xl">
            <Link href="/dashboard/admin/users" className="text-sm font-semibold text-primary hover:underline">← Back to affiliates</Link>
            <header className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
                <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Affiliate profile</p><h1 className="mt-1 text-2xl font-black text-slate-950">{affiliate.name}</h1><p className="text-sm text-slate-600">{affiliate.email} · {affiliate.role.replaceAll('_', ' ')}</p></div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${affiliate.qualificationStatus === 'qualified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{affiliate.qualificationStatus}</span>
            </header>

            <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    ['Verification', affiliate.verificationStatus],
                    ['Onboarding', affiliate.isOnboarded ? 'Complete' : 'Incomplete'],
                    ['Assessment', affiliate.isQuizPassed ? 'Passed' : 'Not passed'],
                    ['Learning progress', affiliate.learningStatus.replaceAll('_', ' ')],
                ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-bold capitalize text-slate-900">{value}</p></div>)}
            </section>
            {affiliate.learningResourceCount > 0 && <p className="mt-2 text-right text-xs text-slate-500">{affiliate.learningCompletedCount} of {affiliate.learningResourceCount} published resources completed</p>}

            <section className="mt-4 grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-white p-5">
                    <h2 className="font-bold text-slate-900">Profile and verification</h2>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                        {Object.entries({
                            Bio: profile.bio,
                            Skills: affiliate.skills,
                            Sector: profile.sectorId,
                            Category: profile.categoryId,
                            'Sub-category': profile.subCategoryId,
                            'Hourly rate': profile.hourlyRate,
                            Currency: profile.currency,
                        }).map(([key, value]) => <div key={key}><dt className="text-[10px] font-semibold uppercase text-slate-500">{key}</dt><dd className="mt-0.5 break-words text-sm text-slate-800">{display(value)}</dd></div>)}
                    </dl>
                    {visibleSubmission.length > 0 && <div className="mt-4 border-t border-slate-100 pt-3"><h3 className="text-xs font-bold text-slate-800">Submitted verification information</h3><dl className="mt-2 grid gap-2 sm:grid-cols-2">{visibleSubmission.map(([key, value]) => <div key={key}><dt className="text-[10px] font-semibold uppercase text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</dt><dd className="break-words text-xs text-slate-800">{display(value)}</dd></div>)}</dl></div>}
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                        <span className="text-xs text-slate-600">Identity: {display(profile.verificationDocumentName)}</span>
                        {Boolean(profile.verificationDocumentMimeType) && <button onClick={() => void openIdentityDocument()} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">View identity document</button>}
                        {(affiliate.verificationStatus === 'pending' || affiliate.verificationStatus === 'rejected') && <Link href="/dashboard/admin/verifications" className="text-xs font-semibold text-primary hover:underline">Open verification queue</Link>}
                    </div>
                    {affiliate.verificationNotes && <p className="mt-3 rounded-md bg-amber-50 p-2 text-xs text-amber-900">Review note: {affiliate.verificationNotes}</p>}
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-5">
                    <h2 className="font-bold text-slate-900">Assessment history</h2>
                    {attempts.length ? <div className="mt-3 space-y-3">{attempts.map((attempt) => <div key={attempt.id} className="rounded-lg border border-slate-100 p-3"><div className="flex justify-between gap-3"><strong className="text-sm text-slate-900">{attempt.percentage}% · {attempt.band}</strong><span className="text-xs text-slate-500">{new Date(attempt.createdAt).toLocaleString()}</span></div><p className="mt-1 text-xs text-slate-600">Score {attempt.score} / {attempt.maxScore}</p><details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-slate-700">Review submitted answers</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-[10px] text-slate-700">{JSON.stringify(attempt.answers, null, 2)}</pre></details></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No assessment attempts recorded.</p>}
                    <div className="mt-4 border-t border-slate-100 pt-3"><h3 className="text-xs font-bold text-slate-800">Qualification requirements</h3><ul className="mt-2 space-y-1 text-xs text-slate-600"><li>{affiliate.verificationStatus === 'verified' ? '✓' : '○'} Admin verification</li><li>{affiliate.isQuizPassed ? '✓' : '○'} Assessment passed</li><li>{affiliate.skills?.length ? '✓' : '○'} Skills selected</li><li>{affiliate.isOnboarded ? '✓' : '○'} Onboarding completed</li></ul><p className="mt-2 text-[11px] text-slate-500">Qualification follows these persisted requirements. The system has no separate manual qualification override.</p></div>
                    <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Learning progress is based on this affiliate’s completion records for published resources targeted to their role.</div>
                </article>
            </section>
        </div>
    );
}
