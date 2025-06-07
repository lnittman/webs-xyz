import React from 'react';
import { MobileSettingsHeader } from '@/components/settings/mobile-settings-header';

export default function BillingSettingsPage() {
    return (
        <div className="space-y-6">
            {/* Mobile header with back button */}
            <MobileSettingsHeader title="Billing" />

            <div className="p-8 border border-dashed border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground font-mono">
                    Billing settings coming soon...
                </p>
            </div>
        </div>
    );
} 