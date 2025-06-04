import { ViewTransitions } from 'next-view-transitions';
import { SettingsNavigation } from '@/components/settings/settings-navigation';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ViewTransitions>
            <div className="relative flex min-h-screen">
                {/* Settings Sidebar */}
                <div className="fixed left-0 top-14 bottom-0 w-72 border-r border-border bg-background/50 backdrop-blur-xl">
                    <div className="flex h-full flex-col">
                        <div className="p-6 pb-4">
                            <h1 className="text-xl font-semibold font-mono">Settings</h1>
                            <p className="mt-1 text-sm text-muted-foreground font-mono">
                                Manage your account and preferences
                            </p>
                        </div>
                        <SettingsNavigation />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 pl-72">
                    <main className="min-h-screen p-8 max-w-4xl">
                        {children}
                    </main>
                </div>
            </div>
        </ViewTransitions>
    );
} 