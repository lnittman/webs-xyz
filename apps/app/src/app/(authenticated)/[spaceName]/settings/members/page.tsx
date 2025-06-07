'use client';

import { MobileSpaceSettingsHeader } from '@/components/space/mobile-space-settings-header';

export default function SpaceMembersPage() {
    return (
        <div className="space-y-8">
            {/* Mobile Header */}
            <MobileSpaceSettingsHeader title="Members" />

            {/* Desktop Header */}
            <div className="hidden sm:block space-y-2">
                <h1 className="text-xl font-semibold">Members</h1>
                <p className="text-muted-foreground">
                    Manage space members and their permissions
                </p>
            </div>

            {/* Placeholder content */}
            <div className="space-y-6">
                <div className="p-8 border border-border rounded-lg text-center">
                    <p className="text-muted-foreground">
                        Member management coming soon...
                    </p>
                </div>
            </div>
        </div>
    );
} 