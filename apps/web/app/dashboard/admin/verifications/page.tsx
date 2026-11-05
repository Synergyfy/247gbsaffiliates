'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { getVisibleSubmissionEntries } from '@/lib/profile-submission';

type VerificationRecord = {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    skills?: string[] | null;
    isQuizPassed: boolean;
    isOnboarded: boolean;
    verificationStatus: string;
    verificationNotes?: string | null;
    verificationReviewedAt?: string | null;
    verificationSubmission?: Record<string, unknown> | null;
    verificationDocumentName?: string | null;
    verificationDocumentMimeType?: string | null;
    submitted: boolean;
    updatedAt: string;
};

const displayValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return 'Not provided';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

export default function AdminVerificationsPage() {
    const queryClient = useQueryClient();
    const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
    const [actionError, setActionError] = useState<string | null>(null);

    const queueQuery = useQuery({
        queryKey: ['admin-verifications'],
        queryFn: async () => (await apiClient.get<VerificationRecord[]>('/admin/verifications')).data,
    });

    const decisionMutation = useMutation({
        mutationFn: async ({ id, status, notes }: { id: string; status: 'verified' | 'rejected'; notes?: string }) => {
            return (await apiClient.patch(`/admin/users/${id}/verification`, { status, notes })).data;
        },
        onSuccess: async () => {
            setActionError(null);
            await queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
        },
        onError: () => setActionError('The verification decision could not be saved. Check the submission and try again.'),
    });

    const openDocument = async (record: VerificationRecord) => {
        try {
            const response = await apiClient.get(`/admin/verifications/${record.id}/document`, { responseType: 'blob' });
            const objectUrl = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = record.verificationDocumentName || 'identity-document';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        } catch {
            setActionError(`Could not open the identity document for ${record.email}.`);
        }
    };

    if (queueQuery.isLoading) {
        return <div className="flex min-h-[50vh] items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-b-primary" /></div>;
    }

    if (queueQuery.isError) {
        return <div className="p-8"><p className="text-sm font-semibold text-red-700">Could not load verification submissions.</p><button onClick={() => void queueQuery.refetch()} className="mt-2 text-xs font-bold text-primary underline">Try again</button></div>;
    }

    const records = queueQuery.data || [];

    return (
        <div className="mx-auto max-w-7xl p-4 font-display sm:p-8">
            <header className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Admin review</p>
                <h1 className="mt-1 text-2xl font-black text-text-main">Affiliate Verification</h1>
                <p className="mt-1 text-sm text-text-secondary">Review submitted profile details and identity documents before approving account verification.</p>
            </header>

            {actionError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">{actionError}</p>}

            {records.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No affiliate accounts are awaiting verification.</div>
            ) : (
                <div className="space-y-4">
                    {records.map((record) => {
                        const name = `${record.firstName || ''} ${record.lastName || ''}`.trim() || record.email;
                        const fields = getVisibleSubmissionEntries(record.verificationSubmission);
                        return (
                            <article key={record.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                                <header className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">{name}</h2>
                                        <p className="text-xs text-slate-600">{record.email} · {record.role.replace(/_/g, ' ')}</p>
                                        <p className="mt-1 text-[10px] text-slate-500">Account status: <span className="font-bold capitalize">{record.verificationStatus}</span> · Assessment: {record.isQuizPassed ? 'Passed' : 'Not passed'} · Onboarding: {record.isOnboarded ? 'Complete' : 'Incomplete'}</p>
                                    </div>
                                    <span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${record.submitted ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{record.submitted ? 'Submission received' : 'Awaiting profile and ID'}</span>
                                </header>

                                <div className="grid gap-4 py-4 lg:grid-cols-[1fr_280px]">
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Submitted profile information</h3>
                                        {fields.length ? (
                                            <dl className="mt-2 grid gap-x-5 gap-y-2 sm:grid-cols-2">
                                                {fields.map(([key, value]) => (
                                                    <div key={key} className="min-w-0 border-b border-slate-100 pb-1.5">
                                                        <dt className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</dt>
                                                        <dd className="break-words text-xs text-slate-800">{displayValue(value)}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        ) : <p className="mt-2 text-xs text-slate-500">No profile submission has been received.</p>}
                                        <p className="mt-3 text-[10px] text-slate-600">Skills: {record.skills?.length ? record.skills.join(', ') : 'None selected'}</p>
                                    </section>

                                    <aside className="rounded-lg bg-slate-50 p-3">
                                        <h3 className="text-xs font-bold text-slate-800">Identity document</h3>
                                        <p className="mt-1 break-all text-[10px] text-slate-500">{record.verificationDocumentName || 'No file uploaded'}</p>
                                        <button type="button" onClick={() => void openDocument(record)} disabled={!record.verificationDocumentMimeType} className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[10px] font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50">View secure document</button>
                                    </aside>
                                </div>

                                {record.verificationNotes && <p className="mb-3 rounded-md bg-red-50 p-2 text-[11px] text-red-800"><strong>Previous rejection reason:</strong> {record.verificationNotes}</p>}

                                <footer className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                                    <input
                                        value={rejectionReasons[record.id] || ''}
                                        onChange={(event) => setRejectionReasons(current => ({ ...current, [record.id]: event.target.value }))}
                                        placeholder="Rejection reason * (required to reject)"
                                        aria-label={`Rejection reason for ${name}`}
                                        className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary"
                                    />
                                    <button type="button" disabled={decisionMutation.isPending || !record.submitted} onClick={() => decisionMutation.mutate({ id: record.id, status: 'verified' })} className="rounded-md bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Approve verification</button>
                                    <button type="button" disabled={decisionMutation.isPending || !rejectionReasons[record.id]?.trim()} onClick={() => decisionMutation.mutate({ id: record.id, status: 'rejected', notes: rejectionReasons[record.id] })} className="rounded-md bg-red-700 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Reject</button>
                                </footer>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
