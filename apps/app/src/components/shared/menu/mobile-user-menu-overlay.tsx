"use client";

import React, { useState, Suspense } from "react";
import { SignOutButton, useAuth, useUser } from "@repo/auth/client";
import {
    SignOut,
    Gear,
    Moon,
    Sun,
    Desktop,
    House,
    Users,
    Command,
    Palette,
    Plus,
} from "@phosphor-icons/react/dist/ssr";
import { useTheme } from "next-themes";
import { useTransitionRouter } from "next-view-transitions";
import { useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@repo/design/lib/utils";
import { mobileUserMenuOpenAtom } from "@/atoms/mobile-menu";

// Theme selector component for mobile
function MobileThemeSelector() {
    const { setTheme: setNextTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleThemeChange = (value: string) => {
        setNextTheme(value);
    };

    if (!mounted) {
        return (
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-muted-foreground" weight="duotone" />
                    <span className="text-base">Theme</span>
                </div>
                <div className="flex items-center gap-1 bg-background p-1 rounded-md">
                    <button className="p-2 rounded text-muted-foreground">
                        <Sun size={16} weight="duotone" />
                    </button>
                    <button className="p-2 rounded text-muted-foreground">
                        <Moon size={16} weight="duotone" />
                    </button>
                    <button className="p-2 rounded text-muted-foreground">
                        <Desktop size={16} weight="duotone" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-muted-foreground" weight="duotone" />
                <span className="text-base">Theme</span>
            </div>
            <div className="flex items-center gap-1 bg-background p-1 rounded-md">
                <button
                    onClick={() => handleThemeChange('light')}
                    className={cn(
                        "p-2 rounded transition-all duration-200",
                        theme === 'light'
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Light theme"
                >
                    <Sun size={16} weight="duotone" />
                </button>
                <button
                    onClick={() => handleThemeChange('dark')}
                    className={cn(
                        "p-2 rounded transition-all duration-200",
                        theme === 'dark'
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Dark theme"
                >
                    <Moon size={16} weight="duotone" />
                </button>
                <button
                    onClick={() => handleThemeChange('system')}
                    className={cn(
                        "p-2 rounded transition-all duration-200",
                        theme === 'system'
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    title="System theme"
                >
                    <Desktop size={16} weight="duotone" />
                </button>
            </div>
        </div>
    );
}

// Main mobile user menu overlay content component
function MobileUserMenuOverlayContent() {
    const { isLoaded } = useAuth();
    const { user } = useUser();
    const router = useTransitionRouter();
    const [isOpen, setIsOpen] = useAtom(mobileUserMenuOpenAtom);

    // Get user initials for avatar fallback
    const initials = user?.fullName
        ? user.fullName
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || "?";

    // Navigate to settings page
    const handleOpenSettings = () => {
        setIsOpen(false);
        router.push('/settings');
    };

    // Navigate to dashboard
    const handleOpenDashboard = () => {
        setIsOpen(false);
        router.push('/');
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isLoaded) {
        return null;
    }

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
                    {/* Bottom-aligned menu content */}
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
                        <div className="bg-background border border-border rounded-2xl shadow-2xl p-6 font-mono">
                            {/* User info */}
                            <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-foreground text-background flex items-center justify-center text-base font-medium rounded-full">
                                        {initials}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-lg font-medium text-foreground">
                                            {user?.fullName || user?.firstName || "User"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {user?.emailAddresses?.[0]?.emailAddress}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu items */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={handleOpenDashboard}
                                    className="w-full flex items-center gap-4 p-4 bg-muted/20 rounded-lg transition-all duration-200 hover:bg-muted/40"
                                >
                                    <House className="w-5 h-5 text-muted-foreground" weight="duotone" />
                                    <span className="text-base">Dashboard</span>
                                </button>

                                <button
                                    onClick={handleOpenSettings}
                                    className="w-full flex items-center gap-4 p-4 bg-muted/20 rounded-lg transition-all duration-200 hover:bg-muted/40"
                                >
                                    <Gear className="w-5 h-5 text-muted-foreground" weight="duotone" />
                                    <span className="text-base">Account Settings</span>
                                </button>

                                <button
                                    className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-lg transition-all duration-200 hover:bg-muted/40"
                                >
                                    <div className="flex items-center gap-4">
                                        <Users className="w-5 h-5 text-muted-foreground" weight="duotone" />
                                        <span className="text-base">Create Team</span>
                                    </div>
                                    <Plus className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                </button>

                                <button
                                    className="w-full flex items-center justify-between p-4 bg-muted/20 rounded-lg transition-all duration-200 hover:bg-muted/40"
                                >
                                    <div className="flex items-center gap-4">
                                        <Command className="w-5 h-5 text-muted-foreground" weight="duotone" />
                                        <span className="text-base">Command Menu</span>
                                    </div>
                                    <kbd className="text-sm bg-background px-2 py-1 rounded">⌘K</kbd>
                                </button>
                            </div>

                            {/* Theme selector */}
                            <div className="mb-6">
                                <MobileThemeSelector />
                            </div>

                            {/* Sign out button */}
                            <SignOutButton>
                                <button className="w-full flex items-center gap-4 p-4 bg-red-500/10 text-red-600 rounded-lg transition-all duration-200 hover:bg-red-500/20 mb-6">
                                    <SignOut className="w-5 h-5" weight="duotone" />
                                    <span className="text-base">Sign Out</span>
                                </button>
                            </SignOutButton>

                            {/* Upgrade section */}
                            <button className="w-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 rounded-lg p-4 text-base font-medium">
                                Upgrade to Pro
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Main exported component with Suspense wrapper
export function MobileUserMenuOverlay() {
    return (
        <Suspense fallback={null}>
            <MobileUserMenuOverlayContent />
        </Suspense>
    );
} 