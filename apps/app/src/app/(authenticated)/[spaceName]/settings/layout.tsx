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
                {/* Space Settings Sidebar */}
                <div className="sticky top-[104px] left-0 h-[calc(100vh-104px)] w-72 border-r border-border bg-background/50 backdrop-blur-xl">
                    <div className="flex h-full flex-col">
                        <div className="p-6 pb-4">
                            <h2 className="text-lg font-semibold font-mono">Space Settings</h2>
                            <p className="mt-1 text-sm text-muted-foreground font-mono">
                                Configure space preferences
                            </p>
                        </div>
                        <SpaceSettingsNavigation />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <main className="p-8 max-w-4xl">
                        {children}
                    </main>
                </div>
            </div>
        </ViewTransitions>
    );
} 