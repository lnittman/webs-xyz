'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';
import {
    User,
    Folder,
    Globe
} from '@phosphor-icons/react/dist/ssr';

// Define account overview tabs
const accountOverviewTabs = [
    {
        id: 'general',
        title: 'General',
        href: '/account',
        icon: User,
        description: 'Profile and account information',
        exact: true
    },
    {
        id: 'spaces',
        title: 'Spaces',
        href: '/account/spaces',
        icon: Folder,
        description: 'Manage your spaces'
    },
    {
        id: 'webs',
        title: 'Webs',
        href: '/account/webs',
        icon: Globe,
        description: 'View all your webs'
    }
];

export function AccountOverviewNavigation() {
    const pathname = usePathname();

    const isTabActive = (tab: { href: string; exact?: boolean }) => {
        if (tab.exact) {
            return pathname === tab.href;
        }
        return pathname.startsWith(tab.href);
    };

    return (
        <div className="flex-1 flex flex-col pt-4">
            {/* Navigation Items */}
            <nav className="flex-1 space-y-1 px-4 pt-0 overflow-y-auto">
                {accountOverviewTabs.map((tab) => {
                    const isActive = isTabActive(tab);
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={cn(
                                "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                                "hover:bg-accent/50",
                                isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon
                                size={18}
                                weight={isActive ? "fill" : "regular"}
                                className="shrink-0"
                            />
                            <span className="font-mono">{tab.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
} 