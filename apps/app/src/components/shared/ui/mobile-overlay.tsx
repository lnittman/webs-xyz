"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@repo/design/lib/utils";

interface MobileOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showCloseButton?: boolean;
    className?: string;
}

export function MobileOverlay({
    isOpen,
    onClose,
    children,
    title,
    showCloseButton = true,
    className
}: MobileOverlayProps) {
    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                >
                    {/* Bottom sheet container */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            mass: 0.8
                        }}
                        className={cn(
                            "absolute bottom-0 left-0 right-0 bg-background border-t border-border shadow-2xl",
                            "rounded-t-2xl max-h-[85vh] overflow-hidden",
                            className
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
                        </div>

                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                                {title && (
                                    <h2 className="text-lg font-medium text-foreground">{title}</h2>
                                )}
                                {!title && <div />}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="h-8 w-8 bg-muted/50 text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
                                        aria-label="Close"
                                    >
                                        <X className="w-4 h-4" weight="duotone" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 