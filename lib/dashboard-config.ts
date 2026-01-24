import { useOnboardingStore } from '@/store/useOnboardingStore';

export const getDashboardLinks = (role: string | null) => {
    const common = [
        { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { name: 'Messages', href: '/messages', icon: 'mail' },
        { name: 'Wallet', href: '/wallet', icon: 'account_balance_wallet' },
    ];

    const roleSpecific = role === 'agent' ? [
        { name: 'My Tasks', href: '/tasks', icon: 'task' },
        { name: 'Browse Jobs', href: '/jobs', icon: 'search' },
    ] : role === 'account-manager' ? [
        { name: 'Campaigns', href: '/campaigns', icon: 'campaign' },
        { name: 'Team', href: '/team', icon: 'group' },
    ] : [ // Consultant
        { name: 'Sessions', href: '/sessions', icon: 'videocam' },
        { name: 'Audits', href: '/audits', icon: 'fact_check' },
    ];

    return [
        ...common,
        ...roleSpecific,
        { name: 'Learning', href: '/learning', icon: 'school' },
        { name: 'Settings', href: '/settings', icon: 'settings' },
    ];
};
