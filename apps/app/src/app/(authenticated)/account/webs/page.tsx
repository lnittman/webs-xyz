import React from 'react';
import type { Metadata } from 'next';
import { createMetadata } from '@repo/seo/metadata';
import { AccountWebs } from '@/components/account/account-webs';

export const metadata: Metadata = createMetadata({
    title: 'Account Webs',
    description: 'All your analyzed webs across all spaces',
});

export default function AccountWebsPage() {
    return (
        <main className="p-8 max-w-6xl mx-auto">
            <AccountWebs />
        </main>
    );
} 