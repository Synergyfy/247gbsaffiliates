'use client';

import { Suspense, useEffect } from 'react';
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
    const { currentStep, setRole, setStep, clearQuizAnswers, retakeAvailableAt, role: onboardingRole } = useOnboardingStore();
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const isRetakeQuiz = searchParams.get('retake') === '1';
    const isEditingProfile = searchParams.get('edit-profile') === '1';

    useEffect(() => {
        if (isEditingProfile) setStep('profile-info');
    }, [isEditingProfile, setStep]);

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
        if (user?.role && !onboardingRole) {
            setRole(user.role);
        }
    }, [user, onboardingRole, setRole]);

    const renderStep = () => {
        const stepToRender = isRetakeQuiz ? 'quiz' : isEditingProfile ? 'profile-info' : currentStep;
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
