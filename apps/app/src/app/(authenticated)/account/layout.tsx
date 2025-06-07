'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ViewTransitions } from 'next-view-transitions';
import { AccountOverviewNavigation } from '@/components/account/account-overview-navigation';

interface AccountLayoutProps {
    children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
    const pathname = usePathname();

    // Pages that have their own layouts and shouldn't use the shared sidebar
    const hasOwnLayout = pathname.startsWith('/account/settings') || pathname.startsWith('/account/activity');

    if (hasOwnLayout) {
    // For pages with their own layouts, just render children
        return (
            <ViewTransitions>
                <div className="flex-1 flex flex-col">
                    {children}
                </div>
            </ViewTransitions>
        );
    }

    // For other account pages, use the shared sidebar layout
    return (
        <ViewTransitions>
            <div className="relative flex min-h-[calc(100vh-104px)]">
                {/* Account Sidebar - shared across account overview pages */}
                <div className="hidden sm:block sticky top-[104px] left-0 h-[calc(100vh-104px)] w-72 border-r border-border bg-background/50 backdrop-blur-xl">
                    <div className="flex h-full flex-col">
                        <AccountOverviewNavigation />
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