import { ViewTransitions } from 'next-view-transitions';
import { SpaceSettingsNavigation } from '@/components/space/space-settings-navigation';

export default function SpaceSettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ViewTransitions>
            <div className="relative flex min-h-[calc(100vh-104px)]">
                {/* Space Settings Sidebar - hidden on mobile when viewing a settings page */}
                <div className="hidden sm:block sticky top-[104px] left-0 h-[calc(100vh-104px)] w-72 border-r border-border bg-background/50 backdrop-blur-xl">
                    <div className="flex h-full flex-col">
                        <SpaceSettingsNavigation />
                    </div>
                </div>

                {/* Content Area - full width on mobile */}
                <div className="flex-1 max-w-4xl">
                    <main className="sm:p-4">
                        {children}
                    </main>
                </div>
            </div>
        </ViewTransitions>
    );
} 