import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';
import { extractDomain, formatRelativeTime } from '@/lib/dashboard-utils';
import type { Web } from '@/types/dashboard';

interface WebCardProps {
    web: Web;
    variant?: 'grid' | 'list';
}

export function WebCard({ web, variant = 'grid' }: WebCardProps) {
    const domain = extractDomain(web.url);
    const relativeTime = formatRelativeTime(new Date(web.createdAt));

    if (variant === 'list') {
        return (
            <Link
                href={`/w/${web.id}`}
                className="group block"
            >
                <div className="border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200 p-4 rounded-lg">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                                {domain}
                            </span>
                            <span className={cn(
                                "text-xs px-2 py-1 font-mono transition-all duration-200 rounded-md",
                                web.status === 'COMPLETE' && "text-green-600 bg-green-600/10 border border-green-600/20",
                                web.status === 'PENDING' && "text-yellow-600 bg-yellow-600/10 border border-yellow-600/20",
                                web.status === 'PROCESSING' && "text-blue-600 bg-blue-600/10 border border-blue-600/20 animate-pulse",
                                web.status === 'FAILED' && "text-red-600 bg-red-600/10 border border-red-600/20"
                            )}>
                                {web.status}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium group-hover:text-foreground/80 transition-all duration-200 line-clamp-2">
                            {web.title || web.url}
                        </h3>
                        {web.prompt && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                "{web.prompt}"
                            </p>
                        )}
                        <div className="text-xs text-muted-foreground font-mono">
                            {relativeTime}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/w/${web.id}`}
            className="group block h-full"
        >
            <div className="border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 h-full min-h-[160px] flex flex-col rounded-lg">
                <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                            {domain}
                        </span>
                        <span className={cn(
                            "text-xs px-2 py-1 font-mono transition-all duration-200 rounded-md shrink-0",
                            web.status === 'COMPLETE' && "text-green-600 bg-green-600/10 border border-green-600/20",
                            web.status === 'PENDING' && "text-yellow-600 bg-yellow-600/10 border border-yellow-600/20",
                            web.status === 'PROCESSING' && "text-blue-600 bg-blue-600/10 border border-blue-600/20 animate-pulse",
                            web.status === 'FAILED' && "text-red-600 bg-red-600/10 border border-red-600/20"
                        )}>
                            {web.status}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-foreground/80 transition-all duration-200 leading-snug">
                        {web.title || web.url}
                    </h3>
                    {web.prompt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            "{web.prompt}"
                        </p>
                    )}
                    <div className="pt-2 text-xs text-muted-foreground font-mono mt-auto">
                        {relativeTime}
                    </div>
                </div>
            </div>
        </Link>
    );
} 