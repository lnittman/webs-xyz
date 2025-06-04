"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { loadingStateAtom } from "@/atoms/loading";

interface ProgressBarProps {
    className?: string;
}

export function ProgressBar({ className }: ProgressBarProps) {
    const [loadingState] = useAtom(loadingStateAtom);
    const [showProgressBar, setShowProgressBar] = useState(false);
    const [shouldAccelerate, setShouldAccelerate] = useState(false);
    const [shouldFadeOut, setShouldFadeOut] = useState(false);

    useEffect(() => {
        if (loadingState?.isLoading) {
            setShowProgressBar(true);
            setShouldAccelerate(false);
            setShouldFadeOut(false);
        } else if (loadingState && !loadingState.isLoading) {
            // Data has loaded, trigger acceleration to completion
            setShouldAccelerate(true);
        }
    }, [loadingState]);

    const handleAnimationComplete = () => {
        if (shouldAccelerate) {
            // Animation completed, trigger fade out
            setShouldFadeOut(true);
        }
    };

    const handleFadeComplete = () => {
        if (shouldFadeOut) {
            setShowProgressBar(false);
        }
    };

    if (!showProgressBar) return null;

    return (
        <AnimatePresence onExitComplete={handleFadeComplete}>
            <motion.div
                key="progress-bar"
                className="fixed bottom-0 left-0 right-0 z-50"
                initial={{ opacity: 1 }}
                animate={{ opacity: shouldFadeOut ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <div className="h-0.5 bg-border">
                    <motion.div
                        className="h-full bg-foreground"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: shouldAccelerate ? 0.25 : 1.5, // Faster acceleration
                            ease: shouldAccelerate ? "easeOut" : "easeInOut",
                        }}
                        onAnimationComplete={handleAnimationComplete}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
} 