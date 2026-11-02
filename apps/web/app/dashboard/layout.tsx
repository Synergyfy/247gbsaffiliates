'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import apiClient from '@/lib/apiClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, updateUser } = useAuthStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(!user);

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
                        isOnboarded,
                        isQuizPassed,
                        role: profile.role || user?.role,
                    });

                    const isSkipped = useOnboardingStore.getState().assessmentSkipped || Boolean(user?.assessmentSkipped);
                    if (profile.role !== 'admin' && !isOnboarded && !isSkipped) {
                        router.push('/onboarding');
                        return;
                    }
                    setIsChecking(false);
                    return;
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    router.push('/login');
                    return;
                }
            }

            if (user) {
                const isSkipped = useOnboardingStore.getState().assessmentSkipped || Boolean(user?.assessmentSkipped);
                if (user.role !== 'admin' && !user.isOnboarded && !isSkipped) {
                    router.push('/onboarding');
                    return;
                }
                setIsChecking(false);
            } else if (!isAuthenticated) {
                router.push('/login');
            }
        };

        checkStatus();
    }, [isAuthenticated, user, router, updateUser]);

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
            {children}
        </div>
    );
}
