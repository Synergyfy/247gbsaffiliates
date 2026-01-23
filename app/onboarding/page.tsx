'use client';

import { useEffect } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuthStore } from '@/store/useAuthStore';
// Refreshed onboarding component imports
import BasicInfoStep from '@/components/onboarding/BasicInfoStep';
import ProfileInfoStep from '@/components/onboarding/ProfileInfoStep';
import { SkillSelectionStep } from '@/components/onboarding/SkillSelectionStep';
import { QuizStep } from '@/components/onboarding/QuizStep';
import { OutcomeStep } from '@/components/onboarding/OutcomeStep';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';

export default function OnboardingPage() {
    const { currentStep, setRole, role: onboardingRole } = useOnboardingStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.role && !onboardingRole) {
            setRole(user.role);
        }
    }, [user, onboardingRole, setRole]);

    const renderStep = () => {
        switch (currentStep) {
            case 'basic-info':
                return <BasicInfoStep />;
            case 'profile-info':
                return <ProfileInfoStep />;
            case 'questionnaire':
                return <SkillSelectionStep />;
            case 'quiz':
                return <QuizStep />;
            case 'outcome':
                return <OutcomeStep />;
            default:
                return <BasicInfoStep />;
        }
    };

    return (
        <OnboardingLayout>
            {renderStep()}
        </OnboardingLayout>
    );
}
