'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowSquareOut, X, Globe } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';

interface UrlTile {
    id: string;
    url: string;
}

interface UrlTilesProps {
    urls: UrlTile[];
    onRemove: (urlId: string) => void;
    minHeight?: string;
}

// Helper to get domain from URL
function getDomain(url: string): string {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

export function UrlTiles({ urls, onRemove, minHeight = 'h-12' }: UrlTilesProps) {
    return (
        <div className="h-12 flex items-center gap-3 overflow-x-auto scrollbar-hide relative">
            <AnimatePresence>
                {urls.length > 0 ? (
                    urls.map((detectedUrl) => (
                        <motion.div
                            key={detectedUrl.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="group flex items-center gap-3 px-3 py-2 border border-border bg-card hover:border-foreground/30 hover:shadow-sm shrink-0 h-12 w-72 rounded-lg relative"
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
                                    onClick={() => onRemove(detectedUrl.id)}
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
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 px-3 py-2 border border-dashed border-border/50 bg-muted/30 shrink-0 h-12 w-72 rounded-lg relative"
                    >
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe size={16} weight="duotone" />
                            <span className="text-xs font-mono uppercase tracking-wider">
                                Enter a URL above or add from tabs
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 