'use client';

import React from 'react';

export const AccountManagerDashboard: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-display font-bold text-text-main mb-6">Manager Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-2">Active Campaigns</h3>
                    <p className="text-3xl font-bold text-primary">5</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-2">Team Members</h3>
                    <p className="text-3xl font-bold text-text-main">8</p>
                </div>
            </div>
        </div>
    );
};
