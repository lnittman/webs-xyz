"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@repo/design/components/ui/sonner';
import { cn } from '@repo/design/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/design/components/ui/dropdown-menu';
import {
    DotsThree,
    Copy,
    Trash,
    Star,
    ShareNetwork,
    PencilSimple,
    Folder,
    FolderOpen,
    CaretRight
} from '@phosphor-icons/react/dist/ssr';
import type { Web } from '@/types/dashboard';
import { assignWebToSpace } from '@/app/actions/spaces';
import { deleteWeb } from '@/app/actions/webs';

interface Space {
    id: string;
    name: string;
    emoji: string | null;
    isDefault: boolean;
}

interface WebActionMenuProps {
    web: Web;
    onDelete?: (id: string) => void;
    onShare?: (id: string) => void;
    onFavorite?: (id: string) => void;
    onRename?: (id: string) => void;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function WebActionMenu({
    web,
    onDelete,
    onShare,
    onFavorite,
    onRename,
    isOpen,
    onOpenChange
}: WebActionMenuProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loadingSpaces, setLoadingSpaces] = useState(false);
    const [assigningToSpace, setAssigningToSpace] = useState<string | null>(null);
    const [deletingWeb, setDeletingWeb] = useState(false);
    const [reassignSubMenuOpen, setReassignSubMenuOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use external state if provided, otherwise use internal state
    const menuOpen = isOpen !== undefined ? isOpen : internalOpen;
    const setMenuOpen = onOpenChange || setInternalOpen;

    // Load spaces when menu opens
    useEffect(() => {
        if (menuOpen && spaces.length === 0) {
            loadSpaces();
        }
    }, [menuOpen]);

    // Close submenu when main menu closes
    useEffect(() => {
        if (!menuOpen) {
            setReassignSubMenuOpen(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [menuOpen]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const loadSpaces = async () => {
        try {
            setLoadingSpaces(true);
            const response = await fetch('/api/spaces');
            if (response.ok) {
                const json = await response.json();
                // Extract data from the response envelope, similar to the spaces hook
                const spacesData = json.data || json;
                setSpaces(spacesData);
            }
        } catch (error) {
            console.error('Failed to load spaces:', error);
        } finally {
            setLoadingSpaces(false);
        }
    };

    const handleAssignToSpace = async (spaceId: string | null) => {
        try {
            setAssigningToSpace(spaceId);
            const result = await assignWebToSpace(web.id, spaceId);

            if ('success' in result && result.success) {
                toast.success(result.message);
                setMenuOpen(false);
            } else if ('error' in result) {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Failed to assign web to space:', error);
            toast.error('Failed to assign web to space');
        } finally {
            setAssigningToSpace(null);
        }
    };

    const handleDelete = async () => {
        try {
            setDeletingWeb(true);
            const result = await deleteWeb({ webId: web.id });

            if ('success' in result && result.success) {
                toast.success(result.message);
                setMenuOpen(false);
                // Call the optional onDelete callback if provided (for parent component to handle UI updates)
                onDelete?.(web.id);
            } else if ('error' in result) {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Failed to delete web:', error);
            toast.error('Failed to delete web');
        } finally {
            setDeletingWeb(false);
        }
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleReassignMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setReassignSubMenuOpen(true);
    };

    const handleReassignMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setReassignSubMenuOpen(false);
        }, 200);
    };

    const handleSubmenuMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setReassignSubMenuOpen(true);
    };

    const handleSubmenuMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setReassignSubMenuOpen(false);
        }, 100);
    };

    const currentSpace = spaces.find(s => s.id === web.spaceId);

    // Get available spaces (excluding current space)
    const availableSpaces = spaces.filter(s => s.id !== web.spaceId);

