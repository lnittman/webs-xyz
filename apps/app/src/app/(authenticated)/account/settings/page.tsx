import React from 'react';
import type { Metadata } from 'next';
import { createMetadata } from '@repo/seo/metadata';
import { GeneralSettings } from '@/components/settings/general-settings';
import { SettingsNavigation } from '@/components/settings/settings-navigation';

export const metadata: Metadata = createMetadata({
  title: 'Settings',
  description: 'Manage your account settings and preferences',
});

export default function SettingsPage() {
  return (
    <>
      {/* Mobile: Show navigation menu */}
      <div className="block sm:hidden">
        <SettingsNavigation />
      </div>

      {/* Desktop: Show general settings */}
      <div className="hidden sm:block">
        <GeneralSettings />
      </div>
    </>
  );
} 