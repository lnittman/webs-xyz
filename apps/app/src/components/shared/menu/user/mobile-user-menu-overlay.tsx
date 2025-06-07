"use client";

import React, { useState, Suspense } from "react";
import { SignOutButton, useAuth, useUser } from "@repo/auth/client";
import {
    SignOut,
    ArrowUpRight,
    House,
    Gear,
    Plus,
} from "@phosphor-icons/react/dist/ssr";
import { useTransitionRouter } from "next-view-transitions";
import { useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@repo/design/lib/utils";
import { mobileUserMenuOpenAtom } from "@/atoms/mobile-menu";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";

interface DocLink {
    id: string;
    title: string;
    description: string;
    url: string;
}

const docLinks: DocLink[] = [
    {
        id: '1',
        title: 'Documentation',
        description: 'Complete guide and API reference',
        url: 'https://docs.example.com'
    },
    {
        id: '2',
        title: 'Changelog',
        description: 'Latest updates and releases',
        url: 'https://changelog.example.com'
    },
    {
        id: '3',
        title: 'Help Center',
        description: 'Support articles and tutorials',
        url: 'https://help.example.com'
    }
];

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
        router.push('/account/settings');
    };

    // Navigate to dashboard
    const handleOpenDashboard = () => {
        setIsOpen(false);
        router.push('/');
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleDocLinkClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    const handleContactClick = () => {
        // Add contact functionality here
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
                <>
                    {/* Full page solid overlay - positioned below navigation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-x-0 bottom-0 top-14 z-[60] bg-background"
                        onClick={handleBackdropClick}
                    />

                    {/* Menu content - positioned from top for finger friendliness */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.23, 1, 0.32, 1],
                            delay: 0.1
                        }}
                        className="fixed inset-x-0 top-14 z-[61] p-6 font-mono"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full max-w-md mx-auto space-y-6">
                            {/* User info */}
                            <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
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

                            {/* Primary action buttons with borders */}
                            <div className="space-y-3">
                                {/* Upgrade to Pro - moved to top */}
                                <button className="w-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 rounded-xl p-4 text-base font-medium">
                                    Upgrade to Pro
                                </button>

                                {/* Contact button */}
                                <button
                                    onClick={handleContactClick}
                                    className="w-full flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl transition-all duration-200 hover:bg-background/90 hover:border-border text-base font-medium"
                                >
                                    Contact
                                </button>
                            </div>

                            {/* Menu list items - no borders, no icons */}
                            <div className="space-y-1">
                                <button
                                    onClick={handleOpenDashboard}
                                    className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-background/50 text-base"
                                >
                                    <span>Dashboard</span>
                                    <House className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                </button>

                                <button
                                    onClick={handleOpenSettings}
                                    className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-background/50 text-base"
                                >
                                    <span>Account Settings</span>
                                    <Gear className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                </button>

                                <button
                                    className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-background/50 text-base"
                                >
                                    <span>Create Space</span>
                                    <Plus className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                </button>

                                <button
                                    className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-background/50 text-base"
                                >
                                    <span>Command Menu</span>
                                    <kbd className="text-sm bg-muted/50 px-2 py-1 rounded">⌘K</kbd>
                                </button>

                                {/* Theme selector */}
                                <div className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-background/50">
                                    <span className="text-base">Theme</span>
                                    <ThemeSwitcher />
                                </div>
                            </div>

                            {/* Documentation links - no borders, no icons */}
                            <div className="space-y-1 pt-3 border-t border-border/30">
                                <div className="px-4 py-2">
                                    <span className="text-sm font-medium text-muted-foreground">Resources</span>
                                </div>
                                {docLinks.map((link) => (
                                    <button
                                        key={link.id}
                                        onClick={() => handleDocLinkClick(link.url)}
                                        className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-background/50 text-base"
                                    >
                                        <span>{link.title}</span>
                                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                    </button>
                                ))}

                                <button
                                    className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-background/50 text-base"
                                >
                                    <span>Home page</span>
                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                </button>
                            </div>

                            {/* Sign out button - keep red styling */}
                            <div className="pt-3 border-t border-border/30">
                                <SignOutButton>
                                    <button className="w-full flex items-center gap-4 p-4 text-red-600 rounded-xl transition-all duration-200 hover:bg-red-500/10 text-base">
                                        <SignOut className="w-5 h-5" weight="duotone" />
                                        <span>Sign Out</span>
                                    </button>
                                </SignOutButton>
                            </div>
                        </div>
                    </motion.div>
                </>
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