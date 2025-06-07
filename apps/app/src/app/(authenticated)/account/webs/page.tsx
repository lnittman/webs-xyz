import React from 'react';
import type { Metadata } from 'next';
import { createMetadata } from '@repo/seo/metadata';
import { AccountWebs } from '@/components/account/account-webs';

export const metadata: Metadata = createMetadata({
    title: 'Webs',
    description: 'View and manage all your webs',
});

export default function AccountWebsPage() {
    return <AccountWebs />;
} 