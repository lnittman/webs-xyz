'use client';

import { MobileSpaceSettingsHeader } from '@/components/space/mobile-space-settings-header';

export default function SpacePrivacyPage() {
    return (
        <div className="space-y-8">
            {/* Mobile Header */}
            <MobileSpaceSettingsHeader title="Privacy & Sharing" />

            {/* Desktop Header */}
            <div className="hidden sm:block space-y-2">
                <h1 className="text-xl font-semibold">Privacy & Sharing</h1>
                <p className="text-muted-foreground">
                    Control who can access this space and manage sharing settings
                </p>
            </div>

            {/* Placeholder content */}
            <div className="space-y-6">
                <div className="p-8 border border-border rounded-lg text-center">
                    <p className="text-muted-foreground">
                        Privacy and sharing settings coming soon...
                    </p>
                </div>
            </div>
        </div>
    );
} 