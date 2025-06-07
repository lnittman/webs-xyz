"use client";

import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { Book } from "@phosphor-icons/react/dist/ssr";
import { useAuth } from "@repo/auth/client";
import { cn } from "@repo/design/lib/utils";
import { Skeleton } from "@repo/design/components/ui/skeleton";
import { mobileDocsOpenAtom } from "@/atoms/mobile-menu";

// Skeleton component for the mobile docs menu button
function MobileDocsMenuSkeleton() {
    return (
        <div className="h-8 w-8 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
}

// Main mobile docs menu content component
function MobileDocsMenuContent() {
    const { isLoaded } = useAuth();
    const [isOpen, setIsOpen] = useAtom(mobileDocsOpenAtom);

    const handleOpen = () => {
        setIsOpen(true);
    };

    if (!isLoaded) {
        return <MobileDocsMenuSkeleton />;
    }

    return (
        <button
            onClick={handleOpen}
            className={cn(
                "h-8 w-8 bg-transparent text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200",
                "hover:bg-accent hover:text-foreground hover:border-foreground/20",
                "focus:outline-none",
                isOpen ? "bg-accent/80 text-foreground border-foreground/30" : ""
            )}
            aria-label="Documentation"
        >
            <Book className="w-4 h-4" weight="duotone" />
        </button>
    );
}

// Main exported component with Suspense wrapper
export function MobileDocsMenu() {
    return (
        <Suspense fallback={<MobileDocsMenuSkeleton />}>
            <MobileDocsMenuContent />
        </Suspense>
    );
} 