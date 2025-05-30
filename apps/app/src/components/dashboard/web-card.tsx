import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';
import { extractDomain, formatRelativeTime } from '@/lib/dashboard-utils';
import type { Web } from '@/types/dashboard';
import { ScrollFadeContainer } from '@/components/shared/scroll-fade-container';
import { useState } from 'react';
import { WebActionMenu } from './web-action-menu';

interface WebCardProps {
    web: Web;
    variant?: 'grid' | 'list';
    onDelete?: (id: string) => void;
    onShare?: (id: string) => void;
    onFavorite?: (id: string) => void;
    onRename?: (id: string) => void;
}

export function WebCard({
    web,
    variant = 'grid',
    onDelete,
    onShare,
    onFavorite,
    onRename
}: WebCardProps) {
    const domain = extractDomain(web.url);
    const relativeTime = formatRelativeTime(new Date(web.createdAt));
    const [menuOpen, setMenuOpen] = useState(false);

    // Status badge component
    const StatusBadge = () => (
        <span className={cn(
            "text-xs px-2 py-1 font-mono transition-all duration-200 rounded-md shrink-0",
            web.status === 'COMPLETE' && "text-green-600 bg-green-600/10 border border-green-600/20",
            web.status === 'PENDING' && "text-yellow-600 bg-yellow-600/10 border border-yellow-600/20",
            web.status === 'PROCESSING' && "text-blue-600 bg-blue-600/10 border border-blue-600/20 animate-pulse",
            web.status === 'FAILED' && "text-red-600 bg-red-600/10 border border-red-600/20"
        )}>
            {web.status}
        </span>
    );

    if (variant === 'list') {
        return (
            <div className="group relative">
                <Link
                    href={`/w/${web.id}`}
                    className="block"
                >
                    <div className="border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200 p-4 rounded-lg">
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                                    {domain}
                                </span>
                            </div>

                            <ScrollFadeContainer showRight fadeSize={24} className="w-full">
                                <h3 className="text-sm font-medium group-hover:text-foreground/80 transition-all duration-200 pr-10">
                                    {web.title || web.url}
                                </h3>
                            </ScrollFadeContainer>

                            {web.prompt && (
                                <ScrollFadeContainer showRight fadeSize={24} className="w-full">
                                    <p className="text-xs text-muted-foreground leading-relaxed pr-10">
                                        "{web.prompt}"
                                    </p>
                                </ScrollFadeContainer>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs text-muted-foreground font-mono">
                                    {relativeTime}
                                </span>
                                <StatusBadge />
                            </div>
                        </div>
                    </div>
                </Link>
                <div className={cn(
                    "absolute top-0 right-0 p-3 transition-opacity duration-200",
                    menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <WebActionMenu
                        web={web}
                        onDelete={onDelete}
                        onShare={onShare}
                        onFavorite={onFavorite}
                        onRename={onRename}
                        isOpen={menuOpen}
                        onOpenChange={setMenuOpen}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="group relative h-full">
            <Link
                href={`/w/${web.id}`}
                className="block h-full"
            >
                <div className="border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 h-full min-h-[160px] flex flex-col rounded-lg">
                    <div className="flex flex-col space-y-3 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                                {domain}
                            </span>
                        </div>

                        <ScrollFadeContainer showRight fadeSize={24} className="w-full">
                            <h3 className="text-sm font-medium group-hover:text-foreground/80 transition-all duration-200 leading-snug pr-10">
                                {web.title || web.url}
                            </h3>
                        </ScrollFadeContainer>

                        {web.prompt && (
                            <ScrollFadeContainer showRight fadeSize={24} className="w-full">
                                <p className="text-xs text-muted-foreground leading-relaxed pr-10">
                                    "{web.prompt}"
                                </p>
                            </ScrollFadeContainer>
                        )}

                        <div className="flex items-center justify-between pt-2 mt-auto">
                            <span className="text-xs text-muted-foreground font-mono">
                                {relativeTime}
                            </span>
                            <StatusBadge />
                        </div>
                    </div>
                </div>
            </Link>
            <div className={cn(
                "absolute top-0 right-0 p-3 transition-opacity duration-200",
                menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
                <WebActionMenu
                    web={web}
                    onDelete={onDelete}
                    onShare={onShare}
                    onFavorite={onFavorite}
                    onRename={onRename}
                    isOpen={menuOpen}
                    onOpenChange={setMenuOpen}
                />
            </div>
        </div>
    );
} 