"use client";

import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { useAuth } from "@repo/auth/client";
import { MobileSheet } from "@/components/shared/ui/mobile-sheet";
import { mobileNotificationsOpenAtom } from "@/atoms/mobile-menu";
import { MobileNotificationsContent } from "@repo/notifications/components/mobile-content";

interface MobileNotificationsOverlayProps {
    onNavigate?: (path: string) => void;
}

// Main mobile notifications overlay content component
function MobileNotificationsOverlayContent({ onNavigate }: MobileNotificationsOverlayProps) {
    const { isLoaded } = useAuth();
    const [isOpen, setIsOpen] = useAtom(mobileNotificationsOpenAtom);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        if (onNavigate) {
            onNavigate(path);
        }
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <MobileSheet
            isOpen={isOpen}
            onClose={handleClose}
            title="Notifications"
            showCloseButton={true}
            spacing="sm"
            className="h-[70vh]"
        >
            <MobileNotificationsContent onNavigate={handleNavigate} />
        </MobileSheet>
    );
}

// Main exported component with Suspense wrapper
export function MobileNotificationsOverlay({ onNavigate }: MobileNotificationsOverlayProps) {
    return (
        <Suspense fallback={null}>
            <MobileNotificationsOverlayContent onNavigate={onNavigate} />
        </Suspense>
    );
} 