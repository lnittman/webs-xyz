import React from 'react';
import { AccountOverviewNavigation } from '@/components/account/account-overview-navigation';

export default function AccountPage() {
    return (
        <>
            {/* Mobile: Show navigation menu */}
            <div className="block sm:hidden">
                <AccountOverviewNavigation />
            </div>

            {/* Desktop: Show navigation menu */}
            <div className="hidden sm:block">
                <AccountOverviewNavigation />
            </div>
        </>
    );
} 