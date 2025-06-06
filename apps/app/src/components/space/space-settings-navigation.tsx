'use client';

import React, { useState, useMemo } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { Link as LinkTransition } from 'next-view-transitions';
import {
    User,
    Bell,
    ShieldCheck,
    Users,
    Trash,
    MagnifyingGlass,
    X
} from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';

interface SpaceSettingsNavigationProps {
    spaceName?: string;
}

// Define space settings sections
const spaceSettingsData = [
    {
        title: 'General',
        icon: User,
        description: 'Basic space settings and preferences',
        subsections: [
            'Name & Description',
            'Emoji & Color',
            'Default Model',
            'Workspace Settings'
        ]
    },
    {
        title: 'Notifications',
        icon: Bell,
        description: 'Notification preferences for this space',
        subsections: [
            'Web Processing',
            'Error Alerts',
            'Daily Summaries',
            'Email Preferences'
        ]
    },
    {
        title: 'Privacy & Sharing',
        icon: ShieldCheck,
        description: 'Control who can access this space',
        subsections: [
            'Visibility Settings',
            'Access Permissions',
            'Share Links',
            'Export Data'
        ]
    },
    {
        title: 'Members',
        icon: Users,
        description: 'Manage space members and permissions',
        subsections: [
            'Invite Members',
            'Member Roles',
            'Pending Invitations',
            'Team Settings'
        ]
    },
    {
        title: 'Advanced',
        icon: Trash,
        description: 'Advanced settings and danger zone',
        subsections: [
            'API Settings',
            'Webhooks',
            'Export Space',
            'Delete Space'
        ]
    },
];

export function SpaceSettingsNavigation({ spaceName: propSpaceName }: SpaceSettingsNavigationProps) {
    const pathname = usePathname();
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState('');

    // Get space name from params or props
    const spaceName = propSpaceName || (params.spaceName as string);

    // Build href based on space name
    const buildHref = (section: string) => {
        const baseHref = `/${spaceName}/settings`;
        if (section === 'General') {
            return baseHref;
        }
        return `${baseHref}/${section.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`;
    };

    // Filter settings based on search query
    const filteredSettings = useMemo(() => {
        if (!searchQuery.trim()) {
            return spaceSettingsData;
        }

        const query = searchQuery.toLowerCase();

        return spaceSettingsData.filter(item => {
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
            <div className="px-4 pb-4">
                <div className="relative">
                    <MagnifyingGlass
                        size={16}
                        weight="duotone"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search settings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-9 pr-9 py-2 text-sm font-mono",
                            "bg-muted/50 border border-border rounded-lg",
                            "placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
                            "transition-colors"
                        )}
                    />
                    {/* Clear button */}
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
            <nav className="flex-1 space-y-1 p-4 pt-0 overflow-y-auto">
                {filteredSettings.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-mono px-3 py-2">
                        No settings found
                    </p>
                ) : (
                    filteredSettings.map((item) => {
                        const href = buildHref(item.title);
                        const isActive = pathname === href;
                        const Icon = item.icon;

                        return (
                            <div key={item.title}>
                                <LinkTransition
                                    href={href}
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
                                                    key={`${item.title}-${subsection}`}
                                                    href={href}
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