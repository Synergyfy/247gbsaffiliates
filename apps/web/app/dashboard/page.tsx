'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    React.useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        const isSkipped = useOnboardingStore.getState().assessmentSkipped || Boolean(user?.assessmentSkipped);
        const hasSubmittedVerification = Boolean(user?.verificationSubmission);
        const isAwaitingVerification = ['pending', 'rejected'].includes(user?.verificationStatus || '');
        const hasPassedAssessment = Boolean(user?.isQuizPassed);
        if (user && user.role !== 'admin' && !user.isOnboarded && !isSkipped && !hasPassedAssessment && !(isAwaitingVerification && hasSubmittedVerification)) {
            router.push('/onboarding');
            return;
        }
        if (user?.role) {
            switch (user.role) {
                case 'agent':
                    router.replace('/dashboard/agent');
                    break;
                case 'account-manager':
                case 'account_manager':
                    router.replace('/dashboard/account-manager');
                    break;
                case 'consultant':
                    router.replace('/dashboard/consultant');
                    break;
                case 'admin':
                    router.replace('/dashboard/admin');
                    break;
                default:
                    router.replace('/dashboard/agent');
                    break;
            }
        }
    }, [isAuthenticated, user, router]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-b-primary"></div>
        </div>
    );
}
