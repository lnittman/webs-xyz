'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useWeb } from '@/hooks/code/web/queries';
import { cn } from '@repo/design/lib/utils';

interface WebDetailPageProps {
    params: {
        id: string;
    };
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
    const router = useRouter();
    const { web, isLoading, isError } = useWeb(params.id);
    const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'raw'>('overview');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background antialiased font-mono flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-2">LOADING WEB...</div>
                    <div className="w-8 h-1 bg-border">
                        <div className="h-full bg-foreground animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !web) {
        return (
            <div className="min-h-screen bg-background antialiased font-mono flex items-center justify-center">
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
        );
    }

    return (
        <div className="min-h-screen bg-background antialiased font-mono">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="h-14 px-6 flex items-center justify-between">
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
            </header>

            {/* Main content */}
            <main className="pt-14 min-h-screen">
                <div className="max-w-6xl mx-auto px-6 py-8">
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
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
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

                {/* Footer status bar */}
                <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
                    <div className="h-8 px-6 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span>[WEB: {web.id.slice(0, 8)}...]</span>
                            <span>[STATUS: {web.status}]</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>WEBS v1.0.0</span>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Terminal scanline effect */}
            <div className="terminal-scanlines" aria-hidden="true" />
        </div>
    );
} 