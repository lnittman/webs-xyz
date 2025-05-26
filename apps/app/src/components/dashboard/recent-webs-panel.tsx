import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';
import { extractDomain, formatRelativeTime } from '@/lib/dashboard-utils';
import type { Web } from '@/types/dashboard';

interface RecentWebsPanelProps {
    webs: Web[];
}

export function RecentWebsPanel({ webs }: RecentWebsPanelProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider">
                Recent Webs
            </h3>
            <div className="space-y-2">
                {webs.length > 0 ? (
                    webs.map((web) => (
                        <Link
                            key={web.id}
                            href={`/w/${web.id}`}
                            className="block group"
                        >
                            <div className="flex items-center gap-3 py-2 hover:bg-accent/50 transition-all duration-200 rounded -mx-2 px-2">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    web.status === 'COMPLETE' && "bg-green-600",
                                    web.status === 'PENDING' && "bg-yellow-600",
                                    web.status === 'PROCESSING' && "bg-blue-600",
                                    web.status === 'FAILED' && "bg-red-600"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-muted-foreground">
                                        {extractDomain(web.url)}
                                    </div>
                                    <div className="text-sm text-foreground truncate group-hover:text-foreground/80">
                                        {web.title || web.url}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatRelativeTime(new Date(web.createdAt))}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                        <p className="text-xs text-muted-foreground py-2">No recent activity</p>
                )}
            </div>
        </div>
    );
} 