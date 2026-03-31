'use client';

import React from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { UserRole } from '@/types/auth';

interface RoleOption {
    id: UserRole;
    title: string;
    description: string;
    icon: string;
}

const roles: RoleOption[] = [
    {
        id: 'agent',
        title: 'Agent',
        description: 'Perfect for independent specialists looking to connect with clients and manage individual project listings.',
        icon: 'person_search',
    },
    {
        id: 'account_manager',
        title: 'Account Manager',
        description: 'Ideal for agency leads managing multiple agents, complex client portfolios, and high-volume transactions.',
        icon: 'business_center',
    },
    {
        id: 'consultant',
        title: 'Consultant',
        description: 'Designed for strategic advisors providing expert analysis, reporting, and advisory services to the marketplace.',
        icon: 'insights',
    },
];

export const RoleSelectionStep: React.FC = () => {
    const { setRole } = useOnboardingStore();

    return (
        <div className="max-w-5xl mx-auto py-12">
            <div className="text-center mb-16 px-4">
                <h1 className="text-4xl font-bold text-text-main mb-4 tracking-tight font-display">Select Your Path</h1>
                <p className="text-text-secondary text-lg font-medium">
                    Choose the role that best fits your expertise to get started with your certification.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setRole(role.id)}
                        className="group p-8 rounded-4xl border-2 border-slate-100 bg-white shadow-sm transition-all duration-300 flex flex-col items-center text-center hover:border-primary hover:shadow-xl hover:-translate-y-2"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 transition-colors group-hover:bg-primary text-primary group-hover:text-white">
                            <span className="material-symbols-outlined text-4xl">{role.icon}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-text-main tracking-tight group-hover:text-primary font-display transition-colors">
                            {role.title}
                        </h3>
                        <p className="text-text-secondary font-medium leading-relaxed mb-8 grow">
                            {role.description}
                        </p>
                        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase font-display">
                            Select Role <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
