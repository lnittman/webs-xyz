'use client';

import { MobileSpaceSettingsHeader } from '@/components/space/mobile-space-settings-header';

export default function SpaceAdvancedPage() {
    return (
        <div className="space-y-8">
            {/* Mobile Header */}
            <MobileSpaceSettingsHeader title="Advanced" />

            {/* Desktop Header */}
            <div className="hidden sm:block space-y-2">
                <h1 className="text-xl font-semibold">Advanced Settings</h1>
                <p className="text-muted-foreground">
                    Advanced settings and danger zone operations
                </p>
            </div>

            {/* Placeholder content */}
            <div className="space-y-6">
                <div className="p-8 border border-border rounded-lg text-center">
                    <p className="text-muted-foreground">
                        Advanced settings coming soon...
                    </p>
                </div>
            </div>
        </div>
    );
} 