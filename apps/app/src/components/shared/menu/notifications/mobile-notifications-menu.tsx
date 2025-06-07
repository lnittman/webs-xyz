"use client";

import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { Lightning } from "@phosphor-icons/react/dist/ssr";
import { useAuth } from "@repo/auth/client";
import { cn } from "@repo/design/lib/utils";
import { Skeleton } from "@repo/design/components/ui/skeleton";
import { mobileNotificationsOpenAtom } from "@/atoms/mobile-menu";

interface MobileNotificationsMenuProps {
    onNavigate?: (path: string) => void;
}

// Skeleton component for the mobile notifications button
function MobileNotificationsSkeleton() {
    return (
        <div className="h-8 w-8 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
}

// Main mobile notifications menu content component
function MobileNotificationsMenuContent({ onNavigate }: MobileNotificationsMenuProps) {
    const { isLoaded } = useAuth();
    const [isOpen, setIsOpen] = useAtom(mobileNotificationsOpenAtom);

    const handleOpen = () => {
        setIsOpen(true);
    };

    if (!isLoaded) {
        return <MobileNotificationsSkeleton />;
    }

    return (
        <button
            onClick={handleOpen}
            className={cn(
                "relative h-8 w-8 bg-transparent text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200",
                "hover:bg-accent hover:text-foreground hover:border-foreground/20",
                "focus:outline-none",
                isOpen ? "bg-accent/80 text-foreground border-foreground/30" : ""
            )}
            aria-label="Notifications"
        >
            <Lightning className="w-4 h-4" weight="duotone" />
            {/* Unread count badge - will be handled by the content component */}
        </button>
    );
}

// Main exported component with Suspense wrapper
export function MobileNotificationsMenu({ onNavigate }: MobileNotificationsMenuProps) {
    return (
        <Suspense fallback={<MobileNotificationsSkeleton />}>
            <MobileNotificationsMenuContent onNavigate={onNavigate} />
        </Suspense>
    );
} 