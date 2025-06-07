'use client';

import { MobileSpaceSettingsHeader } from '@/components/space/mobile-space-settings-header';

export default function SpaceNotificationsPage() {
    return (
        <div className="space-y-8">
            {/* Mobile Header */}
            <MobileSpaceSettingsHeader title="Notifications" />

            {/* Desktop Header */}
            <div className="hidden sm:block space-y-2">
                <h1 className="text-xl font-semibold">Notification Settings</h1>
                <p className="text-muted-foreground">
                    Configure notification preferences for this space
                </p>
            </div>

            {/* Placeholder content */}
            <div className="space-y-6">
                <div className="p-8 border border-border rounded-lg text-center">
                    <p className="text-muted-foreground">
                        Space notification settings coming soon...
                    </p>
                </div>
            </div>
        </div>
    );
} 