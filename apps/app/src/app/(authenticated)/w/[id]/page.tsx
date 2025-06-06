'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'next-view-transitions';
import { useWeb } from '@/hooks/web/queries';
import { useUpdateWebEmoji } from '@/hooks/web/mutations';
import { EmojiPickerButton } from '@/components/shared/emoji-picker-button';
import { cn } from '@repo/design/lib/utils';
import { Brain, Clock, ChartLine, Hash, Sparkle, LinkIcon, Globe, CaretDown, CaretUp, DotsThree } from '@phosphor-icons/react/dist/ssr';
import { useSetAtom } from 'jotai';
import { startLoadingAtom, stopLoadingAtom } from '@/atoms/loading';
import { toast } from '@repo/design/components/ui/sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/design/components/ui/dropdown-menu';

interface WebDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

const LOADING_ID = 'web-detail';

// Helper to extract domain from URL
function extractDomain(url: string): string {
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
    } catch {
        return url;
    }
}

// Helper to format date
function formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function WebDetailPage({ params }: WebDetailPageProps) {
    const [id, setId] = useState<string | null>(null);
    const { web, isLoading, isError } = useWeb(id);
    const startLoading = useSetAtom(startLoadingAtom);
    const stopLoading = useSetAtom(stopLoadingAtom);
    const { updateEmoji } = useUpdateWebEmoji();
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        params.then(({ id }) => setId(id));
    }, [params]);

    // Update document title dynamically based on web data
    useEffect(() => {
        if (web?.title) {
            document.title = `${web.title} | webs`;
        } else if (id) {
            document.title = `Web ${id} | webs`;
        }
    }, [web?.title, id]);

    // Manage loading state with atoms
    useEffect(() => {
        if (isLoading) {
            startLoading(LOADING_ID);
        } else {
            stopLoading(LOADING_ID);
        }
    }, [isLoading, startLoading, stopLoading]);

    const handleEmojiSelect = async (emoji: string) => {
        if (!web) return;
        try {
            await updateEmoji(web.id, emoji);
            toast.success('Emoji updated!');
        } catch (error) {
            toast.error('Failed to update emoji');
        }
    };

    // Show loading while we're waiting for the ID to be resolved
    if (!id) {
        return <div />;
    }

    if (isError || !web) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <pre className="inline-block text-xs text-muted-foreground mb-4">
                        {`╔═══════════════════════╗
║                       ║
║    ⚠ WEB NOT FOUND   ║
║                       ║
╚═══════════════════════╝`}
                    </pre>
                    <p className="text-sm text-muted-foreground mb-4">
                        The requested web could not be found.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs bg-accent hover:bg-accent/80 transition-colors rounded-md"
                    >
                        ← Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Use actual data from web object or defaults
    const confidence = web.confidence || 0;
    const readingTime = web.readingTime || 0;
    const sentiment = web.sentiment || 'neutral';
    const topics = web.topics || [];
    const urls = web.urls || [web.url];
    const hasAnalysisData = web.analysis && Object.keys(web.analysis).length > 0;

    return (
        <>
            {/* Web status bar */}
            <div className="border-b border-border bg-card/50">
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-3xl px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {hasAnalysisData && confidence > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Brain size={14} weight="duotone" className="text-green-600" />
                                        <span className="text-xs text-green-600 font-mono">
                                            CONFIDENCE: {Math.round(confidence * 100)}%
                                        </span>
                                    </div>
                                )}
                                {urls.length > 1 && (
                                    <div className="flex items-center gap-2">
                                        <Globe size={14} weight="duotone" className="text-blue-600" />
                                        <span className="text-xs text-blue-600 font-mono">
                                            {urls.length} URLS ANALYZED
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={cn(
                                    "text-xs px-2 py-1 border rounded-md font-mono",
                                    web.status === 'COMPLETE' && "text-green-600 border-green-600/30 bg-green-600/10",
                                    web.status === 'PENDING' && "text-yellow-600 border-yellow-600/30 bg-yellow-600/10",
                                    web.status === 'PROCESSING' && "text-blue-600 border-blue-600/30 bg-blue-600/10",
                                    web.status === 'FAILED' && "text-red-600 border-red-600/30 bg-red-600/10"
                                )}>
                                    {web.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(web.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content - Overview */}
            <div className="flex-1 py-8">
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-3xl px-6">
                        {/* Web header */}
                        <div className="mb-8">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-start gap-3 mb-3 relative">
                                        {/* Emoji */}
                                        <div className="shrink-0">
                                            {web.emoji ? (
                                                <EmojiPickerButton
                                                    emoji={web.emoji}
                                                    onEmojiSelect={handleEmojiSelect}
                                                    className="h-8 w-8 text-lg"
                                                />
                                            ) : (web.status === 'PROCESSING' || web.status === 'PENDING') ? (
                                                <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
                                            ) : (
                                                <EmojiPickerButton
                                                    emoji={null}
                                                    onEmojiSelect={handleEmojiSelect}
                                                    className="h-8 w-8 text-lg opacity-50"
                                                />
                                            )}
                                        </div>

                                        {/* Title */}
                                        <div className="flex-1 min-w-0">
                                            {web.title ? (
                                                <h1 className="text-2xl font-semibold">
                                                    {web.title}
                                                </h1>
                                            ) : (web.status === 'PROCESSING' || web.status === 'PENDING') ? (
                                                <div className="space-y-3">
                                                    <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                                                    <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
                                                </div>
                                            ) : (
                                                <h1 className="text-2xl font-semibold text-muted-foreground">
                                                    {`Analysis of ${urls.length} web page${urls.length > 1 ? 's' : ''}`}
                                                </h1>
                                            )}
                                        </div>

                                        {/* Action Menu */}
                                        <div className="shrink-0">
                                            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                                                        <DotsThree size={16} weight="duotone" className="text-muted-foreground" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        Share
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Export
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    {urls.length === 1 ? (
                                        <a
                                            href={web.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors break-all"
                                        >
                                            <LinkIcon size={14} weight="duotone" />
                                            {web.url}
                                        </a>
                                    ) : (
                                        <div className="space-y-1">
                                            {urls.slice(0, 3).map((url, index) => (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                                                >
                                                    <LinkIcon size={14} weight="duotone" className="inline mr-2" />
                                                    {url}
                                                </a>
                                            ))}
                                            {urls.length > 3 && (
                                                <span className="text-xs text-muted-foreground">
                                                    ... and {urls.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Content Insights Bar */}
                                {hasAnalysisData && (
                                    <div className="flex items-center gap-6 p-4 border border-border bg-card rounded-lg text-xs font-mono">
                                        {readingTime > 0 && (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} weight="duotone" />
                                                    <span>{Math.round(readingTime)} MIN READ</span>
                                                </div>
                                                <span className="text-muted-foreground">|</span>
                                            </>
                                        )}
                                        {sentiment && (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <ChartLine size={12} weight="duotone" />
                                                    <span className={cn(
                                                        "uppercase",
                                                        sentiment === 'positive' && "text-green-600",
                                                        sentiment === 'neutral' && "text-yellow-600",
                                                        sentiment === 'negative' && "text-red-600"
                                                    )}>
                                                        {sentiment} SENTIMENT
                                                    </span>
                                                </div>
                                                <span className="text-muted-foreground">|</span>
                                            </>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Hash size={12} weight="duotone" />
                                            <span>{topics.length} KEY TOPICS</span>
                                        </div>
                                    </div>
                                )}

                                {web.prompt && (
                                    <div className="border border-border bg-card p-4 rounded-lg">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                            USER PROMPT
                                        </div>
                                        <p className="text-sm">"{web.prompt}"</p>
                                    </div>
                                )}

                                {/* Overview Metadata - moved above summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                                            METADATA
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">Domain:</span>
                                                <span className="font-mono">{web.domain || extractDomain(web.url)}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">Space:</span>
                                                <span className="font-mono">
                                                    {web.spaceId ? (
                                                        <span className="flex items-center gap-1">
                                                            📁 Space
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">Unassigned</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">Status:</span>
                                                <span className="font-mono">{web.status}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">URLs:</span>
                                                <span className="font-mono">{urls.length}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">Created:</span>
                                                <span className="font-mono text-xs">{formatDate(web.createdAt)}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-muted-foreground">Updated:</span>
                                                <span className="font-mono text-xs">{formatDate(web.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                                            ANALYSIS
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">Topics:</span>
                                                <span className="font-mono">{topics.length}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">Entities:</span>
                                                <span className="font-mono">{web.entities?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-border">
                                                <span className="text-muted-foreground">Insights:</span>
                                                <span className="font-mono">{web.insights?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-muted-foreground">Related URLs:</span>
                                                <span className="font-mono">{web.relatedUrls?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Summary Section */}
                                {web.description && (
                                    <div className="border border-border bg-card rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                            className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Sparkle size={12} weight="duotone" />
                                                SUMMARY
                                            </div>
                                            <AnimatePresence mode="wait" initial={false}>
                                                {isSummaryExpanded ? (
                                                    <motion.div
                                                        key="up"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        <CaretUp size={12} weight="duotone" className="text-muted-foreground" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                            key="down"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.15 }}
                                                        >
                                                            <CaretDown size={12} weight="duotone" className="text-muted-foreground" />
                                                        </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                        <AnimatePresence>
                                            {isSummaryExpanded && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 border-t border-border/50">
                                                        <p className="text-sm leading-relaxed mt-3">{web.description}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Collapsible Analysis Section */}
                                {web.analysis?.fullDescription && (
                                    <div className="border border-border bg-card rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                                            className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Brain size={12} weight="duotone" />
                                                ANALYSIS
                                            </div>
                                            <AnimatePresence mode="wait" initial={false}>
                                                {isAnalysisExpanded ? (
                                                    <motion.div
                                                        key="up"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        <CaretUp size={12} weight="duotone" className="text-muted-foreground" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="down"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        <CaretDown size={12} weight="duotone" className="text-muted-foreground" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                        <AnimatePresence>
                                            {isAnalysisExpanded && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 border-t border-border/50">
                                                        <div className="prose prose-sm dark:prose-invert max-w-none mt-3">
                                                            {web.analysis.fullDescription.split('\n\n').map((paragraph: string, index: number) => (
                                                                <p key={index} className="text-sm leading-relaxed mb-4 last:mb-0">
                                                                    {paragraph}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 