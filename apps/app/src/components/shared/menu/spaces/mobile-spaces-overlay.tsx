"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { useTransitionRouter } from 'next-view-transitions';
import {
    Folder,
    Plus,
    Star,
    Globe,
    ArrowSquareOut,
    MagnifyingGlass
} from "@phosphor-icons/react/dist/ssr";
import { useAuth } from "@repo/auth/client";
import { cn } from "@repo/design/lib/utils";
import { MobileSheet } from "@/components/shared/ui/mobile-sheet";
import { mobileSpacesOpenAtom } from "@/atoms/mobile-menu";
import { useSpaces, useSpace } from '@/hooks/spaces';
import { useWebStream } from '@/hooks/web/use-web-stream';
import { promptFocusedAtom } from '@/atoms/chat';

interface MobileSpacesOverlayProps {
    currentSpaceId?: string | null;
    onNavigate?: (path: string) => void;
    onCreateSpace?: () => void;
}

// Component for individual web items with streaming support
function WebItemWithStream({ web, onNavigate }: { web: any; onNavigate?: (path: string) => void }) {
    // Stream quick metadata for PROCESSING webs
    const { webUpdate } = useWebStream(
        web.status === 'PROCESSING' ? web.id : null
    );

    // Use streamed data if available, otherwise fall back to web data
    const displayTitle = webUpdate?.title || web.title;
    const displayEmoji = webUpdate?.emoji || web.emoji;

    const formatWebTitle = (web: { title: string | null; url: string }, streamedTitle?: string) => {
        const title = streamedTitle || web.title;
        return title || new URL(web.url).hostname.replace('www.', '');
    };

    return (
        <button
            onClick={() => onNavigate?.(`/w/${web.id}`)}
            className="w-full p-3 bg-muted/20 rounded-lg transition-all duration-200 hover:bg-muted/40 text-left"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {displayEmoji ? (
                        <span className="text-base">{displayEmoji}</span>
                    ) : web.status === 'PROCESSING' || web.status === 'PENDING' ? (
                        <div className="w-5 h-5 bg-muted animate-pulse rounded-sm" />
                    ) : (
                        <Globe className="w-5 h-5 text-muted-foreground" weight="duotone" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {displayTitle || (web.status === 'PROCESSING' || web.status === 'PENDING') ? (
                            displayTitle ? (
                                <span className="font-medium text-foreground truncate text-base">
                                    {formatWebTitle(web, displayTitle)}
                                    {web.status === 'PROCESSING' && webUpdate?.title && webUpdate.title !== displayTitle && (
                                        <span className="inline-block w-0.5 h-3 bg-foreground/50 streaming-cursor ml-0.5" />
                                    )}
                                </span>
                            ) : (
                                <div className="space-y-1">
                                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                                </div>
                            )
                        ) : (
                            <span className="font-medium text-foreground truncate text-base">
                                {formatWebTitle(web)}
                            </span>
                        )}
                        <ArrowSquareOut className="w-4 h-4 text-muted-foreground" weight="duotone" />
                    </div>
                    <div className="text-sm text-muted-foreground truncate mb-2">
                        {new URL(web.url).hostname}
                    </div>
                    <div className={cn(
                        "inline-block px-2 py-1 rounded text-xs",
                        web.status === 'COMPLETE' && "bg-green-500/10 text-green-600",
                        web.status === 'PROCESSING' && "bg-blue-500/10 text-blue-600 animate-pulse",
                        web.status === 'PENDING' && "bg-yellow-500/10 text-yellow-600",
                        web.status === 'FAILED' && "bg-red-500/10 text-red-600"
                    )}>
                        {web.status}
                    </div>
                </div>
            </div>
        </button>
    );
}

// Main mobile spaces overlay content component
function MobileSpacesOverlayContent({ currentSpaceId, onNavigate, onCreateSpace }: MobileSpacesOverlayProps) {
    const { isLoaded } = useAuth();
    const [isOpen, setIsOpen] = useAtom(mobileSpacesOpenAtom);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
    const [spacesSearch, setSpacesSearch] = useState('');
    const [websSearch, setWebsSearch] = useState('');
    const [, setPromptFocused] = useAtom(promptFocusedAtom);
    const router = useTransitionRouter();

    // Use SWR hooks for data fetching - include webs with spaces
    const { spaces, isLoading: spacesLoading, mutate: mutateSpaces } = useSpaces();

    // Get selected space from the spaces array
    const selectedSpace = spaces.find(space => space.id === selectedSpaceId);

    // Filter spaces based on search
    const filteredSpaces = useMemo(() => {
        if (!spacesSearch) return spaces;
        const query = spacesSearch.toLowerCase();
        return spaces.filter(space =>
            space.name.toLowerCase().includes(query)
        );
    }, [spaces, spacesSearch]);

    // Filter webs based on search
    const filteredWebs = useMemo(() => {
        const webs = selectedSpace?.webs || [];
        if (!websSearch) return webs;
        const query = websSearch.toLowerCase();
        return webs.filter((web: { id: string; title: string | null; url: string; emoji: string | null; status: string }) =>
            (web.title && web.title.toLowerCase().includes(query)) ||
            web.url.toLowerCase().includes(query) ||
            new URL(web.url).hostname.toLowerCase().includes(query)
        );
    }, [selectedSpace?.webs, websSearch]);

    // Set default space as selected when spaces load
    useEffect(() => {
        if (spaces.length > 0 && !selectedSpaceId) {
            const defaultSpace = spaces.find(s => s.isDefault);
            if (defaultSpace) {
                setSelectedSpaceId(defaultSpace.id);
            } else {
                // Fallback to first space if no default
                setSelectedSpaceId(spaces[0].id);
            }
        }
    }, [spaces, selectedSpaceId]);

    // Refresh spaces data periodically when menu is open to catch new webs
    useEffect(() => {
        if (isOpen) {
            const interval = setInterval(() => {
                mutateSpaces();
            }, 2000); // Refresh every 2 seconds when menu is open

            return () => clearInterval(interval);
        }
    }, [isOpen, mutateSpaces]);

    // Clear search when menu closes
    useEffect(() => {
        if (!isOpen) {
            setSpacesSearch('');
            setWebsSearch('');
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        if (onNavigate) {
            onNavigate(path);
        }
    };

    const handleCreateSpace = () => {
        setIsOpen(false);
        if (onCreateSpace) {
            onCreateSpace();
        }
    };

    const handleCreateWeb = () => {
        setIsOpen(false);
        // Focus the URL input in the prompt bar
        setPromptFocused(true);
    };

    const handleSpaceClick = (space: any) => {
        setSelectedSpaceId(space.id);
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <MobileSheet
            isOpen={isOpen}
            onClose={handleClose}
            title="Spaces & Webs"
            spacing="sm"
            className="h-[80vh]"
        >
            <div className="flex flex-col h-full">
                {/* Spaces Section */}
                <div className="border-b border-border">
                    {/* Spaces Header */}
                    <div className="px-6 py-4 border-b border-border bg-muted/10">
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-sm font-medium text-foreground">Spaces</h3>
                            <button
                                onClick={handleCreateSpace}
                                className="h-6 w-6 bg-muted/50 text-muted-foreground flex items-center justify-center rounded border border-border transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
                                title="Create new space"
                            >
                                <Plus className="w-3 h-3" weight="duotone" />
                            </button>
                        </div>
                        <div className="relative">
                            <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" weight="duotone" />
                            <input
                                type="text"
                                placeholder="Search spaces..."
                                value={spacesSearch}
                                onChange={(e) => setSpacesSearch(e.target.value)}
                                className="w-full h-9 pl-10 pr-3 text-sm bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30"
                                style={{ fontSize: '16px' }}
                            />
                        </div>
                    </div>

                    {/* Spaces List */}
                    <div className="max-h-[200px] overflow-y-auto p-4">
                        {spacesLoading ? (
                            <div className="text-center py-4">
                                <div className="text-sm text-muted-foreground">Loading...</div>
                            </div>
                        ) : filteredSpaces.length === 0 ? (
                            <div className="text-center py-4">
                                <div className="text-sm text-muted-foreground">
                                    {spacesSearch ? 'No spaces found' : 'No spaces available'}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredSpaces.map((space) => (
                                    <button
                                        key={space.id}
                                        onClick={() => handleSpaceClick(space)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 text-left text-sm transition-colors rounded-lg",
                                            selectedSpaceId === space.id
                                                ? "bg-accent text-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {space.emoji ? (
                                                <span className="text-base">{space.emoji}</span>
                                            ) : (
                                                <Folder className="w-4 h-4" weight="duotone" />
                                            )}
                                            <span className="truncate font-medium">{space.name}</span>
                                            {space.isDefault && (
                                                <Star className="w-4 h-4 text-yellow-500" weight="fill" />
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {space._count?.webs || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Webs Section */}
                <div className="flex-1 flex flex-col">
                    {/* Webs Header */}
                    <div className="px-6 py-4 border-b border-border bg-muted/10">
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-sm font-medium text-foreground">
                                Webs {selectedSpace && `in ${selectedSpace.name}`}
                            </h3>
                            <button
                                onClick={handleCreateWeb}
                                className="h-6 w-6 bg-muted/50 text-muted-foreground flex items-center justify-center rounded border border-border transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
                                title="Add new web"
                            >
                                <Plus className="w-3 h-3" weight="duotone" />
                            </button>
                        </div>
                        <div className="relative">
                            <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" weight="duotone" />
                            <input
                                type="text"
                                placeholder="Search webs..."
                                value={websSearch}
                                onChange={(e) => setWebsSearch(e.target.value)}
                                className="w-full h-9 pl-10 pr-3 text-sm bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30"
                                disabled={!selectedSpace}
                                style={{ fontSize: '16px' }}
                            />
                        </div>
                    </div>

                    {/* Webs List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {!selectedSpace ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="text-sm text-muted-foreground">Select a space</div>
                            </div>
                        ) : filteredWebs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32">
                                <div className="w-16 h-16 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                                    <Globe className="w-8 h-8 text-muted-foreground/60" weight="duotone" />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {websSearch ? 'No webs found' : 'No webs in this space'}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {filteredWebs.map((web: { id: string; title: string | null; url: string; emoji: string | null; status: string }) => (
                                        <motion.div
                                            key={web.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            layout
                                        >
                                            <WebItemWithStream
                                                web={web}
                                                onNavigate={handleNavigate}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MobileSheet>
    );
}

// Main exported component with Suspense wrapper
export function MobileSpacesOverlay({ currentSpaceId, onNavigate, onCreateSpace }: MobileSpacesOverlayProps) {
    return (
        <Suspense fallback={null}>
            <MobileSpacesOverlayContent
                currentSpaceId={currentSpaceId}
                onNavigate={onNavigate}
                onCreateSpace={onCreateSpace}
            />
        </Suspense>
    );
} 