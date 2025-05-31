import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';
import { extractDomain, formatRelativeTime } from '@/lib/dashboard-utils';
import type { Web } from '@/types/dashboard';
import { ScrollFadeContainer } from '@/components/shared/scroll-fade-container';
import { EmojiPickerButton } from '@/components/shared/emoji-picker-button';
import { useUpdateWebEmoji } from '@/hooks/code/web/mutations';
import { useState } from 'react';
import { WebActionMenu } from './web-action-menu';
import { toast } from '@repo/design/components/ui/sonner';

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
    const { updateEmoji } = useUpdateWebEmoji();

    const handleEmojiSelect = async (emoji: string) => {
        try {
            await updateEmoji(web.id, emoji);
            toast.success('Emoji updated!');
        } catch (error) {
            toast.error('Failed to update emoji');
        }
    };

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

    // Emoji component with skeleton
    const EmojiDisplay = () => {
        if (web.emoji) {
            return (
                <div onClick={(e) => e.stopPropagation()}>
                    <EmojiPickerButton
                        emoji={web.emoji}
                        onEmojiSelect={handleEmojiSelect}
                        className="h-6 w-6 text-xs"
                    />
                </div>
            );
        }

        // Show skeleton for loading emoji
        if (web.status === 'PROCESSING' || web.status === 'PENDING') {
            return (
                <div className="h-6 w-6 bg-muted animate-pulse rounded-md" />
            );
        }

        // Show emoji picker for completed analysis without emoji
        return (
            <div onClick={(e) => e.stopPropagation()}>
                <EmojiPickerButton
                    emoji={null}
                    onEmojiSelect={handleEmojiSelect}
                    className="h-6 w-6 text-xs opacity-50"
                />
            </div>
        );
    };

    // Title component with skeleton
    const TitleDisplay = ({ className, style }: { className?: string; style?: React.CSSProperties }) => {
        if (web.title) {
            return (
                <h3 className={cn("text-sm font-medium group-hover:text-foreground/80 transition-all duration-200", className)} style={style}>
                    {web.title}
                </h3>
            );
        }

        // Show skeleton for loading title
        if (web.status === 'PROCESSING' || web.status === 'PENDING') {
            return (
                <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
            );
        }

        // Fallback to URL for failed or completed without title
        return (
            <h3 className={cn("text-sm font-medium group-hover:text-foreground/80 transition-all duration-200 text-muted-foreground", className)} style={style}>
                {web.url}
            </h3>
        );
    };

    if (variant === 'list') {
        return (
            <div className="group relative">
                <div className="border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200 p-4 rounded-lg">
                    <div className="flex flex-col h-full min-h-[120px]">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                                    {domain}
                                </span>
                                <EmojiDisplay />
                            </div>
                        </div>

                        <Link href={`/w/${web.id}`} className="block flex-1 flex flex-col">
                            <div className="flex-1">
                                <ScrollFadeContainer showRight fadeSize={24} className="w-full">
                                    <TitleDisplay className="pr-10" />
                                </ScrollFadeContainer>

                                {web.prompt && (
                                    <ScrollFadeContainer showRight fadeSize={24} className="w-full mt-2">
                                        <p className="text-xs text-muted-foreground leading-relaxed pr-10">
                                            "{web.prompt}"
                                        </p>
                                    </ScrollFadeContainer>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50">
                                <span className="text-xs text-muted-foreground font-mono">
                                    {relativeTime}
                                </span>
                                <StatusBadge />
                            </div>
                        </Link>
                    </div>
                </div>
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
        <div className="group relative">
            <div className="border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 h-[180px] flex flex-col rounded-lg">
                <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                                {domain}
                            </span>
                            <EmojiDisplay />
                        </div>
                    </div>

                    <Link href={`/w/${web.id}`} className="block flex-1 flex flex-col min-h-0">
                        <div className="flex-1 min-h-0 space-y-2">
                            <ScrollFadeContainer showRight fadeSize={24} className="w-full">
                                <TitleDisplay className="leading-snug pr-10 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} />
                            </ScrollFadeContainer>

                            {web.prompt && (
                                <ScrollFadeContainer showRight fadeSize={24} className="w-full">
                                    <p className="text-xs text-muted-foreground leading-relaxed pr-10 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                        "{web.prompt}"
                                    </p>
                                </ScrollFadeContainer>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50">
                            <span className="text-xs text-muted-foreground font-mono">
                                {relativeTime}
                            </span>
                            <StatusBadge />
                        </div>
                    </Link>
                </div>
            </div>
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