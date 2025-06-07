"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransitionRouter } from 'next-view-transitions';
import { useAtom } from 'jotai';
import {
    Folder,
    Plus,
    Star,
    DotsThree,
    CaretDown,
    CaretUp,
    Globe,
    ArrowSquareOut,
    MagnifyingGlass
} from "@phosphor-icons/react/dist/ssr";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/design/components/ui/dropdown-menu";
import { cn } from "@repo/design/lib/utils";
import { Link } from 'next-view-transitions';
import { useSpaces, useSpace } from '@/hooks/spaces';
import { useWebStream } from '@/hooks/web/use-web-stream';
import { promptFocusedAtom } from '@/atoms/chat';

interface SpacesMenuProps {
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
        <Link
            href={`/w/${web.id}`}
            onClick={() => onNavigate?.(`/w/${web.id}`)}
            className="block p-2 hover:bg-accent/50 transition-colors rounded text-xs group"
        >
            <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                    {displayEmoji ? (
                        <span className="text-sm">{displayEmoji}</span>
                    ) : web.status === 'PROCESSING' || web.status === 'PENDING' ? (
                        <div className="w-4 h-4 bg-muted animate-pulse rounded-sm" />
                    ) : (
                        <Globe className="w-4 h-4 text-muted-foreground" weight="duotone" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        {displayTitle || (web.status === 'PROCESSING' || web.status === 'PENDING') ? (
                            displayTitle ? (
                                <span className="font-medium text-foreground truncate">
                                    {formatWebTitle(web, displayTitle)}
                                    {web.status === 'PROCESSING' && webUpdate?.title && webUpdate.title !== displayTitle && (
                                        <span className="inline-block w-0.5 h-3 bg-foreground/50 streaming-cursor ml-0.5" />
                                    )}
                                </span>
                            ) : (
                                <div className="space-y-1">
                                    <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                                </div>
                            )
                        ) : (
                            <span className="font-medium text-foreground truncate">
                                {formatWebTitle(web)}
                            </span>
                        )}
                        <ArrowSquareOut
                            className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            weight="duotone"
                        />
                    </div>
                    <div className="text-muted-foreground truncate">
                        {new URL(web.url).hostname}
                    </div>
                    <div className={cn(
                        "inline-block px-1.5 py-0.5 rounded text-xs mt-1",
                        web.status === 'COMPLETE' && "bg-green-500/10 text-green-600",
                        web.status === 'PROCESSING' && "bg-blue-500/10 text-blue-600 animate-pulse",
                        web.status === 'PENDING' && "bg-yellow-500/10 text-yellow-600",
                        web.status === 'FAILED' && "bg-red-500/10 text-red-600"
                    )}>
                        {web.status}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function SpacesMenu({ currentSpaceId, onNavigate, onCreateSpace }: SpacesMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
    const [hoveredSpaceId, setHoveredSpaceId] = useState<string | null>(null);
    const [spacesSearch, setSpacesSearch] = useState('');
    const [websSearch, setWebsSearch] = useState('');
    const [, setPromptFocused] = useAtom(promptFocusedAtom);
    const [dropdownAlign, setDropdownAlign] = useState<'start' | 'end'>('start');
    const router = useTransitionRouter();

    // Use SWR hooks for data fetching - include webs with spaces
    const { spaces, isLoading: spacesLoading, mutate: mutateSpaces } = useSpaces();

    // Get selected space from the spaces array
    const selectedSpace = spaces.find(space => space.id === selectedSpaceId);

    // Get hovered space from the spaces array
    const hoveredSpace = spaces.find(space => space.id === hoveredSpaceId);

    // Use hovered space if hovering, otherwise use selected space
    const displaySpace = hoveredSpace || selectedSpace;

    // Check if dropdown should align to the end to avoid viewport edge
    useEffect(() => {
        if (menuOpen) {
            const checkPosition = () => {
                const button = document.querySelector('[aria-label="Spaces and webs"]') as HTMLElement;
                if (button) {
                    const buttonRect = button.getBoundingClientRect();
                    const menuWidth = 480; // Fixed width of the menu
                    const minRightPadding = 40; // Increased minimum padding from right edge
                    const availableSpaceRight = window.innerWidth - buttonRect.left;

                    // If the menu would extend too close to the right edge, align to end
                    if (availableSpaceRight < menuWidth + minRightPadding) {
                        setDropdownAlign('end');
                    } else {
                        setDropdownAlign('start');
                    }
                }
            };

            checkPosition();
            window.addEventListener('resize', checkPosition);
            return () => window.removeEventListener('resize', checkPosition);
        }
    }, [menuOpen]);

    // Close menu when resizing to mobile to prevent UI issues
    useEffect(() => {
        const handleResize = () => {
            if (menuOpen && window.innerWidth < 768) { // Close on mobile breakpoint
                setMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [menuOpen]);

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
        const webs = displaySpace?.webs || [];
        if (!websSearch) return webs;
        const query = websSearch.toLowerCase();
        return webs.filter((web: { id: string; title: string | null; url: string; emoji: string | null; status: string }) =>
            (web.title && web.title.toLowerCase().includes(query)) ||
            web.url.toLowerCase().includes(query) ||
            new URL(web.url).hostname.toLowerCase().includes(query)
        );
    }, [displaySpace?.webs, websSearch]);

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
        if (menuOpen) {
            const interval = setInterval(() => {
                mutateSpaces();
            }, 2000); // Refresh every 2 seconds when menu is open

            return () => clearInterval(interval);
        }
    }, [menuOpen, mutateSpaces]);

    // Clear search when menu closes
    useEffect(() => {
        if (!menuOpen) {
            setSpacesSearch('');
            setWebsSearch('');
            setHoveredSpaceId(null);
        }
    }, [menuOpen]);

    const handleNavigate = (path: string) => {
        setMenuOpen(false);
        if (onNavigate) {
            onNavigate(path);
        }
    };

    const handleCreateSpace = () => {
        setMenuOpen(false);
        if (onCreateSpace) {
            onCreateSpace();
        }
    };

    const handleCreateWeb = () => {
        setMenuOpen(false);
        // Focus the URL input in the prompt bar
        setPromptFocused(true);
    };

    const handleSpaceClick = (space: any) => {
        setSelectedSpaceId(space.id);

        // Navigate to the space's page
        const spaceUrlName = space.name.toLowerCase().replace(/\s+/g, '-');
        setMenuOpen(false);
        router.push(`/${spaceUrlName}`);
    };

    const handleSpaceHover = (spaceId: string) => {
        setHoveredSpaceId(spaceId);
    };

    const handleSpaceLeave = () => {
        setHoveredSpaceId(null);
    };

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 flex items-center justify-center transition-all duration-200 rounded-md border select-none",
                        "bg-accent/5 border-accent/50 text-muted-foreground",
                        "hover:bg-accent/40 hover:text-accent-foreground hover:border-accent/50",
                        "focus:outline-none",
                        menuOpen ? "bg-accent/50 border-accent/50 text-accent-foreground" : ""
                    )}
                    aria-label="Spaces and webs"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {menuOpen ? (
                            <motion.div
                                key="up"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <CaretUp className="w-3 h-3" weight="duotone" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="down"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <CaretDown className="w-3 h-3" weight="duotone" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={dropdownAlign}
                side="bottom"
                sideOffset={8}
                className="p-0 bg-popover border-border/50 rounded-lg font-mono overflow-hidden z-[90]"
                style={{ width: '480px', minWidth: '480px', height: '400px', minHeight: '400px' }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 0.8
                    }}
                    className="h-full flex"
                >
                    {/* Left Panel - Spaces */}
                    <div className="w-1/2 border-r border-border flex flex-col">
                        {/* Header with search */}
                        <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
                            <div className="flex-1 relative">
                                <MagnifyingGlass className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" weight="duotone" />
                                <input
                                    type="text"
                                    placeholder="Search spaces..."
                                    value={spacesSearch}
                                    onChange={(e) => setSpacesSearch(e.target.value)}
                                    className="w-full h-8 pl-7 pr-2 text-xs bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30"
                                />
                            </div>
                            <button
                                onClick={handleCreateSpace}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                                title="Create new space"
                            >
                                <Plus className="w-3 h-3" weight="duotone" />
                            </button>
                        </div>

                        {/* Spaces list */}
                        <div className="flex-1 overflow-y-auto p-1">
                            {spacesLoading ? (
                                <div className="p-3 text-center">
                                    <div className="text-xs text-muted-foreground">Loading...</div>
                                </div>
                            ) : filteredSpaces.length === 0 ? (
                                <div className="p-3 text-center">
                                    <div className="text-xs text-muted-foreground">
                                        {spacesSearch ? 'No spaces found' : 'No spaces available'}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredSpaces.map((space) => (
                                        <button
                                            key={space.id}
                                            onClick={() => handleSpaceClick(space)}
                                            onMouseEnter={() => handleSpaceHover(space.id)}
                                            onMouseLeave={handleSpaceLeave}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors rounded",
                                                selectedSpaceId === space.id
                                                    ? "bg-accent text-foreground"
                                                    : hoveredSpaceId === space.id
                                                        ? "bg-accent/70 text-foreground"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                {space.emoji ? (
                                                    <span className="text-xs">{space.emoji}</span>
                                                ) : (
                                                    <Folder className="w-3 h-3" weight="duotone" />
                                                )}
                                                <span className="truncate">{space.name}</span>
                                                {space.isDefault && (
                                                    <Star className="w-3 h-3 text-yellow-500" weight="fill" />
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

                    {/* Right Panel - Webs */}
                    <div className="w-1/2 flex flex-col">
                        {/* Header with search */}
                        <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
                            <div className="flex-1 relative">
                                <MagnifyingGlass className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" weight="duotone" />
                                <input
                                    type="text"
                                    placeholder="Search webs..."
                                    value={websSearch}
                                    onChange={(e) => setWebsSearch(e.target.value)}
                                    className="w-full h-8 pl-7 pr-2 text-xs bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30"
                                    disabled={!displaySpace}
                                />
                            </div>
                            <button
                                onClick={handleCreateWeb}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                                title="Add new web"
                            >
                                <Plus className="w-3 h-3" weight="duotone" />
                            </button>
                        </div>

                        {/* Webs list */}
                        <div className="flex-1 overflow-y-auto p-1">
                            {!displaySpace ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-xs text-muted-foreground">Select a space</div>
                                </div>
                            ) : filteredWebs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-md bg-muted/50 flex items-center justify-center mx-auto mb-2">
                                        <Globe className="w-6 h-6 text-muted-foreground/60" weight="duotone" />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {websSearch ? 'No webs found' : 'No webs in this space'}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
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
                </motion.div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 