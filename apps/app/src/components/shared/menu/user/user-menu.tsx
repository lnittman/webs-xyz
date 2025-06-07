"use client";

import React, { useState, Suspense, useEffect } from "react";

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
  CaretUpDown,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useTransitionRouter } from "next-view-transitions";
import { useIsMobile } from '@repo/design/hooks/use-mobile';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/design/components/ui/dropdown-menu";
import { Skeleton } from "@repo/design/components/ui/skeleton";
import { cn } from "@repo/design/lib/utils";

// Skeleton component for the user menu button
function UserMenuSkeleton() {
    return (
        <div className="h-8 w-8 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    );
}

// Theme selector component that prevents hydration issues
function ThemeSelector() {
    const { setTheme: setNextTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Ensure we only render after hydration to prevent SSR mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleThemeChange = (value: string) => {
        setNextTheme(value);
    };

    // Don't render the active states until mounted (prevents hydration mismatch)
    if (!mounted) {
        return (
            <div className="flex items-center justify-between px-3 py-1.5 text-sm transition-all duration-200">
                <div className="flex items-center gap-2">
                    <span className="transition-colors duration-200">Theme</span>
                </div>
                <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-md transition-all duration-200">
                    <button
                        className="p-1 rounded transition-all duration-200 text-muted-foreground"
                        title="Light theme"
                    >
                        <Sun size={14} weight="duotone" />
                    </button>
                    <button
                        className="p-1 rounded transition-all duration-200 text-muted-foreground"
                        title="Dark theme"
                    >
                        <Moon size={14} weight="duotone" />
                    </button>
                    <button
                        className="p-1 rounded transition-all duration-200 text-muted-foreground"
                        title="System theme"
                    >
                        <Desktop size={14} weight="duotone" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between px-3 py-1.5 text-sm transition-all duration-200">
            <div className="flex items-center gap-2">
                <span className="transition-colors duration-200">Theme</span>
            </div>
            <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-md transition-all duration-200">
                <button
                    onClick={() => handleThemeChange('light')}
                    className={cn(
                        "p-1 rounded transition-all duration-200",
                        theme === 'light'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Light theme"
                >
                    <Sun size={14} weight="duotone" />
                </button>
                <button
                    onClick={() => handleThemeChange('dark')}
                    className={cn(
                        "p-1 rounded transition-all duration-200",
                        theme === 'dark'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Dark theme"
                >
                    <Moon size={14} weight="duotone" />
                </button>
                <button
                    onClick={() => handleThemeChange('system')}
                    className={cn(
                        "p-1 rounded transition-all duration-200",
                        theme === 'system'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    title="System theme"
                >
                    <Desktop size={14} weight="duotone" />
                </button>
            </div>
        </div>
    );
}

// Main user menu content component
function UserMenuContent() {
    const { isLoaded } = useAuth();
    const { user } = useUser();

    const router = useTransitionRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu when transitioning to mobile to prevent UI issues
    const isMobile = useIsMobile();
    useEffect(() => {
        if (menuOpen && isMobile) {
            setMenuOpen(false);
        }
    }, [menuOpen, isMobile]);

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
        setMenuOpen(false);
        router.push('/account/settings');
    };

    // Navigate to dashboard
    const handleOpenDashboard = () => {
        setMenuOpen(false);
        router.push('/');
    };

    if (!isLoaded) {
        return <UserMenuSkeleton />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "h-8 w-8 bg-transparent text-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 border border-border transition-all duration-200 rounded-full",
                            "hover:bg-accent hover:border-foreground/20",
                            "focus:outline-none select-none",
                            menuOpen ? "bg-accent/80 border-foreground/30" : ""
                        )}
                    >
                        {initials}
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    className={cn(
                        "w-[240px] p-0 bg-popover border-border/50 rounded-lg font-mono overflow-hidden"
                    )}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            mass: 0.8
                        }}
                    >
                        {/* User info section */}
                        <div className="px-3 py-2.5">
                            <p className="text-sm font-medium text-foreground truncate">{user?.fullName || user?.firstName || "User"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
                        </div>

                        <DropdownMenuSeparator className="my-0" />

                        {/* Main menu items */}
                        <div className="py-1 space-y-1">
                            <DropdownMenuItem
                                onClick={handleOpenDashboard}
                                className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                            >
                                <span className="transition-colors duration-200">Dashboard</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={handleOpenSettings}
                                className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                            >
                                <span className="transition-colors duration-200">Account Settings</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                            >
                                <span className="transition-colors duration-200">Create Space</span>
                                <div className="ml-auto">
                                    <Plus className="w-3 h-3 transition-all duration-200" weight="duotone" />
                                </div>
                            </DropdownMenuItem>
                        </div>

                        <DropdownMenuSeparator className="my-0" />

                        {/* Command menu and theme section */}
                        <div className="py-1 space-y-1">
                            <DropdownMenuItem
                                className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                            >
                                <span className="transition-colors duration-200">Command Menu</span>
                                <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded transition-all duration-200">⌘K</kbd>
                            </DropdownMenuItem>

                            {/* Theme selector - now using consistent component */}
                            <ThemeSelector />
                        </div>

                        <DropdownMenuSeparator className="my-0" />

                        {/* Bottom section - home page and log out without divider */}
                        <div className="py-1 space-y-1">
                            <DropdownMenuItem
                                className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                            >
                                <span className="transition-colors duration-200">Home Page</span>
                                <div className="ml-auto">
                                    <House className="w-4 h-4 transition-all duration-200" weight="duotone" />
                                </div>
                            </DropdownMenuItem>

                            <SignOutButton>
                                <DropdownMenuItem
                                    className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer transition-all duration-200"
                                >
                                    <span className="transition-colors duration-200">Log Out</span>
                                    <div className="ml-auto">
                                        <SignOut className="w-4 h-4 transition-all duration-200" weight="duotone" />
                                    </div>
                                </DropdownMenuItem>
                            </SignOutButton>
                        </div>

                        <DropdownMenuSeparator className="my-0" />

                        {/* Upgrade section */}
                        <div className="bg-muted/50 border-t border-border p-2 transition-all duration-200">
                            <button className="w-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 rounded-md px-3 py-1.5 text-sm font-medium">
                                Upgrade to Pro
                            </button>
                        </div>
                    </motion.div>
                </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
    );
}

// Main exported component with Suspense wrapper
export function UserMenu() {
    return (
        <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenuContent />
        </Suspense>
    );
} 