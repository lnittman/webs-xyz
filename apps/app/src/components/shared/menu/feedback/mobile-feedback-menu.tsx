"use client";

import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { useAuth } from "@repo/auth/client";
import { cn } from "@repo/design/lib/utils";
import { Skeleton } from "@repo/design/components/ui/skeleton";
import { ChatCircle } from "@phosphor-icons/react/dist/ssr";
import { mobileFeedbackOpenAtom } from "@/atoms/mobile-menu";

interface MobileFeedbackMenuProps {
    className?: string;
    variant?: 'default' | 'circular';
}

// Skeleton component for the mobile feedback button
function MobileFeedbackMenuSkeleton({ variant = 'default' }: { variant?: 'default' | 'circular' }) {
    return (
        <div className={cn("flex-shrink-0", variant === 'circular' ? "h-8 w-8" : "h-8")}>
            <Skeleton className={cn(variant === 'circular' ? "h-8 w-8 rounded-full" : "h-8 w-20 rounded-md")} />
        </div>
    );
}

// Main mobile feedback menu content component
function MobileFeedbackMenuContent({ className, variant = 'default' }: MobileFeedbackMenuProps) {
    const { isLoaded } = useAuth();
    const [isOpen, setIsOpen] = useAtom(mobileFeedbackOpenAtom);

    const handleOpen = () => {
        setIsOpen(true);
    };

    if (!isLoaded) {
        return <MobileFeedbackMenuSkeleton variant={variant} />;
    }

    if (variant === 'circular') {
        return (
            <button
                onClick={handleOpen}
                className={cn(
                    "h-8 w-8 bg-transparent text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200",
                    "hover:bg-accent hover:text-foreground hover:border-foreground/20",
                    "focus:outline-none",
                    isOpen && "bg-accent/80 border-foreground/30 text-foreground",
                    className
                )}
                aria-label="Feedback"
            >
                <ChatCircle className="w-4 h-4" weight="duotone" />
            </button>
        );
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
export function MobileFeedbackMenu({ className, variant = 'default' }: MobileFeedbackMenuProps) {
    return (
        <Suspense fallback={<MobileFeedbackMenuSkeleton variant={variant} />}>
            <MobileFeedbackMenuContent className={className} variant={variant} />
        </Suspense>
    );
} 