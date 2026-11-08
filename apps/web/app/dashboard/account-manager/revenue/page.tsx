'use client';

import React from 'react';
import McomWalletPanel from '@/components/dashboard/McomWalletPanel';

/**
 * Account managers are affiliates too, so their revenue page is the same
 * Central Hub MCOM wallet + ledger used by agents and consultants. The old
 * page queried 247GBS local wallet transactions, which never receive the
 * Central task settlements.
 */
export default function RevenuePage() {
    return (
        <McomWalletPanel
            eyebrow="Account manager workspace"
            title="Revenue Overview"
            subtitle="Central Hub MCOM wallet for task payouts, affiliate earnings and holds."
        />
    );
}
