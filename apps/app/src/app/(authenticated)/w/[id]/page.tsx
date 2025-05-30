'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'next-view-transitions';
import { useWeb } from '@/hooks/code/web/queries';
import { useUpdateWebEmoji } from '@/hooks/code/web/mutations';
import { ClientLayout } from '@/components/shared/client-layout';
import { EmojiPickerButton } from '@/components/shared/emoji-picker-button';
import { cn } from '@repo/design/lib/utils';
import { Brain, Tag, Sparkle, Clock, ChartLine, Hash, Quotes, Link as LinkIcon, Globe, Robot } from '@phosphor-icons/react/dist/ssr';
import { useSetAtom } from 'jotai';
import { startLoadingAtom, stopLoadingAtom } from '@/atoms/loading';
import { toast } from '@repo/design/components/ui/sonner';
import { WebChat } from '@/components/shared/web-chat';

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
    const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'raw' | 'insights' | 'chat'>('overview');
    const startLoading = useSetAtom(startLoadingAtom);
    const stopLoading = useSetAtom(stopLoadingAtom);
    const { updateEmoji } = useUpdateWebEmoji();

    useEffect(() => {
        params.then(({ id }) => setId(id));
    }, [params]);

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
        return <ClientLayout><div /></ClientLayout>;
    }

    if (isError || !web) {
        return (
            <ClientLayout>
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
            </ClientLayout>
        );
    }

    // Use actual data from web object or defaults
    const confidence = web.confidence || 0;
    const readingTime = web.readingTime || 0;
    const sentiment = web.sentiment || 'neutral';
    const topics = web.topics || [];
    const entities = web.entities || [];
    const insights = web.insights || [];
    const urls = web.urls || [web.url];
    const relatedUrls = web.relatedUrls || [];
    const hasAnalysisData = web.analysis && Object.keys(web.analysis).length > 0;

    return (
        <ClientLayout
            webTitle={web.title || extractDomain(web.url)}
            webId={web.id}
        >
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

            {/* Main content */}
            <div className="flex-1 py-8">
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-3xl px-6">
                        {/* Web header */}
                        <div className="mb-8">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="flex-1">
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

                                {web.description && (
                                    <div className="border border-border bg-card p-4 rounded-lg">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Sparkle size={12} weight="duotone" />
                                            SUMMARY
                                        </div>
                                        <p className="text-sm leading-relaxed">{web.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border border-border bg-card rounded-lg overflow-hidden">
                            {/* Tab navigation */}
                            <div className="flex border-b border-border bg-muted/50">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={cn(
                                        "px-4 py-3 text-xs uppercase tracking-wider transition-all font-medium",
                                        activeTab === 'overview'
                                            ? "bg-background text-foreground border-b-2 border-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    OVERVIEW
                                </button>
                                <button
                                    onClick={() => setActiveTab('insights')}
                                    className={cn(
                                        "px-4 py-3 text-xs uppercase tracking-wider transition-all flex items-center gap-2 font-medium",
                                        activeTab === 'insights'
                                            ? "bg-background text-foreground border-b-2 border-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    <Brain size={12} weight="duotone" />
                                    INSIGHTS
                                </button>
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={cn(
                                        "px-4 py-3 text-xs uppercase tracking-wider transition-all flex items-center gap-2 font-medium",
                                        activeTab === 'chat'
                                            ? "bg-background text-foreground border-b-2 border-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    <Robot size={12} weight="duotone" />
                                    CHAT
                                </button>
                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className={cn(
                                        "px-4 py-3 text-xs uppercase tracking-wider transition-all font-medium",
                                        activeTab === 'messages'
                                            ? "bg-background text-foreground border-b-2 border-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    MESSAGES [{web.messages?.length || 0}]
                                </button>
                                <button
                                    onClick={() => setActiveTab('raw')}
                                    className={cn(
                                        "px-4 py-3 text-xs uppercase tracking-wider transition-all font-medium",
                                        activeTab === 'raw'
                                            ? "bg-background text-foreground border-b-2 border-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    RAW DATA
                                </button>
                            </div>

                            {/* Tab content */}
                            <div className="p-6">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {activeTab === 'overview' && (
                                        <div className="space-y-6">
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
                                                            <span className="font-mono">{entities.length}</span>
                                                        </div>
                                                        <div className="flex justify-between py-2 border-b border-border">
                                                            <span className="text-muted-foreground">Insights:</span>
                                                            <span className="font-mono">{insights.length}</span>
                                                        </div>
                                                        <div className="flex justify-between py-2">
                                                            <span className="text-muted-foreground">Related URLs:</span>
                                                            <span className="font-mono">{relatedUrls.length}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'insights' && (
                                        <div className="space-y-8">
                                            {!hasAnalysisData && web.status === 'PROCESSING' ? (
                                                <div className="text-center py-12">
                                                    <p className="text-sm text-muted-foreground">
                                                        Analysis in progress...
                                                    </p>
                                                </div>
                                            ) : !hasAnalysisData && web.status === 'FAILED' ? (
                                                <div className="text-center py-12">
                                                    <p className="text-sm text-red-600">
                                                        Analysis failed. Please try again.
                                                    </p>
                                                </div>
                                            ) : hasAnalysisData ? (
                                                <>
                                                            {/* Key Topics */}
                                                            {topics.length > 0 && (
                                                                <div>
                                                                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                        <Tag size={12} weight="duotone" />
                                                                        KEY TOPICS
                                                                    </h3>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {topics.map((topic, index) => (
                                                                            <motion.span
                                                                                key={topic}
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                transition={{ delay: index * 0.05 }}
                                                                                className="px-3 py-1.5 border border-border bg-accent text-xs font-mono hover:bg-accent/80 transition-all cursor-pointer rounded-md"
                                                                            >
                                                                                {topic}
                                                                            </motion.span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Insights */}
                                                            {insights.length > 0 && (
                                                                <div>
                                                                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                        <Sparkle size={12} weight="duotone" />
                                                                        KEY INSIGHTS
                                                                    </h3>
                                                                    <div className="space-y-2">
                                                                        {insights.map((insight, index) => (
                                                                            <motion.div
                                                                                key={index}
                                                                                initial={{ opacity: 0, x: -10 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: index * 0.05 }}
                                                                                className="p-3 border border-border bg-background rounded-md"
                                                                            >
                                                                                <p className="text-sm">{insight}</p>
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Extracted Entities */}
                                                            {entities.length > 0 && (
                                                                <div>
                                                                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                        <LinkIcon size={12} weight="duotone" />
                                                                        EXTRACTED ENTITIES
                                                                    </h3>
                                                                    <div className="space-y-2">
                                                                        {entities.map((entity, index) => (
                                                                            <motion.div
                                                                                key={entity.id}
                                                                                initial={{ opacity: 0, x: -10 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: index * 0.05 }}
                                                                                className="flex items-center justify-between p-3 border border-border bg-background rounded-md"
                                                                            >
                                                                                <span className="text-xs text-muted-foreground font-mono uppercase">
                                                                                    {entity.type}
                                                                                </span>
                                                                                <span className="text-sm font-medium">
                                                                                    {entity.value}
                                                                                </span>
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Related URLs */}
                                                            {relatedUrls.length > 0 && (
                                                                <div>
                                                                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                        <Globe size={12} weight="duotone" />
                                                                        RELATED URLS
                                                                    </h3>
                                                                    <div className="space-y-2">
                                                                        {relatedUrls.map((url, index) => (
                                                                            <motion.a
                                                                                key={index}
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                initial={{ opacity: 0, x: -10 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: index * 0.05 }}
                                                                                className="block p-3 border border-border bg-background rounded-md hover:bg-accent transition-colors"
                                                                            >
                                                                                <span className="text-sm text-muted-foreground hover:text-foreground truncate">
                                                                                    {url}
                                                                                </span>
                                                                            </motion.a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <p className="text-sm text-muted-foreground">
                                                                No analysis data available.
                                                            </p>
                                                            </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'chat' && (
                                        <WebChat web={web} />
                                    )}

                                    {activeTab === 'messages' && (
                                        <div className="space-y-4">
                                            {web.messages && web.messages.length > 0 ? (
                                                web.messages.map((message) => (
                                                    <div key={message.id} className="border border-border bg-background p-4 rounded-lg">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-xs text-muted-foreground uppercase font-mono px-2 py-1 bg-muted rounded">
                                                                {message.type}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(message.createdAt)}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                                            {message.content}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                    <div className="text-center py-12">
                                                        <p className="text-sm text-muted-foreground">
                                                        No messages yet.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'raw' && (
                                        <div className="bg-background border border-border p-4 rounded-lg">
                                            <pre className="text-xs text-muted-foreground overflow-auto font-mono">
                                                {JSON.stringify(web, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
} 