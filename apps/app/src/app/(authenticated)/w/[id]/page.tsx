'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'next-view-transitions';
import { useWeb } from '@/hooks/code/web/queries';
import { ClientLayout } from '@/components/shared/client-layout';
import { cn } from '@repo/design/lib/utils';
import { Brain, Tag, Sparkle, Clock, ChartLine, Hash, Quotes, Link as LinkIcon } from '@phosphor-icons/react/dist/ssr';

interface WebDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

interface AIInsights {
    readingTime: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    keyTopics: string[];
    entities: { type: string; value: string }[];
    summary: string;
    confidence: number;
}

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
    const { web, isLoading, isError } = useWeb(id || '');
    const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'raw' | 'insights'>('overview');

    useEffect(() => {
        params.then(({ id }) => setId(id));
    }, [params]);

    // Mock AI insights (in real app, this would come from the backend)
    const aiInsights: AIInsights = {
        readingTime: 5,
        sentiment: 'neutral',
        keyTopics: ['Next.js', 'React', 'Web Development', 'TypeScript'],
        entities: [
            { type: 'ORGANIZATION', value: 'Vercel' },
            { type: 'TECHNOLOGY', value: 'Next.js 15' },
            { type: 'PERSON', value: 'Lee Robinson' }
        ],
        summary: 'Technical documentation covering Next.js 15 features including App Router, Server Components, and performance optimizations.',
        confidence: 0.92
    };

    if (isLoading) {
        return (
            <ClientLayout>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-2">LOADING WEB...</div>
                        <div className="w-8 h-1 bg-border">
                            <div className="h-full bg-foreground animate-pulse" />
                        </div>
                    </div>
                </div>
            </ClientLayout>
        );
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
                            className="text-xs text-foreground hover:text-muted-foreground transition-colors"
                        >
                            [RETURN TO DASHBOARD]
                        </Link>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout
            workspaceId="default"
            webCount={1}
        >
            {/* Page-specific header info */}
            <div className="border-b border-border bg-card/50">
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-3xl px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    ← WEBS
                                </Link>
                                <span className="text-xs text-muted-foreground">/</span>
                                <span className="text-xs text-muted-foreground uppercase">
                                    {extractDomain(web.url)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Brain size={14} weight="duotone" className="text-green-600" />
                                    <span className="text-xs text-green-600 font-mono">
                                        AI CONFIDENCE: {Math.round(aiInsights.confidence * 100)}%
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-xs px-2 py-1 border border-border",
                                    web.status === 'COMPLETE' && "text-green-600 border-green-600/30",
                                    web.status === 'PENDING' && "text-yellow-600 border-yellow-600/30",
                                    web.status === 'PROCESSING' && "text-blue-600 border-blue-600/30",
                                    web.status === 'FAILED' && "text-red-600 border-red-600/30"
                                )}>
                                    [{web.status}]
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
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-lg font-medium mb-2">
                                        {web.title || web.url}
                                    </h1>
                                    <a
                                        href={web.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors break-all"
                                    >
                                        {web.url} ↗
                                    </a>
                                </div>

                                {/* AI Quick Insights Bar */}
                                <div className="flex items-center gap-4 p-3 border border-border bg-card/50 text-xs font-mono">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} weight="duotone" />
                                        <span>{aiInsights.readingTime} MIN READ</span>
                                    </div>
                                    <span className="text-muted-foreground">|</span>
                                    <div className="flex items-center gap-2">
                                        <ChartLine size={12} weight="duotone" />
                                        <span className={cn(
                                            "uppercase",
                                            aiInsights.sentiment === 'positive' && "text-green-600",
                                            aiInsights.sentiment === 'neutral' && "text-yellow-600",
                                            aiInsights.sentiment === 'negative' && "text-red-600"
                                        )}>
                                            {aiInsights.sentiment} SENTIMENT
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground">|</span>
                                    <div className="flex items-center gap-2">
                                        <Hash size={12} weight="duotone" />
                                        <span>{aiInsights.keyTopics.length} KEY TOPICS</span>
                                    </div>
                                </div>

                                {web.prompt && (
                                    <div className="border border-border bg-card p-4">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                            USER PROMPT
                                        </div>
                                        <p className="text-sm">"{web.prompt}"</p>
                                    </div>
                                )}

                                {web.description && (
                                    <div className="border border-border bg-card p-4">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Sparkle size={12} weight="duotone" />
                                            AI SUMMARY
                                        </div>
                                        <p className="text-sm leading-relaxed">{web.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-2 border-border bg-card">
                            {/* Tab navigation */}
                            <div className="flex border-b-2 border-border">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={cn(
                                        "px-4 py-2 text-xs uppercase tracking-wider transition-all",
                                        activeTab === 'overview'
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:bg-accent"
                                    )}
                                >
                                    OVERVIEW
                                </button>
                                <button
                                    onClick={() => setActiveTab('insights')}
                                    className={cn(
                                        "px-4 py-2 text-xs uppercase tracking-wider transition-all flex items-center gap-2",
                                        activeTab === 'insights'
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:bg-accent"
                                    )}
                                >
                                    <Brain size={12} weight="duotone" />
                                    AI INSIGHTS
                                </button>
                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className={cn(
                                        "px-4 py-2 text-xs uppercase tracking-wider transition-all",
                                        activeTab === 'messages'
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:bg-accent"
                                    )}
                                >
                                    MESSAGES [{web.messages?.length || 0}]
                                </button>
                                <button
                                    onClick={() => setActiveTab('raw')}
                                    className={cn(
                                        "px-4 py-2 text-xs uppercase tracking-wider transition-all",
                                        activeTab === 'raw'
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:bg-accent"
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
                                                <div>
                                                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                                        METADATA
                                                    </h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Domain:</span>
                                                            <span>{web.domain || extractDomain(web.url)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Status:</span>
                                                            <span>{web.status}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Created:</span>
                                                            <span>{formatDate(web.createdAt)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Updated:</span>
                                                            <span>{formatDate(web.updatedAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                                        PROCESSING
                                                    </h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Messages:</span>
                                                            <span>{web.messages?.length || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Has Prompt:</span>
                                                            <span>{web.prompt ? 'Yes' : 'No'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Has Summary:</span>
                                                            <span>{web.description ? 'Yes' : 'No'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'insights' && (
                                        <div className="space-y-6">
                                            {/* Key Topics */}
                                            <div>
                                                <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Tag size={12} weight="duotone" />
                                                    KEY TOPICS
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {aiInsights.keyTopics.map((topic, index) => (
                                                        <motion.span
                                                            key={topic}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="px-3 py-1 border border-border bg-accent text-xs font-mono hover:bg-accent/80 transition-all cursor-pointer"
                                                        >
                                                            {topic}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Extracted Entities */}
                                            <div>
                                                <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <LinkIcon size={12} weight="duotone" />
                                                    EXTRACTED ENTITIES
                                                </h3>
                                                <div className="space-y-2">
                                                    {aiInsights.entities.map((entity, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="flex items-center justify-between p-2 border border-border bg-background"
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

                                            {/* AI Analysis Summary */}
                                            <div>
                                                <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Quotes size={12} weight="duotone" />
                                                    AI ANALYSIS
                                                </h3>
                                                <div className="p-4 border border-border bg-accent/50">
                                                    <p className="text-sm leading-relaxed italic">
                                                        "{aiInsights.summary}"
                                                    </p>
                                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>Generated by AI Agent</span>
                                                        <span>Confidence: {Math.round(aiInsights.confidence * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'messages' && (
                                        <div className="space-y-4">
                                            {web.messages && web.messages.length > 0 ? (
                                                web.messages.map((message) => (
                                                    <div key={message.id} className="border border-border bg-background p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-muted-foreground uppercase">
                                                                {message.type}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(message.createdAt)}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm whitespace-pre-wrap">
                                                            {message.content}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-xs text-muted-foreground">
                                                        No messages yet.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'raw' && (
                                        <div className="bg-background border border-border p-4">
                                            <pre className="text-xs text-muted-foreground overflow-auto">
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