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
            case 'account_manager':
                return <AccountManagerDashboard />;
            case 'consultant':
                return <ConsultantDashboard />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                        <p className="text-slate-600 max-w-md">
                            Your account role ({user.role}) is not authorized to access this dashboard. This portal is restricted to Agents, Account Managers, and Consultants.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background-light">
            {renderDashboard()}
        </div>
    );
}
