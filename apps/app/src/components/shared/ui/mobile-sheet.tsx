"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@repo/design/lib/utils";

interface MobileSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    showCloseButton?: boolean;
    position?: 'top' | 'bottom';
    spacing?: 'sm' | 'md' | 'lg'; // sm=10px, md=18px, lg=26px from all edges
    children: React.ReactNode;
    className?: string;
    contentHeight?: 'auto' | 'fill'; // 'auto' for feedback, 'fill' for notifications
}

// Hook to auto-close mobile overlays when transitioning to desktop
function useAutoCloseOnDesktop(isOpen: boolean, onClose: () => void) {
    useEffect(() => {
        if (!isOpen) return;

        const handleResize = () => {
            // Close immediately if screen becomes larger than mobile breakpoint (640px)
            if (window.innerWidth >= 640) {
                onClose();
            }
        };

        window.addEventListener('resize', handleResize);

        // Check immediately in case we're already on desktop
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen, onClose]);
}

export function MobileSheet({
    isOpen,
    onClose,
    title,
    showCloseButton = false,
    position = 'bottom',
    spacing = 'lg',
    children,
    className,
    contentHeight = 'auto'
}: MobileSheetProps) {
    // Auto-close when transitioning to desktop
    useAutoCloseOnDesktop(isOpen, onClose);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Define spacing values
    const getSpacingClass = () => {
        const horizontalSpacing = spacing === 'sm' ? 'left-2.5 right-2.5' :
            spacing === 'md' ? 'left-4.5 right-4.5' : 'left-6.5 right-6.5';

        const verticalSpacing = position === 'top'
            ? (spacing === 'sm' ? 'top-2.5' : spacing === 'md' ? 'top-4.5' : 'top-6.5')
            : (spacing === 'sm' ? 'bottom-2.5' : spacing === 'md' ? 'bottom-4.5' : 'bottom-6.5');

        return `${horizontalSpacing} ${verticalSpacing}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-md"
                    onClick={handleBackdropClick}
                >
                    {/* Sheet content - positioned from top or bottom */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: position === 'top' ? -50 : 50
                        }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                            opacity: 0,
                            y: position === 'top' ? -50 : 50
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            mass: 0.8
                        }}
                        className={cn(
                            "absolute",
                            getSpacingClass()
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={cn(
                            "bg-background border border-border rounded-2xl shadow-2xl font-mono overflow-hidden",
                            className
                        )}>
                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                    {title && (
                                        <h2 className="text-lg font-medium text-foreground">
                                            {title}
                                        </h2>
                                    )}
                                    {showCloseButton && (
                                        <button
                                            onClick={onClose}
                                            className={cn(
                                                "h-8 w-8 bg-muted/20 text-muted-foreground flex items-center justify-center rounded-lg border border-border transition-all duration-200",
                                                "hover:bg-muted/40 hover:text-foreground hover:border-foreground/20",
                                                "focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                            )}
                                            aria-label="Close"
                                        >
                                            <X className="w-4 h-4" weight="duotone" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className={cn(
                                contentHeight === 'fill' ? "h-[70vh]" : "max-h-[60vh]",
                                "overflow-y-auto"
                            )}>
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 