    return (
        <div onClick={handleMenuClick}>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "h-7 w-7 bg-transparent text-muted-foreground flex items-center justify-center text-xs rounded-md",
                            "hover:bg-accent hover:text-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-foreground/20",
                            menuOpen ? "bg-accent text-foreground" : ""
                        )}
                        aria-label="More options"
                    >
                        <DotsThree weight="bold" className="w-5 h-5" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={5}
                    className="w-[200px] p-1 bg-popover border-border/50 rounded-lg font-mono"
                >
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.8 }}
                    >
                        {onRename && (
                            <DropdownMenuItem
                                onClick={() => onRename(web.id)}
                                disabled={!onRename}
                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                            >
                                <PencilSimple className="w-4 h-4 mr-2 transition-all duration-200" weight="duotone" />
                                <span className="transition-colors duration-200">Rename</span>
                            </DropdownMenuItem>
                        )}

                        {/* Space reassignment submenu */}
                        <div
                            className="relative"
                            onMouseEnter={handleReassignMouseEnter}
                            onMouseLeave={handleReassignMouseLeave}
                        >
                            <div
                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200 hover:bg-accent flex items-center justify-between"
                                onSelect={(e: any) => e?.preventDefault()}
                            >
                                <div className="flex items-center">
                                    <Folder className="w-4 h-4 mr-2 transition-all duration-200" weight="duotone" />
                                    <span className="transition-colors duration-200">Reassign</span>
                                </div>
                                <CaretRight className={cn(
                                    "w-3 h-3 text-muted-foreground transition-all duration-200",
                                    reassignSubMenuOpen && "rotate-90"
                                )} weight="duotone" />
                            </div>

                            {/* Portal-like positioning for submenu */}
                            {reassignSubMenuOpen && (
                                <div
                                    className="fixed z-[200] min-w-[200px] p-1 bg-popover border border-border/50 rounded-lg shadow-xl font-mono"
                                    style={{
                                        left: 'calc(100% + 8px)',
                                        top: 0,
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        position: 'absolute'
                                    }}
                                    onMouseEnter={handleSubmenuMouseEnter}
                                    onMouseLeave={handleSubmenuMouseLeave}
                                >
                                    {loadingSpaces ? (
                                        <div className="px-3 py-2 text-xs text-muted-foreground">Loading spaces...</div>
                                    ) : (
                                        <>
                                            {/* Remove from space option */}
                                            {web.spaceId && (
                                                <>
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAssignToSpace(null);
                                                            }}
                                                            className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200 hover:bg-accent flex items-center"
                                                        >
                                                            <FolderOpen className="w-4 h-4 mr-2 transition-all duration-200" weight="duotone" />
                                                            <span className="transition-colors duration-200 flex-1">Remove from space</span>
                                                            {assigningToSpace === null && (
                                                                <div className="ml-2 w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                            )}
                                                        </div>
                                                        {availableSpaces.length > 0 && (
                                                            <div className="my-1 border-t border-border/30" />
                                                        )}
                                                    </>
                                                )}

                                                {/* Available spaces */}
                                                {availableSpaces.length > 0 ? (
                                                    availableSpaces.map((space) => (
                                                        <div
                                                            key={space.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAssignToSpace(space.id);
                                                            }}
                                                            className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200 hover:bg-accent flex items-center"
                                                        >
                                                            <div className="flex items-center mr-2">
                                                                {space.emoji ? (
                                                                    <span className="text-sm">{space.emoji}</span>
                                                                ) : (
                                                                    <Folder className="w-4 h-4" weight="duotone" />
                                                                )}
                                                            </div>
                                                            <span className="transition-colors duration-200 flex-1 truncate">{space.name}</span>
                                                            <div className="flex items-center ml-2 gap-1">
                                                                {space.isDefault && (
                                                                    <Star className="w-3 h-3 text-yellow-500" weight="fill" />
                                                                )}
                                                                {assigningToSpace === space.id && (
                                                                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                            ) : !web.spaceId && (
                                                <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                                                    <Folder className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" weight="duotone" />
                                                    No spaces available
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(web.url);
                                toast.success('URL copied to clipboard!');
                            }}
                            className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                        >
                            <Copy className="w-4 h-4 mr-2 transition-all duration-200" weight="duotone" />
                            <span className="transition-colors duration-200">Copy URL</span>
                        </DropdownMenuItem>

                        {onShare && (
                            <DropdownMenuItem
                                onClick={() => onShare(web.id)}
                                disabled={!onShare}
                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                            >
                                <ShareNetwork className="w-4 h-4 mr-2 transition-all duration-200" weight="duotone" />
                                <span className="transition-colors duration-200">Share</span>
                            </DropdownMenuItem>
                        )}

                        {onFavorite && (
                            <DropdownMenuItem
                                onClick={() => onFavorite(web.id)}
                                disabled={!onFavorite}
                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                            >
                                <Star className="w-4 h-4 mr-2 transition-all duration-200" weight="duotone" />
                                <span className="transition-colors duration-200">Add to Favorites</span>
                            </DropdownMenuItem>
                        )}

                        {(onRename || onShare || onFavorite) && <DropdownMenuSeparator className="my-1" />}

                        <DropdownMenuItem
                            onClick={handleDelete}
                            disabled={deletingWeb}
                            className="rounded-md px-2 py-1.5 text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-600/10 transition-all duration-200"
                        >
                            <Trash className="w-4 h-4 mr-2 transition-all duration-200 text-red-600" weight="duotone" />
                            <span className="transition-colors duration-200">Delete</span>
                            {deletingWeb && (
                                <div className="ml-auto w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            )}
                        </DropdownMenuItem>
                    </motion.div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
} 