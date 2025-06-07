"use client";

import React, { Suspense } from "react";
import { useAuth, useUser } from "@repo/auth/client";
import { List } from "@phosphor-icons/react/dist/ssr";
import { useAtom } from "jotai";
import { Skeleton } from "@repo/design/components/ui/skeleton";
import { cn } from "@repo/design/lib/utils";
import { mobileUserMenuOpenAtom } from "@/atoms/mobile-menu";

// Skeleton component for the mobile user menu button
function MobileUserMenuSkeleton() {
    return (
        <div className="h-8 w-8 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
}

// Main mobile user menu trigger component
function MobileUserMenuContent() {
    const { isLoaded } = useAuth();
    const { user } = useUser();
    const [isOpen, setIsOpen] = useAtom(mobileUserMenuOpenAtom);

    if (!isLoaded) {
        return <MobileUserMenuSkeleton />;
    }

    return (
        <button
            onClick={() => setIsOpen(true)}
            className={cn(
                "h-8 w-8 bg-transparent text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200",
                "hover:bg-accent hover:text-foreground hover:border-foreground/20",
                "focus:outline-none",
                isOpen ? "bg-accent/80 text-foreground border-foreground/30" : ""
            )}
            aria-label="User menu"
        >
            <List className="w-4 h-4" weight="duotone" />
        </button>
    );
}

// Main exported component with Suspense wrapper
export function MobileUserMenu() {
    return (
        <Suspense fallback={<MobileUserMenuSkeleton />}>
            <MobileUserMenuContent />
        </Suspense>
    );
} 