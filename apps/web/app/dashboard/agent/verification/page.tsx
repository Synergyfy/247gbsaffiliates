'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { getVisibleSubmissionEntries } from '@/lib/profile-submission';
import { RequestErrorState } from '@/components/dashboard/RequestErrorState';
import { stabilizeErrorRetry } from '@/lib/requestErrors';
import { toast } from 'react-toastify';

type VerificationProfile = {
    id?: string;
    phone?: string | null;
    postcode?: string | null;
    postalCode?: string | null;
    bio?: string | null;
    role?: string | null;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    verificationStatus?: string;
    verificationNotes?: string | null;
    verificationSubmission?: Record<string, unknown> | null;
    verificationDocumentName?: string | null;
    verificationDocumentMimeType?: string | null;
    verificationReviewedAt?: string | null;
};

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AgentVerificationPage() {
    const { user, updateUser } = useAuthStore();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, isLoading, isError, error, refetch } = stabilizeErrorRetry(
        useQuery({
            queryKey: ['affiliate-dashboard-profile'],
            queryFn: async () => {
                const response = await apiClient.get('/auth/profile');
                return (response.data?.data ?? response.data) as VerificationProfile;
            },
        }),
    );

    const profile = (data || user) as VerificationProfile | null;

    if (isLoading && !isError) {
        return <p className="mx-auto max-w-3xl py-10 text-sm text-slate-500">Loading verification status…</p>;
    }

    if (isError || !profile) {
        return (
            <div className="mx-auto max-w-3xl py-4">
                <RequestErrorState
                    area="Verification status"
                    label="Verification status"
                    error={error}
                    onRetry={() => void refetch()}
                    supportHref="/dashboard/agent/messages"
                />
            </div>
        );
    }

    const status = profile.verificationStatus || 'unverified';
    const isVerified = status === 'verified';
    const isPending = status === 'pending';
    const isRejected = status === 'rejected';
    const documentName = profile.verificationDocumentName || user?.verificationDocumentName;
    const hasDocument = Boolean(documentName);
    const submittedFields = profile.verificationSubmission && typeof profile.verificationSubmission === 'object'
        ? getVisibleSubmissionEntries(profile.verificationSubmission)
        : [];

    const handleFileSelect = (selectedFile: File | null) => {
        if (!selectedFile) return;
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error('Invalid format. Please upload a PDF, JPG, or PNG document.');
            return;
        }
        const maxBytes = 5 * 1024 * 1024; // 5 MB
        if (selectedFile.size > maxBytes) {
            toast.error('File size exceeds 5 MB. Please select a smaller file.');
            return;
        }
        setFile(selectedFile);
    };

    const handleUploadDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select an identity document to upload.');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('identityDocument', file);

            // Pass phone, postcode, bio from profile/user to satisfy backend persistence
            const submissionPayload: Record<string, unknown> = {
                role: user?.role || 'agent',
                phone: profile?.phone || user?.phone || '',
                postalCode: profile?.postcode || profile?.postalCode || user?.postcode || user?.postalCode || '',
                bio: profile?.bio || user?.bio || '',
            };
            formData.append('submission', JSON.stringify(submissionPayload));

            const response = await apiClient.post('/verification/account', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            updateUser({
                verificationStatus: response.data.verificationStatus,
                verificationNotes: response.data.verificationNotes,
                verificationSubmission: response.data.verificationSubmission,
                verificationReviewedAt: response.data.verificationReviewedAt,
                verificationDocumentName: file.name,
                isOnboarded: false,
            });

            toast.success('Identity document submitted for administrator verification.');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            await refetch();
        } catch (err: unknown) {
            console.error('Failed to submit identity document:', err);
            const errResponse = (err as { response?: { data?: { message?: string } } })?.response;
            const msg = errResponse?.data?.message || 'Could not upload identity document. Please try again.';
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    const statusBadge = (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            isVerified ? 'bg-emerald-100 text-emerald-800' :
            isPending ? 'bg-amber-100 text-amber-800' :
            isRejected ? 'bg-red-100 text-red-800' :
            'bg-slate-100 text-slate-700'
        }`}>
            <span className={`size-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-current'}`} />
            {isVerified ? 'Verified' : isPending ? 'Pending Review' : isRejected ? 'Action Required' : 'Not Submitted'}
        </span>
    );

    return (
        <div className="mx-auto w-full min-w-0 max-w-3xl space-y-3 sm:space-y-6">
            {/* Desktop Header */}
            <header className="hidden sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">Core operations</p>
                <div className="mt-1 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-950">Identity & Verification</h1>
                    {statusBadge}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                    Administrator review of your official identity document and profile details.
                </p>
            </header>

            {/* Mobile Header: Compact & High Density (100dvh above-the-fold optimization) */}
            <header className="sm:hidden space-y-1.5 pb-1">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Core Operations</p>
                        <h1 className="text-base font-bold text-slate-950 leading-tight">Identity & Verification</h1>
                    </div>
                    {statusBadge}
                </div>
                {/* Mobile Single-line Status Micro-notice */}
                <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] leading-tight ${
                    isVerified ? 'border border-emerald-200 bg-emerald-50/90 text-emerald-900' :
                    isPending ? 'border border-amber-200 bg-amber-50/90 text-amber-900' :
                    isRejected ? 'border border-red-200 bg-red-50/90 text-red-900' :
                    'border border-slate-200 bg-slate-50 text-slate-700'
                }`}>
                    <span className="material-symbols-outlined shrink-0 text-[15px]">
                        {isVerified ? 'verified' : isPending ? 'schedule' : isRejected ? 'error' : 'info'}
                    </span>
                    <span className="truncate">
                        {isVerified
                            ? 'Identity verified · Qualified for task assignments'
                            : isPending
                                ? 'Document received · Reviews take 1–2 business days'
                                : isRejected
                                    ? (profile.verificationNotes || 'Re-upload required: submit an updated document')
                                    : 'Upload a government photo ID to unlock tasks'}
                    </span>
                </div>
            </header>

            {/* Desktop Verification Status Banner (Kept spacious on desktop, hidden on mobile) */}
            <div className="hidden sm:block">
                {isVerified && (
                    <section className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5" aria-live="polite">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-0.5 text-2xl text-emerald-700">verified</span>
                            <div>
                                <h2 className="text-sm font-semibold text-emerald-950">Identity Verified</h2>
                                <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                                    An administrator has reviewed and verified your identity document. Your account is qualified for task delegation and paid assignments.
                                </p>
                                {profile.verificationReviewedAt && (
                                    <p className="mt-2 text-[11px] text-emerald-700 font-medium">
                                        Verified on {new Date(profile.verificationReviewedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {isPending && (
                    <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5" aria-live="polite">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-0.5 text-2xl text-amber-700">schedule</span>
                            <div>
                                <h2 className="text-sm font-semibold text-amber-950">Pending Administrator Review</h2>
                                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                                    Your profile and identity document have been received and are awaiting verification. Reviews typically take 1–2 business days. You will be notified once reviewed.
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {isRejected && (
                    <section className="rounded-xl border border-red-200 bg-red-50/80 p-4 sm:p-5" aria-live="polite">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-0.5 text-2xl text-red-600">error</span>
                            <div>
                                <h2 className="text-sm font-semibold text-red-950">Action Required: Verification Review</h2>
                                <p className="mt-1 text-xs leading-relaxed text-red-800">
                                    {profile.verificationNotes || 'Your previous submission requires attention. Please upload an updated identity document below for re-evaluation.'}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {!isVerified && !isPending && !isRejected && (
                    <section className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 sm:p-5" aria-live="polite">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined mt-0.5 text-2xl text-blue-700">info</span>
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">Identity Document Not Submitted</h2>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                    Verification is required to unlock task delegation and commercial assignments. Upload a valid government-issued photo ID below to begin review.
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Direct Document Upload Card: Flattened on Mobile, No Unnecessary Nested Cards */}
            <section className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-4">
                    <div>
                        <h2 className="text-xs sm:text-base font-bold sm:font-semibold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                            <span className="material-symbols-outlined text-base sm:text-xl text-blue-700">badge</span>
                            <span>{hasDocument ? 'Identity Document' : 'Upload Identity Document'}</span>
                        </h2>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-500">
                            Passport, National ID card, or Driving Licence (PDF, JPG, PNG ≤ 5 MB).
                        </p>
                    </div>
                </div>

                {/* Existing Document On File */}
                {hasDocument && (
                    <div className="mt-2.5 sm:mt-4 rounded-lg border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="material-symbols-outlined text-lg sm:text-2xl text-slate-600">description</span>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                    {documentName}
                                </p>
                                <p className="text-[10px] sm:text-[11px] text-slate-500">
                                    {isVerified ? 'Verified document on record' : 'Submitted for review'}
                                    {profile.verificationReviewedAt ? ` · Reviewed ${new Date(profile.verificationReviewedAt).toLocaleDateString()}` : ''}
                                </p>
                            </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            On File
                        </span>
                    </div>
                )}

                {/* Upload Form - Flatter Dropzone on Mobile to eliminate nested container fatigue */}
                {!isVerified && (
                    <form onSubmit={handleUploadDocument} className="mt-3 sm:mt-5 space-y-2.5 sm:space-y-4">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragOver(false);
                                if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    fileInputRef.current?.click();
                                }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label="Upload identity document file"
                            className={`flex flex-col items-center justify-center rounded-lg sm:rounded-xl border-2 border-dashed p-3 sm:p-6 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                isDragOver
                                    ? 'border-blue-600 bg-blue-50/60'
                                    : file
                                        ? 'border-emerald-400 bg-emerald-50/30'
                                        : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/60'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf,image/jpeg,image/png"
                                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                            <div className="flex size-8 sm:size-12 items-center justify-center rounded-full bg-blue-50 text-blue-700 mb-1 sm:mb-3">
                                <span className="material-symbols-outlined text-lg sm:text-2xl">
                                    {file ? 'task' : 'cloud_upload'}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-900 leading-tight">
                                {file ? 'Change selected file' : 'Click to select or drag and drop'}
                            </p>
                            <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500">
                                PDF, JPEG, PNG (Max 5 MB)
                            </p>
                        </div>

                        {/* Selected file preview */}
                        {file && (
                            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 sm:p-3 text-xs text-emerald-900">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="material-symbols-outlined text-base sm:text-lg text-emerald-700">check_circle</span>
                                    <span className="font-medium truncate text-xs">{file.name}</span>
                                    <span className="text-[10px] text-emerald-700 shrink-0 font-normal">({formatBytes(file.size)})</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                    title="Remove file"
                                    aria-label="Remove selected file"
                                >
                                    <span className="material-symbols-outlined text-sm sm:text-base">close</span>
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={!file || isUploading}
                                className="inline-flex h-9 sm:min-h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-blue-700 px-4 sm:px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="size-3.5 animate-spin rounded-full border-2 border-white/20 border-b-white" />
                                        <span>Submitting document…</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm sm:text-base">upload_file</span>
                                        <span>{hasDocument ? 'Submit Replacement' : 'Submit for Verification'}</span>
                                    </>
                                )}
                            </button>

                            <Link
                                href="/onboarding?step=profile-info"
                                className="inline-flex h-8 sm:min-h-10 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-center"
                            >
                                <span>Edit full onboarding profile</span>
                                <span className="material-symbols-outlined text-xs sm:text-sm">arrow_forward</span>
                            </Link>
                        </div>
                    </form>
                )}

                {isVerified && (
                    <div className="mt-3 sm:mt-4 flex justify-end">
                        <Link
                            href="/onboarding?step=profile-info"
                            className="inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                        >
                            <span>Edit onboarding profile (Step 2)</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                )}
            </section>

            {/* Organized User Data: Collapsible Disclosure on Mobile / Structured Grid on Desktop */}
            <details open className="group rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between p-3 sm:p-5 cursor-pointer list-none select-none hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-base sm:text-lg text-slate-600">badge</span>
                        <h2 className="text-xs sm:text-sm font-semibold text-slate-950 truncate">
                            Profile & Submission Information
                        </h2>
                    </div>
                    <span className="material-symbols-outlined text-base sm:text-lg text-slate-400 transition-transform group-open:rotate-180 shrink-0">
                        expand_more
                    </span>
                </summary>

                <div className="border-t border-slate-100 p-3.5 sm:p-5 pt-3 sm:pt-4">
                    {/* Primary Status Overview Row */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 rounded-lg bg-slate-50/70 p-2.5 sm:p-3 text-xs mb-3 border border-slate-100">
                        <div>
                            <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Identity Document</span>
                            <span className="mt-0.5 block font-semibold text-slate-900 truncate text-[11px] sm:text-xs">
                                {documentName || 'Not submitted'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification Status</span>
                            <span className="mt-0.5 block font-semibold capitalize text-slate-900 text-[11px] sm:text-xs">
                                {status}
                            </span>
                        </div>
                        {profile.verificationReviewedAt && (
                            <div className="col-span-2 pt-1 border-t border-slate-200/60">
                                <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Reviewed</span>
                                <span className="mt-0.5 block text-slate-800 text-[11px] sm:text-xs">
                                    {new Date(profile.verificationReviewedAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Submitted Fields Breakdown */}
                    {submittedFields.length > 0 ? (
                        <dl className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2">
                            {submittedFields.map(([key, value]) => (
                                <div key={key} className="rounded-md border border-slate-100 bg-white p-2 sm:p-2.5 min-w-0">
                                    <dt className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {key.replace(/([A-Z])/g, ' $1')}
                                    </dt>
                                    <dd className="mt-0.5 break-words text-xs text-slate-800 [overflow-wrap:anywhere]">
                                        {Array.isArray(value) ? value.join(', ') : value == null ? 'Not provided' : String(value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p className="text-xs text-slate-500 py-1">
                            No additional submission fields on record yet. Complete your profile details anytime through onboarding.
                        </p>
                    )}
                </div>
            </details>
        </div>
    );
}
