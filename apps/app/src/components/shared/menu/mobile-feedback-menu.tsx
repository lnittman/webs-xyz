"use client";

import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { useAuth } from "@repo/auth/client";
import { cn } from "@repo/design/lib/utils";
import { Skeleton } from "@repo/design/components/ui/skeleton";
import { mobileFeedbackOpenAtom } from "@/atoms/mobile-menu";

interface MobileFeedbackMenuProps {
    className?: string;
}

// Skeleton component for the mobile feedback button
function MobileFeedbackMenuSkeleton() {
    return (
        <div className="h-8 flex-shrink-0">
            <Skeleton className="h-8 w-20 rounded-md" />
        </div>
    );
}

// Main mobile feedback menu content component
function MobileFeedbackMenuContent({ className }: MobileFeedbackMenuProps) {
    const { isLoaded } = useAuth();
    const [isOpen, setIsOpen] = useAtom(mobileFeedbackOpenAtom);

    const handleOpen = () => {
        setIsOpen(true);
    };

    if (!isLoaded) {
        return <MobileFeedbackMenuSkeleton />;
    }

    return (
        <button
            onClick={handleOpen}
            className={cn(
                "flex h-8 items-center gap-2 px-3 py-1.5 text-sm font-medium font-mono text-muted-foreground hover:text-foreground transition-all duration-200 rounded-md border border-border hover:border-foreground/20 hover:bg-accent",
                "focus:outline-none",
                isOpen && "bg-accent/80 border-foreground/30 text-foreground",
                className
            )}
        >
            <span>Feedback</span>
        </button>
    );
}

// Main exported component with Suspense wrapper
export function MobileFeedbackMenu({ className }: MobileFeedbackMenuProps) {
    return (
        <Suspense fallback={<MobileFeedbackMenuSkeleton />}>
            <MobileFeedbackMenuContent className={className} />
        </Suspense>
    );
} 