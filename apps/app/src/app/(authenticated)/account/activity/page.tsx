import React from 'react';
import type { Metadata } from 'next';
import { createMetadata } from '@repo/seo/metadata';
import { AccountActivityLayout } from '@/components/account/account-activity-layout';

export const metadata: Metadata = createMetadata({
    title: 'Account Activity',
    description: 'View your recent account activity and usage',
});

export default function AccountActivityPage() {
    return <AccountActivityLayout />;
} 