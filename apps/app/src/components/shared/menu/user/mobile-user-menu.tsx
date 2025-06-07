"use client";

import React, { Suspense } from "react";
import { useAuth } from "@repo/auth/client";
import { X, List } from "@phosphor-icons/react/dist/ssr";
import { useAtom } from "jotai";
import { Skeleton } from "@repo/design/components/ui/skeleton";
import { cn } from "@repo/design/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
    const [isOpen, setIsOpen] = useAtom(mobileUserMenuOpenAtom);

    if (!isLoaded) {
        return <MobileUserMenuSkeleton />;
    }

    return (
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "h-8 w-8 bg-transparent text-muted-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 border border-border transition-all duration-200 rounded-full",
                "hover:bg-accent hover:text-foreground hover:border-foreground/20",
                "focus:outline-none",
                isOpen ? "bg-accent/80 text-foreground border-foreground/30" : ""
            )}
            aria-label="User menu"
        >
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="close"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <X className="w-4 h-4" weight="duotone" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                            <List className="w-4 h-4" weight="duotone" />
                    </motion.div>
                )}
            </AnimatePresence>
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