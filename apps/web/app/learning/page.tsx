'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { RoleLearningHub } from '@/components/dashboard/RoleLearningHub';

export default function LearningPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        const rawRole = (user?.role || '').toLowerCase().replace('-', '_');
        if (rawRole === 'account_manager') {
            router.replace('/dashboard/account-manager/learning');
        } else if (rawRole === 'consultant') {
            router.replace('/dashboard/consultant/learning');
        } else if (rawRole === 'agent') {
            router.replace('/dashboard/agent/learning');
        }
    }, [router, user?.role]);

    return <RoleLearningHub standalone />;
}
