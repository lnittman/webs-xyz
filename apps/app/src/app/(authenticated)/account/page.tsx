import React from 'react';
import type { Metadata } from 'next';
import { createMetadata } from '@repo/seo/metadata';
import { AccountOverviewLayout } from '@/components/account/account-overview-layout';
import { AccountOverviewNavigation } from '@/components/account/account-overview-navigation';

export const metadata: Metadata = createMetadata({
    title: 'Account',
    description: 'Manage your account and profile information',
});

export default function AccountPage() {
    return (
        <>
            {/* Mobile: Show navigation menu */}
            <div className="block sm:hidden">
                <AccountOverviewNavigation />
            </div>

            {/* Desktop: Show profile content */}
            <div className="hidden sm:block">
                <AccountOverviewLayout />
            </div>
        </>
    );
} 