'use client';

import React from 'react';
import { useWebs } from '@/hooks/web/queries';
import { useSpaces } from '@/hooks/spaces';
import { Clock, Calendar, Globe, Folder, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';

interface ActivityItem {
    id: string;
    type: 'web' | 'space';
    title: string;
    subtitle: string;
    timestamp: Date;
    status?: string;
    href?: string;
    icon: React.ComponentType<any>;
    spaceId?: string | null;
}

interface AccountActivityProps {
    searchQuery?: string;
    selectedType?: string;
    selectedSpace?: string;
    dateRange?: string;
}

export function AccountActivity({ searchQuery = '', selectedType = 'all', selectedSpace = 'all', dateRange = 'all' }: AccountActivityProps) {
    const { webs, isLoading: websLoading } = useWebs();
    const { spaces, isLoading: spacesLoading } = useSpaces();

    const isLoading = websLoading || spacesLoading;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // Combine webs and spaces into activity items
    const activities: ActivityItem[] = [
        ...(webs?.map(web => ({
            id: web.id,
            type: 'web' as const,
            title: web.title || new URL(web.url).hostname,
            subtitle: `Web analysis • ${web.status.toLowerCase()}`,
            timestamp: new Date(web.createdAt),
            status: web.status,
            href: `/w/${web.id}`,
            icon: Globe,
            spaceId: web.spaceId
        })) || []),
        ...(spaces?.map(space => ({
            id: space.id,
            type: 'space' as const,
            title: space.name,
            subtitle: `Space created • ${space._count?.webs || 0} webs`,
            timestamp: new Date(space.createdAt),
            href: `/${space.name.toLowerCase().replace(/\s+/g, '-')}`,
            icon: Folder,
            spaceId: space.id
        })) || [])
    ];

    // Apply filters
    let filteredActivities = activities;

    // Search filter
    if (searchQuery) {
        filteredActivities = filteredActivities.filter(activity =>
            activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Type filter
    if (selectedType !== 'all') {
        if (selectedType === 'web_added' || selectedType === 'web_completed') {
            filteredActivities = filteredActivities.filter(activity => activity.type === 'web');
        } else if (selectedType === 'space_created' || selectedType === 'space_updated') {
            filteredActivities = filteredActivities.filter(activity => activity.type === 'space');
        }
    }

    // Space filter
    if (selectedSpace !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.spaceId === selectedSpace);
    }

    // Date range filter
    if (dateRange !== 'all') {
        const now = new Date();
        const filterDate = new Date();

        switch (dateRange) {
            case 'today':
                filterDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                filterDate.setMonth(now.getMonth() - 3);
                break;
        }

        if (dateRange !== 'all') {
            filteredActivities = filteredActivities.filter(activity => activity.timestamp >= filterDate);
        }
    }

    // Sort by timestamp descending
    filteredActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Take only recent 50 items
    const recentActivities = filteredActivities.slice(0, 50);

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Activity</h2>
                <p className="text-muted-foreground">
                    Your recent activity across webs and spaces
                    {searchQuery && ` • Searching for "${searchQuery}"`}
                    {selectedType !== 'all' && ` • Filtered by type`}
                    {selectedSpace !== 'all' && ` • Filtered by space`}
                    {dateRange !== 'all' && ` • Filtered by ${dateRange === 'today' ? 'today' : dateRange === 'week' ? 'past week' : dateRange === 'month' ? 'past month' : 'past 3 months'}`}
                </p>
            </div>

            {/* Activity Feed */}
            {recentActivities.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-12 text-center">
                    <Clock size={48} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        {activities.length === 0 ? 'No activity yet' : 'No matching activity'}
                    </h3>
                    <p className="text-muted-foreground">
                        {activities.length === 0
                            ? 'Start by adding a web or creating a space to see your activity here.'
                            : 'Try adjusting your filters to see more results.'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {recentActivities.map((activity) => {
                        const Icon = activity.icon;

                        return (
                            <div
                                key={`${activity.type}-${activity.id}`}
                                className="border border-border bg-card rounded-lg p-4 hover:border-foreground/20 transition-colors"
                            >
                                {activity.href ? (
                                    <Link href={activity.href} className="block group">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-lg flex items-center justify-center border",
                                                activity.type === 'web' && "bg-green-500/10 text-green-600 border-green-500/20",
                                                activity.type === 'space' && "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                            )}>
                                                <Icon size={20} weight="duotone" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium truncate group-hover:text-foreground/80 transition-colors">
                                                        {activity.title}
                                                    </h3>
                                                    {activity.status && (
                                                        <span className={cn(
                                                            "text-xs px-2 py-0.5 rounded-md font-mono",
                                                            activity.status === 'COMPLETE' && "bg-green-500/10 text-green-600",
                                                            activity.status === 'PROCESSING' && "bg-blue-500/10 text-blue-600",
                                                            activity.status === 'PENDING' && "bg-yellow-500/10 text-yellow-600",
                                                            activity.status === 'FAILED' && "bg-red-500/10 text-red-600"
                                                        )}>
                                                            {activity.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {activity.subtitle}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} weight="duotone" />
                                                    {formatDate(activity.timestamp)}
                                                </div>
                                                <ArrowRight size={12} weight="duotone" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center border",
                                            activity.type === 'web' && "bg-green-500/10 text-green-600 border-green-500/20",
                                            activity.type === 'space' && "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                        )}>
                                            <Icon size={20} weight="duotone" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate">{activity.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.subtitle}
                                            </p>
                                        </div>

                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar size={12} weight="duotone" />
                                            {formatDate(activity.timestamp)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
} 