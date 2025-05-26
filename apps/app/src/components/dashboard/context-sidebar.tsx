import { useMemo } from 'react';
import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';
import { extractDomain, formatRelativeTime } from '@/lib/dashboard-utils';
import type { ProcessingActivity, Web } from '@/types/dashboard';

interface ContextSidebarProps {
    activities: ProcessingActivity[];
    recentWebs: Web[];
    topDomains: Array<[string, number]>;
    selectedModelId: string;
}

interface RecentItem {
    id: string;
    type: 'web' | 'activity';
    timestamp: Date;
    title: string;
    subtitle: string;
    status?: 'COMPLETE' | 'PENDING' | 'PROCESSING' | 'FAILED';
    href?: string;
}

export function ContextSidebar({
    activities,
    recentWebs,
    topDomains,
    selectedModelId
}: ContextSidebarProps) {
    // Combine and sort all recent items chronologically
    const recentItems = useMemo(() => {
        const items: RecentItem[] = [];

        // Add recent webs
        recentWebs.forEach(web => {
            items.push({
                id: web.id,
                type: 'web',
                timestamp: new Date(web.createdAt),
                title: web.title || extractDomain(web.url),
                subtitle: extractDomain(web.url),
                status: web.status,
                href: `/w/${web.id}`
            });
        });

        // Add activities
        activities.forEach(activity => {
            items.push({
                id: activity.id,
                type: 'activity',
                timestamp: activity.timestamp,
                title: activity.target,
                subtitle: activity.action
            });
        });

        // Sort by timestamp (newest first)
        return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
    }, [activities, recentWebs]);

    return (
        <div className="col-span-4">
            {/* Recent Activity */}
            <div className="border border-border bg-card rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-4">Recent</h3>
                <div className="space-y-1">
                    {recentItems.length > 0 ? (
                        recentItems.map((item) => {
                            if (item.href) {
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-md transition-colors hover:bg-accent/50 group"
                                    >
                                        {/* Status indicator */}
                                        <div className="flex-shrink-0">
                                            {item.type === 'web' && item.status && (
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    item.status === 'COMPLETE' && "bg-green-600",
                                                    item.status === 'PENDING' && "bg-yellow-600",
                                                    item.status === 'PROCESSING' && "bg-blue-600",
                                                    item.status === 'FAILED' && "bg-red-600"
                                                )} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-foreground truncate group-hover:text-foreground/80 leading-snug">
                                                {item.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                                                {item.subtitle}
                                            </div>
                                        </div>

                                        {/* Timestamp */}
                                        <div className="text-xs text-muted-foreground flex-shrink-0">
                                            {formatRelativeTime(item.timestamp)}
                                        </div>
                                    </Link>
                                );
                            }

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-md"
                                >
                                    {/* Status indicator */}
                                    <div className="flex-shrink-0">
                                        {item.type === 'web' && item.status && (
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                item.status === 'COMPLETE' && "bg-green-600",
                                                item.status === 'PENDING' && "bg-yellow-600",
                                                item.status === 'PROCESSING' && "bg-blue-600",
                                                item.status === 'FAILED' && "bg-red-600"
                                            )} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-foreground truncate leading-snug">
                                            {item.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                                            {item.subtitle}
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="text-xs text-muted-foreground flex-shrink-0">
                                        {formatRelativeTime(item.timestamp)}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-xs text-muted-foreground py-2">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
} 