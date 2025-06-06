import React from 'react';
import type { Metadata } from 'next';
import { createMetadata } from '@repo/seo/metadata';
import { AccountSpaces } from '@/components/account/account-spaces';

export const metadata: Metadata = createMetadata({
    title: 'Account Spaces',
    description: 'Manage your spaces and their organization',
});

export default function AccountSpacesPage() {
    return (
        <main className="p-8 max-w-6xl mx-auto">
            <AccountSpaces />
        </main>
    );
} 