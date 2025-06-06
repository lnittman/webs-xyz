"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@repo/design/components/ui/sonner';
import { cn } from '@repo/design/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
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
    Check
} from '@phosphor-icons/react/dist/ssr';
import type { Web } from '@/types/dashboard';
import { assignWebToSpace } from '@/app/actions/spaces';

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

    // Use external state if provided, otherwise use internal state
    const menuOpen = isOpen !== undefined ? isOpen : internalOpen;
    const setMenuOpen = onOpenChange || setInternalOpen;

    // Load spaces when menu opens
    useEffect(() => {
        if (menuOpen && spaces.length === 0) {
            loadSpaces();
        }
    }, [menuOpen]);

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

    const handleMenuClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const currentSpace = spaces.find(s => s.id === web.spaceId);

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

                        {/* Space assignment submenu */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200">
                                <Folder className="w-4 h-4 mr-2 transition-all duration-200" weight="duotone" />
                                <span className="transition-colors duration-200">
                                    {currentSpace ? `Move from ${currentSpace.name}` : 'Move to space'}
                                </span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-[180px] p-1 bg-popover border-border/50 rounded-lg font-mono">
                                {loadingSpaces ? (
                                    <div className="px-2 py-1.5 text-xs text-muted-foreground">Loading...</div>
                                ) : (
                                    <>
                                        {/* Remove from space option */}
                                        {web.spaceId && (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() => handleAssignToSpace(null)}
                                                    disabled={assigningToSpace === null}
                                                    className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                                                >
                                                    <FolderOpen className="w-4 h-4 mr-2 transition-all duration-200" weight="duotone" />
                                                    <span className="transition-colors duration-200">Remove from space</span>
                                                    {assigningToSpace === null && (
                                                        <div className="ml-auto w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-1" />
                                            </>
                                        )}

                                        {/* Available spaces */}
                                        {spaces.filter(s => s.id !== web.spaceId).map((space) => (
                                            <DropdownMenuItem
                                                key={space.id}
                                                onClick={() => handleAssignToSpace(space.id)}
                                                disabled={assigningToSpace === space.id}
                                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                                            >
                                                <div className="flex items-center mr-2">
                                                    {space.emoji ? (
                                                        <span className="text-sm">{space.emoji}</span>
                                                    ) : (
                                                        <Folder className="w-4 h-4" weight="duotone" />
                                                    )}
                                                </div>
                                                <span className="transition-colors duration-200 flex-1">{space.name}</span>
                                                {space.isDefault && (
                                                    <Star className="w-3 h-3 text-yellow-500 ml-1" weight="fill" />
                                                )}
                                                {assigningToSpace === space.id && (
                                                    <div className="ml-auto w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                )}
                                            </DropdownMenuItem>
                                        ))}

                                        {spaces.filter(s => s.id !== web.spaceId).length === 0 && !web.spaceId && (
                                            <div className="px-2 py-1.5 text-xs text-muted-foreground">No spaces available</div>
                                        )}
                                    </>
                                )}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

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

                        {(onRename || onShare || onFavorite) && onDelete && <DropdownMenuSeparator className="my-1" />}

                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(web.id)}
                                disabled={!onDelete}
                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-600/10 transition-all duration-200"
                            >
                                <Trash className="w-4 h-4 mr-2 transition-all duration-200" weight="duotone" />
                                <span className="transition-colors duration-200">Delete</span>
                            </DropdownMenuItem>
                        )}
                    </motion.div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
} 