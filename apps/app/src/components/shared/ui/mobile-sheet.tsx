"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@repo/design/lib/utils";

interface MobileSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    showCloseButton?: boolean;
    children: React.ReactNode;
    className?: string;
}

export function MobileSheet({
    isOpen,
    onClose,
    title,
    showCloseButton = false,
    children,
    className
}: MobileSheetProps) {
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
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
                    onClick={handleBackdropClick}
                >
                    {/* Bottom-aligned sheet content */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            mass: 0.8
                        }}
                        className="absolute bottom-8 left-6 right-6"
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
                                            className="h-8 w-8 bg-muted/50 text-muted-foreground flex items-center justify-center rounded-full border border-border transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
                                        >
                                            <X className="w-4 h-4" weight="duotone" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="max-h-[70vh] overflow-y-auto">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 