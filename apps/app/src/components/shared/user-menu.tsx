"use client";

import React, { useState } from "react";

import { SignOutButton, useAuth, useUser } from "@repo/auth/client";
import { SignOut, Gear, Moon, Sun, Desktop } from "@phosphor-icons/react";
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
import { Tabs, TabsList, TabsTrigger } from "@repo/design/components/ui/tabs";
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

    if (!isLoaded) return null;

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "h-8 w-8 bg-muted text-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 border border-border group-hover:border-foreground/30 transition-all duration-200 rounded-md",
                        "group-hover:bg-background",
                        menuOpen ? "bg-accent/40 border-foreground/20" : "border-border bg-background"
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
                    "min-w-[220px] bg-popover/95 backdrop-blur-sm border-border/20 rounded-lg font-mono"
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
                    <div className="px-3 py-2 mb-1 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{user?.fullName || user?.firstName || "User"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{user?.emailAddresses?.[0]?.emailAddress}</p>
                    </div>

                    <DropdownMenuItem
                        onClick={handleOpenSettings}
                        className="rounded-md mx-1"
                    >
                        <Gear className="w-4 h-4 mr-2" weight="duotone" />
                        <span>Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1.5" />

                    {/* Theme selector using Tabs component */}
                    <div className="p-1">
                        <Tabs
                            defaultValue={theme}
                            value={theme}
                            onValueChange={handleThemeChange}
                            className="flex flex-col"
                        >
                            <TabsList className="bg-muted w-full h-9 p-1 grid grid-cols-3 gap-1 relative rounded-lg">
                                <TabsTrigger
                                    value="light"
                                    className="h-full w-full transition-all duration-300 hover:bg-background/60 focus:outline-none flex items-center justify-center z-10 rounded-md"
                                >
                                    <Sun
                                        weight="duotone"
                                        className={cn(
                                            "h-4 w-4 transition-colors duration-300",
                                            theme === 'light' ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    />
                                </TabsTrigger>
                                <TabsTrigger
                                    value="dark"
                                    className="h-full w-full transition-all duration-300 hover:bg-background/60 focus:outline-none flex items-center justify-center z-10 rounded-md"
                                >
                                    <Moon
                                        weight="duotone"
                                        className={cn(
                                            "h-4 w-4 transition-colors duration-300",
                                            theme === 'dark' ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    />
                                </TabsTrigger>
                                <TabsTrigger
                                    value="system"
                                    className="h-full w-full transition-all duration-300 hover:bg-background/60 focus:outline-none flex items-center justify-center z-10 rounded-md"
                                >
                                    <Desktop
                                        weight="duotone"
                                        className={cn(
                                            "h-4 w-4 transition-colors duration-300",
                                            theme === 'system' ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <DropdownMenuSeparator className="my-1.5" />

                    <SignOutButton>
                        <DropdownMenuItem
                            variant="destructive"
                            className="rounded-md mx-1"
                        >
                            <SignOut className="w-4 h-4 mr-2" weight="duotone" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </SignOutButton>
                </motion.div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 