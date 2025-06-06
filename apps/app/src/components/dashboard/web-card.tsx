import { useState, useEffect, useRef } from 'react';

import { Link } from 'next-view-transitions';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@repo/design/lib/utils';
import { toast } from '@repo/design/components/ui/sonner';

import { ScrollFadeContainer } from '@/components/shared/layout/scroll-fade-container';
import { EmojiPickerButton } from '@/components/shared/emoji-picker-button';
import { useUpdateWebEmoji } from '@/hooks/web/mutations';
import { useWebStream } from '@/hooks/web/use-web-stream';
import { extractDomain, formatRelativeTime } from '@/lib/dashboard-utils';
import { useStreamText } from '@/lib/stream-utils';
import type { Web } from '@/types/dashboard';

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
    const { updateEmoji } = useUpdateWebEmoji();
    const [hasShownTitle, setHasShownTitle] = useState(false);
    const [hasShownEmoji, setHasShownEmoji] = useState(false);

    // Stream quick metadata for PROCESSING webs
    const { webUpdate } = useWebStream(
        web.status === 'PROCESSING' ? web.id : null
    );

    // Use smooth streaming for title
    const streamedTitle = useStreamText(webUpdate?.title, {
        delayMs: 20,
        chunkSize: 1
    });

    // Use streamed data if available, otherwise fall back to web data
    const displayTitle = streamedTitle || web.title;
    const displayEmoji = webUpdate?.emoji || web.emoji;

    // Track when we first get a title to control animations
    useEffect(() => {
        if (displayTitle && !hasShownTitle) {
            setHasShownTitle(true);
        }
    }, [displayTitle, hasShownTitle]);

    // Track when we first get an emoji to control animations
    useEffect(() => {
        if (displayEmoji && !hasShownEmoji) {
            setHasShownEmoji(true);
        }
    }, [displayEmoji, hasShownEmoji]);

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
        const showSkeleton = !displayEmoji && (web.status === 'PROCESSING' || web.status === 'PENDING');

        if (showSkeleton) {
            return (
                <div className="h-6 w-6 bg-muted animate-pulse rounded-md" />
            );
        }

        // Only animate the first time we show content, then just update without animation
        if (hasShownEmoji) {
            return (
                <div onClick={(e) => e.stopPropagation()}>
                    <EmojiPickerButton
                        emoji={displayEmoji}
                        onEmojiSelect={handleEmojiSelect}
                        className="h-6 w-6 text-xs"
                    />
                </div>
            );
        }

        // First-time animation from skeleton to content
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                <EmojiPickerButton
                    emoji={displayEmoji}
                    onEmojiSelect={handleEmojiSelect}
                    className="h-6 w-6 text-xs"
                />
            </motion.div>
        );
    };

    // Title component with skeleton and streaming
    const TitleDisplay = ({ className, style }: { className?: string; style?: React.CSSProperties }) => {
        const showSkeleton = !displayTitle && (web.status === 'PROCESSING' || web.status === 'PENDING');
        const isStreaming = web.status === 'PROCESSING' && streamedTitle && streamedTitle !== webUpdate?.title;

        if (showSkeleton) {
            return (
                <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
            );
        }

        // Only animate the first time we show content, then just update without animation
        if (hasShownTitle) {
            return (
                <h3 className={cn("text-sm font-medium group-hover:text-foreground/80 transition-all duration-200", className)} style={style}>
                    {displayTitle || web.url}
                    {isStreaming && (
                        <span className="inline-block w-0.5 h-4 bg-foreground/50 streaming-cursor ml-0.5" />
                    )}
                </h3>
            );
        }

        // First-time animation from skeleton to content
        return (
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={cn("text-sm font-medium group-hover:text-foreground/80 transition-all duration-200", className)}
                style={style}
            >
                {displayTitle || web.url}
                {isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-foreground/50 streaming-cursor ml-0.5" />
                )}
            </motion.h3>
        );
    };

    if (variant === 'list') {
        return (
            <div className="group relative">
                <div className="border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200 p-4 rounded-lg">
                    <div className="flex flex-col h-full min-h-[120px]">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <EmojiDisplay />
                                <div className="relative flex-1 min-w-0 pr-8">
                                    <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider truncate block">
                                        {domain}
                                    </span>
                                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
                                </div>
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
                            <EmojiDisplay />
                            <div className="relative flex-1 min-w-0 pr-8">
                                <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider truncate block">
                                    {domain}
                                </span>
                                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
                            </div>
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