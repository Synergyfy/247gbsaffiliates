'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';

type VerificationProfile = {
    verificationStatus?: string; verificationNotes?: string | null;
    verificationSubmission?: Record<string, unknown> | null;
    verificationDocumentName?: string | null; verificationDocumentMimeType?: string | null;
    verificationReviewedAt?: string | null;
};

const copy: Record<string, { title: string; message: string; color: string }> = {
    verified: { title: 'Verified', message: 'An administrator has verified your identity.', color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
    pending: { title: 'Pending review', message: 'Your profile and identity document have been submitted and are awaiting administrator review.', color: 'border-amber-200 bg-amber-50 text-amber-950' },
    rejected: { title: 'Action required', message: 'Review the administrator feedback and submit updated information or documents.', color: 'border-red-200 bg-red-50 text-red-900' },
    unverified: { title: 'Not submitted', message: 'Submit your profile and identity document to begin administrator review.', color: 'border-slate-200 bg-slate-50 text-slate-800' },
};

export default function AgentVerificationPage() {
    const { user } = useAuthStore();
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['affiliate-dashboard-profile'],
        queryFn: async () => {
            const response = await apiClient.get('/auth/profile');
            return (response.data?.data ?? response.data) as VerificationProfile;
        },
    });
    const profile = (data || user) as VerificationProfile | null;
    if (isLoading) return <p className="mx-auto max-w-3xl py-10 text-sm text-slate-500">Loading verification status…</p>;
    if (isError || !profile) return <div role="alert" className="mx-auto max-w-3xl border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-900">Verification status could not be loaded. <button type="button" onClick={() => void refetch()} className="font-semibold underline">Try again</button></div>;

    const status = profile.verificationStatus || 'unverified';
    const hasSubmission = Boolean(profile.verificationSubmission);
    const state = status === 'pending' && !hasSubmission
        ? { title: 'Submission needed', message: 'Your account is pending verification. Submit your profile information and identity document to begin administrator review.', color: 'border-amber-200 bg-amber-50 text-amber-950' }
        : copy[status] || copy.unverified;
    const submittedFields = profile.verificationSubmission && typeof profile.verificationSubmission === 'object'
        ? Object.entries(profile.verificationSubmission)
        : [];

    return (
        <div className="mx-auto max-w-3xl">
            <header className="mb-5"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">Core operations</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">Verification</h1><p className="mt-1 text-sm text-slate-600">Administrator review of your profile information and identity document.</p></header>
            <section className={`border-l-4 p-4 ${state.color}`} aria-live="polite"><p className="text-sm font-semibold">{state.title}</p><p className="mt-1 text-sm">{status === 'rejected' && profile.verificationNotes ? profile.verificationNotes : state.message}</p></section>
            <section className="mt-4 border border-slate-200 bg-white p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-slate-950">Submission details</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Profile information</dt><dd className="mt-1 text-sm text-slate-800">{submittedFields.length ? 'Submitted' : 'Not submitted'}</dd></div>
                    <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Identity document</dt><dd className="mt-1 break-words text-sm text-slate-800">{profile.verificationDocumentName || 'Not submitted'}</dd></div>
                    {profile.verificationReviewedAt && <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Last reviewed</dt><dd className="mt-1 text-sm text-slate-800">{new Date(profile.verificationReviewedAt).toLocaleString()}</dd></div>}
                </dl>
                {submittedFields.length > 0 && <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">{submittedFields.map(([key, value]) => <div key={key}><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</dt><dd className="mt-1 break-words text-sm text-slate-800">{Array.isArray(value) ? value.join(', ') : value == null ? 'Not provided' : String(value)}</dd></div>)}</dl>}
            </section>
            {status === 'rejected' || !hasSubmission ? <Link href="/onboarding?edit-profile=1" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">{status === 'rejected' ? 'Update and resubmit' : 'Submit for verification'}<span className="material-symbols-outlined text-base">arrow_forward</span></Link> : null}
        </div>
    );
}
