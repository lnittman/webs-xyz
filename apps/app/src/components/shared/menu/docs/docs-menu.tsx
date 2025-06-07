"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Book,
    ArrowUpRight
} from "@phosphor-icons/react/dist/ssr";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/design/components/ui/dropdown-menu";
import { cn } from "@repo/design/lib/utils";

interface DocLink {
    id: string;
    title: string;
    description: string;
    url: string;
}

const docLinks: DocLink[] = [
    {
        id: '1',
        title: 'Documentation',
        description: 'Complete guide and API reference',
        url: 'https://docs.example.com'
    },
    {
        id: '2',
        title: 'Changelog',
        description: 'Latest updates and releases',
        url: 'https://changelog.example.com'
    },
    {
        id: '3',
        title: 'Help Center',
        description: 'Support articles and tutorials',
        url: 'https://help.example.com'
    }
];

export function DocsMenu() {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLinkClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setMenuOpen(false);
    };

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 bg-transparent text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200",
                        "hover:bg-accent hover:text-foreground hover:border-foreground/20",
                        "focus:outline-none",
                        menuOpen ? "bg-accent/80 text-foreground border-foreground/30" : ""
                    )}
                    aria-label="Documentation"
                >
                    <Book className="w-4 h-4" weight="duotone" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className={cn(
                    "w-[240px] p-0 bg-popover border-border/50 rounded-lg font-mono overflow-hidden"
                )}
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
                >
                    {/* Doc links */}
                    <div className="py-1 space-y-1">
                        {docLinks.map((link, index) => (
                            <React.Fragment key={link.id}>
                                <DropdownMenuItem
                                    onClick={() => handleLinkClick(link.url)}
                                    className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-sm text-foreground transition-colors duration-200">
                                            {link.title}
                                        </span>
                                        <ArrowUpRight className="w-4 h-4 ml-2 flex-shrink-0 transition-all duration-200" weight="duotone" />
                                    </div>
                                </DropdownMenuItem>
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 