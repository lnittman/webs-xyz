'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';

interface UrlSuggestion {
    url: string;
    title: string;
    favicon?: string;
    type: 'favorite' | 'recent' | 'trending';
    lastVisited?: Date;
}

interface UrlSuggestionsDropdownProps {
    isOpen: boolean;
    searchValue: string;
    onSelect: (url: string) => void;
    width?: number;
    onNavigate?: (direction: 'up' | 'down') => void;
    selectedIndex?: number;
    anchorElement?: HTMLElement | null;
}

// Mock data - in real app would come from user data
const mockSuggestions: UrlSuggestion[] = [
    // Favorites
    {
        url: 'github.com',
        title: 'GitHub',
        favicon: 'https://github.com/favicon.ico',
        type: 'favorite',
        lastVisited: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
        url: 'vercel.com',
        title: 'Vercel',
        favicon: 'https://vercel.com/favicon.ico',
        type: 'favorite',
        lastVisited: new Date(Date.now() - 1000 * 60 * 60)
    },
    {
        url: 'react.dev',
        title: 'React',
        favicon: 'https://react.dev/favicon.ico',
        type: 'favorite',
        lastVisited: new Date(Date.now() - 1000 * 60 * 90)
    },
    // Recent
    {
        url: 'news.ycombinator.com',
        title: 'Hacker News',
        favicon: 'https://news.ycombinator.com/favicon.ico',
        type: 'recent',
        lastVisited: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
        url: 'stackoverflow.com',
        title: 'Stack Overflow',
        favicon: 'https://stackoverflow.com/favicon.ico',
        type: 'recent',
        lastVisited: new Date(Date.now() - 1000 * 60 * 45)
    },
    // Trending
    {
        url: 'reddit.com/r/programming',
        title: 'r/programming',
        favicon: 'https://reddit.com/favicon.ico',
        type: 'trending',
        lastVisited: new Date(Date.now() - 1000 * 60 * 120)
    },
    {
        url: 'dev.to',
        title: 'DEV Community',
        favicon: 'https://dev.to/favicon.ico',
        type: 'trending',
        lastVisited: new Date(Date.now() - 1000 * 60 * 180)
    }
];

export function UrlSuggestionsDropdown({
    isOpen,
    searchValue,
    onSelect,
    width,
    onNavigate,
    selectedIndex = -1,
    anchorElement
}: UrlSuggestionsDropdownProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Filter suggestions based on search value - fuzzy search
    const filteredSuggestions = useMemo(() => {
        if (!searchValue) return mockSuggestions;

        const query = searchValue.toLowerCase();
        return mockSuggestions
            .filter(suggestion =>
                suggestion.url.toLowerCase().includes(query) ||
                suggestion.title.toLowerCase().includes(query)
            )
            .sort((a, b) => {
                // Prioritize URL matches over title matches
                const aUrlMatch = a.url.toLowerCase().includes(query);
                const bUrlMatch = b.url.toLowerCase().includes(query);

                if (aUrlMatch && !bUrlMatch) return -1;
                if (!aUrlMatch && bUrlMatch) return 1;

                // If both match URL or both match title, sort by relevance (starts with query first)
                const aStarts = a.url.toLowerCase().startsWith(query);
                const bStarts = b.url.toLowerCase().startsWith(query);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                // Finally sort by last visited
                return (b.lastVisited?.getTime() || 0) - (a.lastVisited?.getTime() || 0);
            });
    }, [searchValue]);

    // Update position when anchor element changes or when opened
    useEffect(() => {
        if (isOpen && anchorElement) {
            const updatePosition = () => {
                const rect = anchorElement.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.left + window.scrollX
                });
            };

            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen, anchorElement]);

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [selectedIndex]);

    if (typeof window === 'undefined') return null;

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        width,
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        zIndex: 9999
                    }}
                    className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl overflow-hidden"
                >
                    <div
                        ref={scrollContainerRef}
                        className="max-h-[320px] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
                    >
                        {filteredSuggestions.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <Globe size={24} weight="duotone" className="mx-auto mb-2 text-muted-foreground/40" />
                                <p className="text-xs text-muted-foreground font-mono">
                                    No suggestions found
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Try a different search
                                </p>
                            </div>
                        ) : (
                            <div className="py-1 flex flex-col gap-1 mx-1">
                                {filteredSuggestions.map((suggestion, index) => (
                                    <SuggestionItem
                                        key={`suggestion-${index}`}
                                        ref={el => { itemRefs.current[index] = el; }}
                                        suggestion={suggestion}
                                        isSelected={selectedIndex === index}
                                        onSelect={onSelect}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {filteredSuggestions.length > 0 && (
                        <div className="px-3 py-2 border-t border-border bg-muted/30">
                            <p className="text-xs text-muted-foreground font-mono">
                                ↑↓ Navigate • Enter Select
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(dropdownContent, document.body);
}

interface SuggestionItemProps {
    suggestion: UrlSuggestion;
    isSelected: boolean;
    onSelect: (url: string) => void;
}

const SuggestionItem = React.forwardRef<HTMLButtonElement, SuggestionItemProps>(
    ({ suggestion, isSelected, onSelect }, ref) => {
        return (
            <button
                ref={ref}
                onClick={() => onSelect(suggestion.url)}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 group rounded-md min-w-0",
                    isSelected ? "bg-accent" : "hover:bg-accent/50"
                )}
            >
                {/* Favicon */}
                <div className="relative w-4 h-4 shrink-0">
                    {suggestion.favicon ? (
                        <img
                            src={suggestion.favicon}
                            alt=""
                            className="w-4 h-4 rounded-sm object-cover"
                            onError={(e) => {
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<div class="w-4 h-4 rounded-sm bg-muted flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor" opacity="0.5"/></svg></div>';
                                }
                            }}
                        />
                    ) : (
                        <div className="w-4 h-4 rounded-sm bg-muted flex items-center justify-center">
                            <Globe size={10} weight="duotone" className="text-muted-foreground/50" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-foreground truncate">
                            {suggestion.url}
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                        {suggestion.title}
                    </div>
                </div>

                {/* Action */}
                <div className={cn(
                    "shrink-0 transition-all duration-200",
                    isSelected ? "opacity-100" : "opacity-0"
                )}>
                    <ArrowSquareOut size={14} weight="duotone" className="text-muted-foreground" />
                </div>
            </button>
        );
    }
);

SuggestionItem.displayName = 'SuggestionItem'; 