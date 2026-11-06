'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import apiClient from '@/lib/apiClient';
import { ChatNotificationToasts } from '@/components/chat/ChatNotificationToasts';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, updateUser } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const isAssessmentStatusPage = pathname === '/dashboard/agent/assessment';
    const [isChecking, setIsChecking] = useState(!user);
    const [verificationBannerDismissed, setVerificationBannerDismissed] = useState(false);

    const verificationBannerKey = user?.id
        ? `verification-banner:${user.id}:${user.verificationStatus || 'unverified'}`
        : null;

    useEffect(() => {
        if (!verificationBannerKey || typeof window === 'undefined') return;
        setVerificationBannerDismissed(localStorage.getItem(verificationBannerKey) === '1');
    }, [verificationBannerKey]);

    const dismissVerificationBanner = () => {
        setVerificationBannerDismissed(true);
        if (verificationBannerKey && typeof window !== 'undefined') {
            localStorage.setItem(verificationBannerKey, '1');
        }
    };

    useEffect(() => {
        // Scrub legacy auth_token from localStorage
        if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
            localStorage.removeItem('auth_token');
        }

        const checkStatus = async () => {
            try {
                // Verify session with backend via HttpOnly cookie
                const res = await apiClient.get('/auth/profile');
                if (res.data) {
                    const profile = res.data;
                    const isOnboarded = Boolean(profile.isOnboarded);
                    const isQuizPassed = Boolean(profile.isQuizPassed);

                    updateUser({
                        id: profile.id || user?.id,
                        email: profile.email || user?.email,
                        name:
                            [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() ||
                            profile.name ||
                            user?.name,
                        firstName: profile.firstName ?? user?.firstName,
                        lastName: profile.lastName ?? user?.lastName,
                        isOnboarded,
                        isQuizPassed,
                        skills: profile.skills ?? user?.skills,
                        role: profile.role || user?.role,
                        verificationStatus: profile.verificationStatus,
                        verificationNotes: profile.verificationNotes,
                        verificationSubmission: profile.verificationSubmission,
                        verificationReviewedAt: profile.verificationReviewedAt,
                        phone: profile.phone ?? null,
                        postcode: profile.postcode ?? null,
                        city: profile.city ?? null,
                        region: profile.region ?? null,
                        country: profile.country ?? null,
                    });

                    const isSkipped = useOnboardingStore.getState().assessmentSkipped || Boolean(user?.assessmentSkipped);
                    const hasSubmittedVerification = Boolean(profile.verificationSubmission);
                    const isAwaitingVerification = ['pending', 'rejected'].includes(profile.verificationStatus);

                    // Keep each affiliate inside their own role workspace.
                    const section = pathname.startsWith('/dashboard/') ? pathname.split('/')[2] : null;
                    const expectedRole =
                        section === 'agent' ? 'agent'
                        : section === 'account-manager' ? 'account_manager'
                        : section === 'consultant' ? 'consultant'
                        : section === 'admin' ? 'admin'
                        : null;
                    const actualRole = String(profile.role || '').replace(/-/g, '_');
                    if (expectedRole && actualRole !== expectedRole) {
                        const targetRole = String(profile.role || 'agent').replace(/_/g, '-');
                        router.replace(`/dashboard/${targetRole}`);
                        return;
                    }

                    if (profile.role !== 'admin' && !isOnboarded && !isSkipped && !isAssessmentStatusPage && !(isAwaitingVerification && hasSubmittedVerification)) {
                        router.push('/onboarding');
                        return;
                    }
                    setIsChecking(false);
                    return;
                }
            } catch (err: unknown) {
                const responseStatus = (err as { response?: { status?: number } } | null)?.response?.status;
                if (responseStatus === 401) {
                    router.push('/login');
                    return;
                }
            }

            if (user) {
                const isSkipped = useOnboardingStore.getState().assessmentSkipped || Boolean(user?.assessmentSkipped);
                const hasSubmittedVerification = Boolean(user.verificationSubmission);
                const isAwaitingVerification = ['pending', 'rejected'].includes(user.verificationStatus || '');
                if (user.role !== 'admin' && !user.isOnboarded && !isSkipped && !isAssessmentStatusPage && !(isAwaitingVerification && hasSubmittedVerification)) {
                    router.push('/onboarding');
                    return;
                }
                setIsChecking(false);
            } else if (!isAuthenticated) {
                router.push('/login');
            }
        };

        checkStatus();
    }, [isAuthenticated, user?.id, router, updateUser, isAssessmentStatusPage, pathname]);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-display">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-b-primary" />
                    <p className="text-slate-500 text-sm font-medium">Checking onboarding status…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-display">
            <ChatNotificationToasts />
            {children}
        </div>
    );
}
