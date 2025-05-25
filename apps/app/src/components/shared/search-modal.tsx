'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'next-view-transitions';
import { MagnifyingGlass, Globe, Clock, X } from '@phosphor-icons/react/dist/ssr';
import { Input } from '@repo/design/sacred';
import { cn } from '@repo/design/lib/utils';

interface Web {
    id: string;
    title?: string | null;
    url: string;
    prompt?: string | null;
    status: 'COMPLETE' | 'PENDING' | 'PROCESSING' | 'FAILED';
    createdAt: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    webs: Web[];
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

// Helper to format relative time
function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

export function SearchModal({ isOpen, onClose, webs }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Filter webs based on search query
    const filteredWebs = webs.filter(web => {
        if (!query) return true;
        const searchQuery = query.toLowerCase();
        return (
            web.title?.toLowerCase().includes(searchQuery) ||
            web.url.toLowerCase().includes(searchQuery) ||
            web.prompt?.toLowerCase().includes(searchQuery) ||
            extractDomain(web.url).toLowerCase().includes(searchQuery)
        );
    }).slice(0, 8); // Limit to 8 results

    // Reset selection when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredWebs.length]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, filteredWebs.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredWebs[selectedIndex]) {
                        window.location.href = `/w/${filteredWebs[selectedIndex].id}`;
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredWebs, selectedIndex, onClose]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            // Focus the input after a short delay to ensure it's rendered
            setTimeout(() => {
                const input = document.querySelector('[placeholder="Type to search..."]') as HTMLInputElement;
                if (input) {
                    input.focus();
                }
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl mx-4 bg-background border border-border"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-border bg-card/50">
                        <MagnifyingGlass size={16} weight="duotone" className="text-foreground" />
                        <span className="text-foreground font-mono uppercase text-sm">Search Webs</span>
                        <div className="ml-auto">
                            <button
                                onClick={onClose}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={16} weight="duotone" />
                            </button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="p-4 border-b border-border">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type to search..."
                            className="w-full"
                            caretChars="█"
                        />
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto">
                        {filteredWebs.length > 0 ? (
                            <div className="divide-y divide-border">
                                {filteredWebs.map((web, index) => (
                                    <Link
                                        key={web.id}
                                        href={`/w/${web.id}`}
                                        className={cn(
                                            "block p-4 transition-colors font-mono border-l-2",
                                            index === selectedIndex
                                                ? "bg-accent border-l-primary"
                                                : "hover:bg-accent/50 border-l-transparent"
                                        )}
                                        onClick={onClose}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Globe size={12} weight="duotone" className="shrink-0" />
                                                    <span className="text-xs uppercase truncate">
                                                        {extractDomain(web.url)}
                                                    </span>
                                                    <span className={cn(
                                                        "text-xs px-1 uppercase",
                                                        web.status === 'COMPLETE' && "text-green-600",
                                                        web.status === 'PENDING' && "text-yellow-600",
                                                        web.status === 'PROCESSING' && "text-blue-600",
                                                        web.status === 'FAILED' && "text-red-600"
                                                    )}>
                                                        [{web.status}]
                                                    </span>
                                                </div>
                                                <div className="text-sm font-medium truncate mb-1">
                                                    {web.title || web.url}
                                                </div>
                                                {web.prompt && (
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        "{web.prompt}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock size={12} weight="duotone" />
                                                <span>{formatRelativeTime(new Date(web.createdAt))}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : query ? (
                            <div className="p-8 text-center">
                                <MagnifyingGlass size={32} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground font-mono">
                                    No webs found for "{query}"
                                </p>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="text-sm text-muted-foreground font-mono space-y-2">
                                    <p>Start typing to search your webs</p>
                                    <div className="flex items-center justify-center gap-4 text-xs">
                                        <span>↑↓ Navigate</span>
                                        <span>↵ Select</span>
                                        <span>ESC Close</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
} 