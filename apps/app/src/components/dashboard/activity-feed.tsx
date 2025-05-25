import { motion } from 'framer-motion';
import { cn } from '@repo/design/lib/utils';
import { Pulse } from '@phosphor-icons/react/dist/ssr';
import { formatRelativeTime } from '@/lib/dashboard-utils';
import type { ProcessingActivity } from '@/types/dashboard';

interface ActivityFeedProps {
    activities: ProcessingActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="border border-border bg-card p-4 rounded-lg">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Pulse size={12} weight="duotone" />
                PROCESSING ACTIVITY
            </h3>
            <div className="space-y-3">
                {activities.length > 0 ? (
                    activities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3 p-2 rounded transition-all duration-200"
                            >
                                <div className={cn(
                                    "mt-0.5",
                                    activity.type === 'processing' && "text-blue-600",
                                    activity.type === 'completed' && "text-green-600",
                                    activity.type === 'queued' && "text-yellow-600"
                                )}>
                                    {Icon && <Icon size={14} weight="duotone" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-mono text-muted-foreground">
                                        {activity.action}
                                    </div>
                                    <div className="text-xs text-foreground truncate">
                                        {activity.target}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono mt-1">
                                        {formatRelativeTime(activity.timestamp)}
                                    </div>
                                </div>
                                {activity.type === 'processing' && (
                                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" />
                                )}
                            </motion.div>
                        );
                    })
                ) : (
                    <p className="text-xs text-muted-foreground">No recent activity</p>
                )}
            </div>
        </div>
    );
} 