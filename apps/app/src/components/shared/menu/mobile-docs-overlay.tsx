"use client";

import React, { Suspense } from "react";
import { useAtom } from "jotai";
import {
    Book,
    ArrowUpRight
} from "@phosphor-icons/react/dist/ssr";
import { useAuth } from "@repo/auth/client";
import { MobileSheet } from "@/components/shared/ui/mobile-sheet";
import { mobileDocsOpenAtom } from "@/atoms/mobile-menu";

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

// Main mobile docs overlay content component
function MobileDocsOverlayContent() {
    const { isLoaded } = useAuth();
    const [isOpen, setIsOpen] = useAtom(mobileDocsOpenAtom);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleLinkClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <MobileSheet
            isOpen={isOpen}
            onClose={handleClose}
            title="Documentation"
        >
            <div className="p-6">
                {docLinks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mb-6">
                            <Book className="w-10 h-10 text-muted-foreground/50" weight="duotone" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No documentation available</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-xs">
                            Documentation links will appear here when available.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {docLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => handleLinkClick(link.url)}
                                className="w-full p-4 bg-muted/20 rounded-lg transition-all duration-200 hover:bg-muted/40 text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-base font-medium text-foreground">
                                                {link.title}
                                            </span>
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {link.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </MobileSheet>
    );
}

// Main exported component with Suspense wrapper
export function MobileDocsOverlay() {
    return (
        <Suspense fallback={null}>
            <MobileDocsOverlayContent />
        </Suspense>
    );
} 