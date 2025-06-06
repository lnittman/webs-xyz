import React from 'react';
import type { Metadata } from 'next';
import { createMetadata } from '@repo/seo/metadata';
import { GeneralSettings } from '@/components/settings/general-settings';

export const metadata: Metadata = createMetadata({
  title: 'Settings',
  description: 'Manage your account settings and preferences',
});

export default function SettingsPage() {
  return <GeneralSettings />;
} 