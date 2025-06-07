import React from 'react';
import { MobileSettingsHeader } from '@/components/settings/mobile-settings-header';

export default function SecuritySettingsPage() {
    return (
        <div className="space-y-6">
            {/* Mobile header with back button */}
            <MobileSettingsHeader title="Security" />

            <div className="p-8 border border-dashed border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground font-mono">
                    Security settings coming soon...
                </p>
            </div>
        </div>
    );
} 