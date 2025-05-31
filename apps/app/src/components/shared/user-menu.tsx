"use client";

import React, { useState } from "react";

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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/design/components/ui/dropdown-menu";
import { cn } from "@repo/design/lib/utils";

export function UserMenu() {
    const { isLoaded } = useAuth();
    const { setTheme: setNextTheme, theme } = useTheme();
    const { user } = useUser();

    const router = useTransitionRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    // Get user initials for avatar fallback
    const initials = user?.fullName
        ? user.fullName
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || "?";

    const handleThemeChange = (value: string) => {
        setNextTheme(value);
    };

    // Navigate to settings page
    const handleOpenSettings = () => {
        setMenuOpen(false);
        router.push('/settings');
    };

    // Navigate to dashboard
    const handleOpenDashboard = () => {
        setMenuOpen(false);
        router.push('/');
    };

    if (!isLoaded) return null;

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 text-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 border border-border transition-all duration-200 rounded-md",
                        "hover:bg-accent hover:border-foreground/20",
                        "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 focus:ring-offset-background",
                        menuOpen ? "bg-accent border-foreground/20" : "bg-muted"
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
                    <div className="py-1">
                        <DropdownMenuItem
                            onClick={handleOpenDashboard}
                            className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer"
                        >
                            <House className="w-4 h-4 mr-2" weight="duotone" />
                            <span>Dashboard</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleOpenSettings}
                            className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer"
                        >
                            <Gear className="w-4 h-4 mr-2" weight="duotone" />
                            <span>Account Settings</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer"
                        >
                            <Users className="w-4 h-4 mr-2" weight="duotone" />
                            <span>Create Team</span>
                            <div className="ml-auto">
                                <Plus className="w-3 h-3" weight="duotone" />
                            </div>
                        </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-0" />

                    {/* Command menu and theme section */}
                    <div className="py-1">
                        <DropdownMenuItem
                            className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer"
                        >
                            <Command className="w-4 h-4 mr-2" weight="duotone" />
                            <span>Command Menu</span>
                            <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
                        </DropdownMenuItem>

                        {/* Theme selector - inline style */}
                        <div className="flex items-center justify-between px-3 py-1.5 text-sm">
                            <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4" weight="duotone" />
                                <span>Theme</span>
                            </div>
                            <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-md">
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
                    </div>

                    <DropdownMenuSeparator className="my-0" />

                    {/* Bottom section with different background */}
                    <div className="py-1">
                        <DropdownMenuItem
                            className="rounded-md mx-1 px-2 py-1.5 text-sm cursor-pointer"
                        >
                            <CaretUpDown className="w-4 h-4 mr-2" weight="duotone" />
                            <span>Home Page</span>
                        </DropdownMenuItem>
                    </div>

                    {/* Sign out section with subtle background */}
                    <div className="bg-muted/30 border-t border-border p-1">
                        <SignOutButton>
                            <DropdownMenuItem
                                className="rounded-md text-sm cursor-pointer px-2 py-1.5"
                            >
                                <SignOut className="w-4 h-4 mr-2" weight="duotone" />
                                <span>Log Out</span>
                            </DropdownMenuItem>
                        </SignOutButton>
                    </div>

                    {/* Upgrade section */}
                    <div className="bg-muted/50 border-t border-border p-2">
                        <button className="w-full bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200 rounded-md px-3 py-1.5 text-sm font-medium">
                            Upgrade to Pro
                        </button>
                    </div>
                </motion.div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 