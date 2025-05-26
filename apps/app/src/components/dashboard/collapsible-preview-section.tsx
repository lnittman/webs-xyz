'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react/dist/ssr';
import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';
import { extractDomain, formatRelativeTime } from '@/lib/dashboard-utils';
import type { ProcessingActivity, Web } from '@/types/dashboard';

interface CollapsiblePreviewSectionProps {
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
    icon?: React.ComponentType<any>;
}

export function CollapsiblePreviewSection({
    activities,
    recentWebs,
    topDomains,
    selectedModelId
}: CollapsiblePreviewSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

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
                subtitle: activity.action,
                icon: activity.icon
            });
        });

        // Sort by timestamp (newest first)
        return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    }, [activities, recentWebs]);

    if (recentItems.length === 0) {
        return null;
    }

    return (
        <div className="py-4">
            <div className="w-full flex justify-center">
                <div className="w-full max-w-3xl px-6">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 py-2 text-left group hover:bg-accent/50 rounded-md transition-colors px-2 -mx-2"
                    >
                        <CaretDown
                            size={16}
                            className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">Recent</span>
                            <span className="text-xs text-muted-foreground">
                                {recentItems.length}
                            </span>
                        </div>
                    </button>

                    <AnimatePresence initial={false}>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="pt-2 pb-6">
                                    <div className="border border-border bg-card rounded-lg p-4 space-y-1">
                                        {recentItems.map((item) => {
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
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
} 