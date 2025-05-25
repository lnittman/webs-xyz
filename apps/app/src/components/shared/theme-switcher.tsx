"use client";

import React from "react";
import { Moon, Sun, Desktop } from "@phosphor-icons/react/dist/ssr";
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "@repo/design/components/ui/tabs";
import { cn } from "@repo/design/lib/utils";

export function ThemeSwitcher() {
    const { setTheme: setNextTheme, theme } = useTheme();

    const handleThemeChange = (value: string) => {
        setNextTheme(value);
    };

    return (
        <Tabs
            defaultValue={theme}
            value={theme}
            onValueChange={handleThemeChange}
            className="w-fit"
        >
            <TabsList className="bg-muted/50 border border-border w-fit h-8 p-0.5 grid grid-cols-3 gap-0.5 rounded-lg">
                <TabsTrigger
                    value="light"
                    className="h-full w-7 px-0 transition-all duration-200 hover:bg-background/80 focus:outline-none flex items-center justify-center rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground"
                    title="Light theme"
                >
                    <Sun
                        weight="duotone"
                        className="h-3.5 w-3.5"
                    />
                </TabsTrigger>
                <TabsTrigger
                    value="dark"
                    className="h-full w-7 px-0 transition-all duration-200 hover:bg-background/80 focus:outline-none flex items-center justify-center rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground"
                    title="Dark theme"
                >
                    <Moon
                        weight="duotone"
                        className="h-3.5 w-3.5"
                    />
                </TabsTrigger>
                <TabsTrigger
                    value="system"
                    className="h-full w-7 px-0 transition-all duration-200 hover:bg-background/80 focus:outline-none flex items-center justify-center rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground"
                    title="System theme"
                >
                    <Desktop
                        weight="duotone"
                        className="h-3.5 w-3.5"
                    />
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
} 