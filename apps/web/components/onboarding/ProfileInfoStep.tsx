'use client';

import React, { useState } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormValues } from '@/lib/schemas';
import { toast } from 'react-toastify';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';

const ProfileInfoStep: React.FC<{ isEditingProfile?: boolean }> = ({ isEditingProfile = false }) => {
    const { role, basicInfo, profileInfo, updateProfileInfo, setStep } = useOnboardingStore();
    const { updateUser, user } = useAuthStore();
    const [identityDocument, setIdentityDocument] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const existingBio = String(
        profileInfo.bio ||
        (user?.verificationSubmission && typeof user.verificationSubmission === 'object' && (user.verificationSubmission as Record<string, unknown>).bio) ||
        user?.bio ||
        '',
    );
    const hasDocumentOnFile = Boolean(user?.verificationDocumentName);
    const isVerified = user?.verificationStatus === 'verified';
    // Only lock to "already submitted" view if the user is already verified and not actively editing
    const showAlreadySubmittedCard = isVerified && !isEditingProfile;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            role: role || 'agent',
            hourlyRate: String(profileInfo.hourlyRate ?? ''),
            bio: existingBio,
            phone: basicInfo.phone || String(profileInfo.phone ?? '') || user?.phone || '',
            postalCode: basicInfo.zipCode || String(profileInfo.postalCode ?? '') || user?.postcode || user?.postalCode || '',
            city: basicInfo.city || String(profileInfo.city ?? '') || user?.city || '',
            region: basicInfo.region || String(profileInfo.region ?? '') || user?.region || '',
            country: basicInfo.country || String(profileInfo.country ?? '') || user?.country || (basicInfo.zipCode || user?.postcode ? 'United Kingdom' : ''),
            licenseNumber: String(profileInfo.licenseNumber ?? ''),
            yearsExperience: String(profileInfo.yearsExperience ?? ''),
            company: String(profileInfo.company ?? ''),
            expertise: String(profileInfo.expertise ?? ''),
            linkedinUrl: String(profileInfo.linkedinUrl ?? ''),
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        const submission = { ...data, role: role || data.role };

        if (!identityDocument) {
            // Identity document was skipped during onboarding; save profile in store and proceed
            updateProfileInfo(submission);
            toast.info('Profile saved. You can submit your identity document for verification anytime from your dashboard.');
            setStep('questionnaire');
            return;
        }

        const formData = new FormData();
        formData.append('submission', JSON.stringify(submission));
        formData.append('identityDocument', identityDocument);

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/verification/account', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            updateProfileInfo(submission);
            updateUser({
                verificationStatus: response.data.verificationStatus,
                verificationNotes: response.data.verificationNotes,
                verificationSubmission: response.data.verificationSubmission,
                verificationReviewedAt: response.data.verificationReviewedAt,
                verificationDocumentName: identityDocument.name,
                isOnboarded: false,
            });
            toast.success('Profile and identity document submitted for admin verification.');
            setStep('questionnaire');
        } catch (error) {
            console.error('Verification submission failed:', error);
            toast.error('Could not submit your profile for verification. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onError = () => {
        toast.error("Please fix the errors before continuing.");
    };

    return (
        <div className="max-w-3xl mx-auto w-full px-1 sm:px-0">
            <div className="text-center mb-2 md:mb-10">
                <span className="hidden md:inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                    Professional Profile
                </span>
                <h1 className="text-base sm:text-lg md:text-3xl font-display font-bold text-text-main mb-0.5 md:mb-3">
                    {(() => {
                        const normalized = (role || '').toLowerCase().replace(/_/g, '-');
                        if (normalized === 'agent') return 'Agent';
                        if (normalized === 'account-manager') return 'Account Manager';
                        return 'Consultant';
                    })()} Quick Profile
                </h1>
                <p className="text-[11px] md:text-sm text-slate-500 max-w-xs sm:max-w-md mx-auto leading-normal">
                    Provide your professional bio and optional verification document.
                </p>
            </div>

            {showAlreadySubmittedCard ? (
                <section className="space-y-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="existing-verification-title">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined mt-0.5 text-xl text-emerald-700" aria-hidden="true">task_alt</span>
                        <div>
                            <h2 id="existing-verification-title" className="text-sm font-semibold text-slate-900">Profile and verification verified</h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">Your profile and identity document have been verified. You can proceed with onboarding or edit your profile details.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button type="button" onClick={() => setStep('questionnaire')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white transition-colors hover:bg-primary-hover">
                            Continue to Expertise<span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </div>
                </section>
            ) : (
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-3.5 md:space-y-6 bg-white p-4 sm:p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">

                <input type="hidden" {...register('phone')} />
                <input type="hidden" {...register('postalCode')} />
                <input type="hidden" {...register('city')} />
                <input type="hidden" {...register('region')} />
                <input type="hidden" {...register('country')} />

                {hasDocumentOnFile && (
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-700">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="material-symbols-outlined text-base text-blue-700">description</span>
                            <span className="truncate">Document on file: <strong className="font-semibold text-slate-900">{user?.verificationDocumentName}</strong></span>
                        </div>
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 capitalize">
                            {user?.verificationStatus || 'Pending'}
                        </span>
                    </div>
                )}

                <div className="space-y-1 md:space-y-2">
                    <label className="text-xs md:text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display">
                        Short Bio (Max 120 chars) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className={`w-full bg-white border rounded-xl p-3 md:p-4 text-xs md:text-sm text-text-main placeholder-gray-400 outline-none transition-all font-medium resize-none min-h-[72px] md:min-h-[96px] ${errors.bio
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
                            }`}
                        placeholder="Briefly describe your expertise..."
                        rows={2}
                        {...register('bio')}
                    />
                    {errors.bio && (
                        <p className="text-[10px] md:text-xs text-red-500 font-bold ml-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.bio.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5 md:space-y-2">
                    <label htmlFor="identity-document" className="text-xs md:text-sm font-semibold text-text-main ml-1 uppercase tracking-wider font-display flex items-center justify-between">
                        <span>Identity document <span className="text-slate-400 text-xs font-normal lowercase">(optional for now)</span></span>
                        {hasDocumentOnFile && <span className="text-[11px] font-normal text-slate-500 lowercase">(select new file to replace)</span>}
                    </label>
                    <p className="text-[10px] md:text-xs text-slate-500 font-medium mb-1.5 md:mb-2">
                        Official government-issued ID (Passport, Driving Licence, or National ID Card). PDF, JPG, or PNG up to 5 MB.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                            id="identity-document"
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={(event) => setIdentityDocument(event.target.files?.[0] || null)}
                            className="block w-full text-xs md:text-sm text-slate-500 file:mr-3 md:file:mr-4 file:py-1.5 md:file:py-2 file:px-3 md:file:px-4 file:rounded-xl file:border-0 file:text-[10px] md:file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                        />
                        {identityDocument && (
                            <button
                                type="button"
                                onClick={() => setIdentityDocument(null)}
                                className="inline-flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded"
                                title="Remove selected file"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                                <span>Clear</span>
                            </button>
                        )}
                    </div>
                    {identityDocument && (
                        <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Selected: {identityDocument.name} ({(identityDocument.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:gap-4 mt-4 md:mt-8 pt-2.5 md:pt-4 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={() => setStep('basic-info')}
                        aria-label="Back to Basic Information"
                        className="size-10 md:w-auto md:h-14 md:px-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl font-display font-bold transition-all flex items-center justify-center shrink-0 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-base md:text-xl">arrow_back</span>
                        <span className="hidden md:inline ml-1.5">Back</span>
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-10 md:h-14 px-3 md:px-8 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-2xl font-display font-bold text-xs sm:text-sm md:text-base transition-all active:scale-[0.99] shadow-sm md:shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 md:gap-2 group disabled:opacity-60"
                    >
                        <span className="md:hidden">{isSubmitting ? 'Submitting…' : 'Questionnaire'}</span>
                        <span className="hidden md:inline">{isSubmitting ? 'Submitting verification…' : 'Continue to Questionnaire'}</span>
                        <span className="material-symbols-outlined text-base md:text-lg transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                    </button>
                </div>
            </form>
            )}
        </div>
    );
};

export default ProfileInfoStep;
