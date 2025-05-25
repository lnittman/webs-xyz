'use client';

import { useState } from 'react';
import { ArrowSquareOut, X, Eye, Globe, CaretDown, CaretUp } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'framer-motion';

interface DetectedUrl {
    url: string;
    id: string;
    isFromTabs?: boolean;
}

interface ContextBarProps {
    detectedUrls: DetectedUrl[];
    onRemoveUrl: (urlId: string) => void;
}

// Helper to get domain from URL
function getDomain(url: string): string {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

export function ContextBar({ detectedUrls, onRemoveUrl }: ContextBarProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="mt-2">
            <div className="border-border bg-card/30 p-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-2 py-1 -mx-2 -my-1 rounded-none transition-all duration-200 hover:bg-accent/50 active:bg-accent group"
                    >
                        <div className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                            <AnimatePresence mode="wait">
                                {isExpanded ? (
                                    <motion.div
                                        key="up"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <CaretUp size={12} weight="duotone" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="down"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <CaretDown size={12} weight="duotone" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <span className="text-muted-foreground uppercase group-hover:text-foreground transition-colors duration-200">CONTEXT</span>
                    </button>
                    <div className="flex items-center gap-2">
                        {detectedUrls.length > 0 && (
                            <>
                                <Eye size={12} weight="duotone" className="text-green-600" />
                                <span className="text-green-600">{detectedUrls.length} URL{detectedUrls.length > 1 ? 'S' : ''} DETECTED</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Collapsible URL tiles container */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-3 flex gap-3 overflow-x-auto h-20 items-start pt-1 pb-2">
                                {detectedUrls.length > 0 ? (
                                    detectedUrls.map((detectedUrl) => (
                                        <div
                                            key={detectedUrl.id}
                                            className="group flex items-center gap-3 px-3 py-2 border border-border bg-background hover:border-foreground/30 transition-all duration-200 shrink-0 h-12 w-64"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-green-600 font-mono uppercase mb-1">
                                                    {getDomain(detectedUrl.url)}
                                                </div>
                                                <div className="text-xs font-mono text-foreground truncate">
                                                    {detectedUrl.url}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 transition-all duration-200">
                                                <button
                                                    onClick={() => window.open(detectedUrl.url, '_blank')}
                                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 rounded"
                                                    title="Open in new tab"
                                                >
                                                    <ArrowSquareOut size={12} weight="duotone" />
                                                </button>
                                                <button
                                                    onClick={() => onRemoveUrl(detectedUrl.id)}
                                                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 rounded"
                                                    title="Remove URL"
                                                >
                                                    <X size={12} weight="duotone" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center w-full h-12 opacity-50 transition-opacity duration-300">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Globe size={14} weight="duotone" />
                                            <span className="text-xs font-mono uppercase">Enter URLs to see context</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
} 