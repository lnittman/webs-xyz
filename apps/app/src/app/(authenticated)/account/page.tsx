import React from 'react';
import type { Metadata } from 'next';
import { createMetadata } from '@repo/seo/metadata';
import { AccountOverviewLayout } from '@/components/account/account-overview-layout';

export const metadata: Metadata = createMetadata({
    title: 'Account Overview',
    description: 'Your account overview and profile',
});

export default function AccountPage() {
    return <AccountOverviewLayout />;
} 