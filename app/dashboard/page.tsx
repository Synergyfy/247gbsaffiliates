'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AgentDashboard } from '@/components/dashboard/AgentDashboard';
import { AccountManagerDashboard } from '@/components/dashboard/AccountManagerDashboard';
import { ConsultantDashboard } from '@/components/dashboard/ConsultantDashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    React.useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) {
        return null;
    }

    const renderDashboard = () => {
        switch (user.role) {
            case 'agent':
                return <AgentDashboard />;
            case 'account-manager':
                return <AccountManagerDashboard />;
            case 'consultant':
                return <ConsultantDashboard />;
            default:
                return <AgentDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-background-light">
            {renderDashboard()}
        </div>
    );
}
