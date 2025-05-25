'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { ArrowSquareOut, X, Eye, Globe, CaretDown, CaretUp } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { stableUrlsAtom, inputTextAtom } from '@/atoms/urls';

// Helper to get domain from URL
function getDomain(url: string): string {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

export function ContextBar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [stableUrls] = useAtom(stableUrlsAtom);
    const [input, setInput] = useAtom(inputTextAtom);

    const removeUrl = (urlId: string) => {
        const urlToRemove = stableUrls.find(u => u.id === urlId);
        if (urlToRemove) {
            const newInput = input.replace(urlToRemove.url, '').trim();
            setInput(newInput);
        }
    };

    return (
        <div className="mt-3">
            <div className="border border-border bg-card/50 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-3 px-2 py-1.5 -mx-2 -my-1 rounded-md transition-all duration-200 hover:bg-background group"
                    >
                        <div className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                            <AnimatePresence mode="wait">
                                {isExpanded ? (
                                    <motion.div
                                        key="up"
                                        initial={{ opacity: 0, rotate: -90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 90 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <CaretUp size={14} weight="duotone" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="down"
                                            initial={{ opacity: 0, rotate: 90 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: -90 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                            <CaretDown size={14} weight="duotone" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium group-hover:text-foreground transition-colors duration-200">
                            Context
                        </span>
                    </button>

                    <div className="flex items-center gap-3">
                        {stableUrls.length > 0 ? (
                            <div className="flex items-center gap-2">
                                <Eye size={12} weight="duotone" className="text-green-600" />
                                <span className="text-xs text-green-600 font-mono uppercase tracking-wider">
                                    {stableUrls.length} URL{stableUrls.length > 1 ? 's' : ''} detected
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Globe size={12} weight="duotone" className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                                    No URLs detected
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapsible horizontal carousel */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 py-3">
                                <div 
                                    className="flex gap-3 overflow-x-auto scrollbar-hide relative"
                                    style={{ height: '64px' }}
                                >
                                    <AnimatePresence mode="wait">
                                        {stableUrls.length > 0 ? (
                                            stableUrls.map((detectedUrl) => (
                                                <motion.div
                                                    key={detectedUrl.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 300,
                                                        damping: 25,
                                                        opacity: { duration: 0.2 }
                                                    }}
                                                    className="group flex items-center gap-3 px-3 py-2 border border-border bg-background hover:border-foreground/30 hover:shadow-sm transition-all duration-200 shrink-0 h-12 w-72 rounded-lg relative"
                                                    style={{
                                                        // Ensure the element stays within bounds during animation
                                                        position: 'relative',
                                                        zIndex: 1
                                                    }}
                                                >
                                                    {/* URL info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-green-600 font-mono uppercase mb-1 tracking-wider">
                                                            {getDomain(detectedUrl.url)}
                                                        </div>
                                                        <div className="text-xs font-mono text-foreground truncate">
                                                            {detectedUrl.url}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button
                                                            onClick={() => window.open(detectedUrl.url, '_blank')}
                                                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 rounded-md"
                                                            title="Open in new tab"
                                                        >
                                                            <ArrowSquareOut size={12} weight="duotone" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeUrl(detectedUrl.id)}
                                                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 rounded-md"
                                                            title="Remove URL"
                                                        >
                                                            <X size={12} weight="duotone" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                                <motion.div
                                                    key="empty"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center w-full h-12"
                                                >
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Globe size={14} weight="duotone" />
                                                        <span className="text-xs font-mono uppercase tracking-wider">
                                                            Enter URLs above to see context
                                                        </span>
                                                    </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
} 