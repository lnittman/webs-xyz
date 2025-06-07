'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Link as LinkTransition } from 'next-view-transitions';
import {
    User,
    Palette,
    Database,
    Bell,
    ShieldCheck,
    CreditCard,
    MagnifyingGlass,
    X
} from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';

// Define subsections for each main section
const settingsData = [
    {
        title: 'General',
        href: '/account/settings/general',
        icon: User,
        description: 'Personal information and preferences',
        subsections: [
            'Profile',
            'Account',
            'Email',
            'Username',
            'Personal Information'
        ]
    },
    {
        title: 'Appearance',
        href: '/account/settings/appearance',
        icon: Palette,
        description: 'Customize the look and feel',
        subsections: [
            'Theme',
            'Font Family',
            'Colors',
            'Layout'
        ]
    },
    {
        title: 'Notifications',
        href: '/account/settings/notifications',
        icon: Bell,
        description: 'Email and push notification preferences',
        subsections: [
            'Email Notifications',
            'Push Notifications',
            'Desktop Alerts',
            'Mobile Alerts'
        ]
    },
    {
        title: 'Data & Privacy',
        href: '/account/settings/data',
        icon: Database,
        description: 'Export or delete your data',
        subsections: [
            'Export Data',
            'Delete Account',
            'Privacy Settings',
            'Data Usage',
            'Storage'
        ]
    },
    {
        title: 'Security',
        href: '/account/settings/security',
        icon: ShieldCheck,
        description: 'Password and authentication',
        subsections: [
            'Password',
            'Two-Factor Authentication',
            'Sessions',
            'API Keys'
        ]
    },
    {
        title: 'Billing',
        href: '/account/settings/billing',
        icon: CreditCard,
        description: 'Subscription and payment methods',
        subsections: [
            'Subscription',
            'Payment Methods',
            'Invoices',
            'Billing Address',
            'Usage'
        ]
    },
];

export const settingsNavigation = settingsData;

export function SettingsNavigation() {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter settings based on search query
    const filteredSettings = useMemo(() => {
        if (!searchQuery.trim()) {
            return settingsData;
        }

        const query = searchQuery.toLowerCase();

        return settingsData.filter(item => {
            // Check if main title matches
            const titleMatch = item.title.toLowerCase().includes(query);

            // Check if any subsection matches
            const subsectionMatch = item.subsections.some(sub =>
                sub.toLowerCase().includes(query)
            );

            // Check if description matches
            const descriptionMatch = item.description.toLowerCase().includes(query);

            return titleMatch || subsectionMatch || descriptionMatch;
        });
    }, [searchQuery]);

    // Show subsections when searching
    const shouldShowSubsections = searchQuery.trim().length > 0;

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Search Bar */}
            <div className="px-4 py-4">
                <div className="relative">
                    <MagnifyingGlass
                        size={16}
                        weight="duotone"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-9 pr-9 py-2 text-sm font-mono",
                            "bg-muted/50 border border-border rounded-lg",
                            "placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
                            "transition-colors"
                        )}
                        style={{ fontSize: '16px' }}
                    />
                    {/* Clear button with fade animation */}
                    <button
                        onClick={handleClearSearch}
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2",
                            "text-muted-foreground hover:text-foreground",
                            "transition-all duration-200",
                            searchQuery ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                        )}
                        aria-label="Clear search"
                    >
                        <X size={14} weight="duotone" />
                    </button>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-1 px-4 pt-0 overflow-y-auto">
                {filteredSettings.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-mono px-3 py-2">
                        No settings found
                    </p>
                ) : (
                    filteredSettings.map((item) => {
                        // For General settings, only active when on the specific /account/settings/general page
                        // The root /account/settings page shows navigation menu, not general content
                        const isActive = item.title === 'General'
                            ? pathname === '/account/settings/general'
                            : pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <div key={item.href}>
                                <LinkTransition
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
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
                                    <span className="font-mono">{item.title}</span>
                                </LinkTransition>

                                {/* Show subsections when searching */}
                                {shouldShowSubsections && (
                                    <div className="ml-7 mt-1 space-y-1">
                                        {item.subsections
                                            .filter(sub =>
                                                sub.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .map((subsection) => (
                                                <LinkTransition
                                                    key={`${item.href}-${subsection}`}
                                                    href={item.href}
                                                    className="block px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                                                >
                                                    {subsection}
                                                </LinkTransition>
                                            ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </nav>
        </div>
    );
} 