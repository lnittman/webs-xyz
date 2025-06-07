"use client";

import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { useAuth } from "@repo/auth/client";
import { cn } from "@repo/design/lib/utils";
import { Skeleton } from "@repo/design/components/ui/skeleton";
import { mobileSpacesOpenAtom } from "@/atoms/mobile-menu";

interface MobileSpacesMenuProps {
    currentSpaceId?: string | null;
    onNavigate?: (path: string) => void;
    onCreateSpace?: () => void;
}

// Skeleton component for the mobile spaces menu button
function MobileSpacesMenuSkeleton() {
    return (
        <div className="h-8 w-8 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-md" />
        </div>
    );
}

// Main mobile spaces menu content component
function MobileSpacesMenuContent({ currentSpaceId, onNavigate, onCreateSpace }: MobileSpacesMenuProps) {
    const { isLoaded } = useAuth();
    const [isOpen, setIsOpen] = useAtom(mobileSpacesOpenAtom);

    const handleOpen = () => {
        setIsOpen(true);
    };

    if (!isLoaded) {
        return <MobileSpacesMenuSkeleton />;
    }

    return (
        <button
            onClick={handleOpen}
            className={cn(
                "h-8 w-8 flex items-center justify-center transition-all duration-200 rounded-md border select-none",
                "bg-accent/5 border-accent/50 text-muted-foreground",
                "hover:bg-accent/40 hover:text-accent-foreground hover:border-accent/50",
                "focus:outline-none",
                isOpen ? "bg-accent/50 border-accent/50 text-accent-foreground" : ""
            )}
            aria-label="Spaces and webs"
        >
            <CaretDown className="w-3 h-3" weight="duotone" />
        </button>
    );
}

// Main exported component with Suspense wrapper
export function MobileSpacesMenu({ currentSpaceId, onNavigate, onCreateSpace }: MobileSpacesMenuProps) {
    return (
        <Suspense fallback={<MobileSpacesMenuSkeleton />}>
            <MobileSpacesMenuContent
                currentSpaceId={currentSpaceId}
                onNavigate={onNavigate}
                onCreateSpace={onCreateSpace}
            />
        </Suspense>
    );
} 