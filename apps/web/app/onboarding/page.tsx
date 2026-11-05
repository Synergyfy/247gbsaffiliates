'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
import BasicInfoStep from '@/components/onboarding/BasicInfoStep';
import ProfileInfoStep from '@/components/onboarding/ProfileInfoStep';
import { SkillSelectionStep } from '@/components/onboarding/SkillSelectionStep';
import { QuizStep } from '@/components/onboarding/QuizStep';
import { OutcomeStep } from '@/components/onboarding/OutcomeStep';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
            <OnboardingFlow />
        </Suspense>
    );
}

function OnboardingFlow() {
    const {
        currentStep,
        setRole,
        setStep,
        clearQuizAnswers,
        retakeAvailableAt,
        role: onboardingRole,
        basicInfo,
        updateBasicInfo,
        updateProfileInfo,
        resetOnboarding,
    } = useOnboardingStore();
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const isRetakeQuiz = searchParams.get('retake') === '1';
    const isEditingProfile = searchParams.get('edit-profile') === '1';
    const hydratedEditUser = useRef<string | null>(null);
    const syncedOnboardingUser = useRef<string | null>(null);

    const normalizeRole = (role?: string | null) =>
        (role || '').toLowerCase().replace(/_/g, '-');

    useEffect(() => {
        if (!isEditingProfile || !user?.id || hydratedEditUser.current === user.id) return;

        hydratedEditUser.current = user.id;
        setStep('basic-info');
        const submission = user?.verificationSubmission && typeof user.verificationSubmission === 'object'
            ? user.verificationSubmission
            : {};
        const city = typeof submission.city === 'string' ? submission.city : '';
        const region = typeof submission.region === 'string' ? submission.region : '';
        const country = typeof submission.country === 'string' ? submission.country : '';
        const postalCode = typeof submission.postalCode === 'string' ? submission.postalCode : '';
        const phone = typeof submission.phone === 'string' ? submission.phone : '';

        updateBasicInfo({
            city,
            region,
            country,
            zipCode: postalCode,
            phone,
            location: [city, region].filter(Boolean).join(', '),
        });
        updateProfileInfo({
            role: user?.role || onboardingRole || 'agent',
            hourlyRate: submission.hourlyRate ?? '',
            bio: submission.bio ?? '',
            licenseNumber: submission.licenseNumber ?? '',
            yearsExperience: submission.yearsExperience ?? '',
            company: submission.company ?? '',
            expertise: submission.expertise ?? '',
            linkedinUrl: submission.linkedinUrl ?? '',
        });
    }, [isEditingProfile, onboardingRole, setStep, updateBasicInfo, updateProfileInfo, user]);

    useEffect(() => {
        if (isRetakeQuiz) {
            if (retakeAvailableAt && Date.now() < retakeAvailableAt) {
                router.replace('/dashboard/agent/assessment');
                return;
            }
            clearQuizAnswers();
            setStep('quiz');
        }
    }, [clearQuizAnswers, isRetakeQuiz, retakeAvailableAt, router, setStep]);

    useEffect(() => {
        if (!user?.role) return;

        // The onboarding store is persisted in localStorage and is shared by
        // every account that signs in on this browser. Sync the role from the
        // authenticated user and clear another user's draft so an agent's
        // onboarding state can never leak into an account manager/consultant
        // session (which previously mis-routed "Skip to Dashboard" and showed
        // the wrong profile heading).
        if (syncedOnboardingUser.current !== user.id) {
            syncedOnboardingUser.current = user.id ?? null;
            if (onboardingRole && normalizeRole(onboardingRole) !== normalizeRole(user.role)) {
                resetOnboarding();
                // Re-apply the authenticated role and the contact details Central
                // already captured. Without this, the reset runs after the child
                // BasicInfoStep hydrates and wipes the imported postcode.
                setRole(user.role);
                const centralPatch: Partial<typeof basicInfo> = {};
                if (user.postcode) centralPatch.zipCode = user.postcode;
                if (user.phone) centralPatch.phone = user.phone;
                if (Object.keys(centralPatch).length) updateBasicInfo(centralPatch);
            }
        }

        if (normalizeRole(onboardingRole) !== normalizeRole(user.role)) {
            setRole(user.role);
        }
    }, [user?.id, user?.role, onboardingRole, setRole, resetOnboarding]);

    const renderStep = () => {
        const stepToRender = isRetakeQuiz ? 'quiz' : isEditingProfile && currentStep !== 'basic-info' ? 'profile-info' : currentStep;
        switch (stepToRender) {
            case 'basic-info':
                return <BasicInfoStep />;
            case 'profile-info':
                return <ProfileInfoStep />;
            case 'questionnaire':
                return <SkillSelectionStep />;
            case 'quiz':
                return <QuizStep isRetake={isRetakeQuiz} />;
            case 'outcome':
                return <OutcomeStep />;
            default:
                return <BasicInfoStep />;
        }
    };

    return (
        <OnboardingLayout hideSkipToDashboard={isRetakeQuiz}>
            {renderStep()}
        </OnboardingLayout>
    );
}
