"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@repo/design/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@repo/design/components/ui/dropdown-menu';
import {
    DotsThree,
    Copy,
    Trash,
    Star,
    ShareNetwork,
    PencilSimple
} from '@phosphor-icons/react/dist/ssr';
import type { Web } from '@/types/dashboard';

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

    // Use external state if provided, otherwise use internal state
    const menuOpen = isOpen !== undefined ? isOpen : internalOpen;
    const setMenuOpen = onOpenChange || setInternalOpen;

    const handleMenuClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

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
                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer"
                            >
                                <PencilSimple className="w-4 h-4 mr-2" weight="duotone" />
                                <span>Rename</span>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(web.url);
                                toast.success('URL copied to clipboard!');
                            }}
                            className="rounded-md px-2 py-1.5 text-sm cursor-pointer"
                        >
                            <Copy className="w-4 h-4 mr-2" weight="duotone" />
                            <span>Copy URL</span>
                        </DropdownMenuItem>

                        {onShare && (
                            <DropdownMenuItem
                                onClick={() => onShare(web.id)}
                                disabled={!onShare}
                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer"
                            >
                                <ShareNetwork className="w-4 h-4 mr-2" weight="duotone" />
                                <span>Share</span>
                            </DropdownMenuItem>
                        )}

                        {onFavorite && (
                            <DropdownMenuItem
                                onClick={() => onFavorite(web.id)}
                                disabled={!onFavorite}
                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer"
                            >
                                <Star className="w-4 h-4 mr-2" weight="duotone" />
                                <span>Add to Favorites</span>
                            </DropdownMenuItem>
                        )}

                        {(onRename || onShare || onFavorite) && onDelete && <DropdownMenuSeparator className="my-1" />}

                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(web.id)}
                                disabled={!onDelete}
                                className="rounded-md px-2 py-1.5 text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-600/10"
                            >
                                <Trash className="w-4 h-4 mr-2" weight="duotone" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        )}
                    </motion.div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
} 