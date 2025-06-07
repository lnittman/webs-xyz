import React from 'react';
import type { Metadata } from 'next';
import { createMetadata } from '@repo/seo/metadata';
import { AccountSpaces } from '@/components/account/account-spaces';

export const metadata: Metadata = createMetadata({
    title: 'Spaces',
    description: 'View and manage all your spaces',
});

export default function AccountSpacesPage() {
    return <AccountSpaces />;
} 