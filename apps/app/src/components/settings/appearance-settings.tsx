'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Check, TextAa } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';
import { useUserSettings } from '@/hooks/user-settings/queries';
import { updateUserSettings } from '@/app/actions/user-settings';
import { fonts, applyFont } from '@/lib/fonts';
import type { UserSettings } from '@/types/user-settings';
import { MobileSettingsHeader } from './mobile-settings-header';

export function AppearanceSettings() {
    const { settings, isLoading, mutate } = useUserSettings();
    const [currentFont, setCurrentFont] = useState<string | null>(null);
    const isInitialMount = useRef(true);

    // Initialize current font from localStorage first, then sync with server
    useEffect(() => {
        // Get the current font from localStorage (this is what's actually applied)
        const savedFont = localStorage.getItem('preferred-font');
        if (savedFont) {
            setCurrentFont(savedFont);
        }

        // After initial mount, allow animations
        setTimeout(() => {
            isInitialMount.current = false;
        }, 100);
    }, []);

    // Update current font when settings load from server
    useEffect(() => {
        if (settings?.fontFamily) {
            setCurrentFont(settings.fontFamily);
        }
    }, [settings?.fontFamily]);

    const handleFontChange = useCallback(async (fontId: string) => {
        if (!settings) return;

        // Apply font immediately for instant feedback
        applyFont(fontId);
        setCurrentFont(fontId);

        // Optimistic update
        const optimisticSettings: UserSettings = {
            ...settings,
            fontFamily: fontId,
            updatedAt: new Date().toISOString(),
        };

        await mutate(optimisticSettings, false);

        try {
            // Call server action
            const result = await updateUserSettings({ fontFamily: fontId });

            if ('error' in result) {
                // Revert font on error
                if (settings.fontFamily) {
                    applyFont(settings.fontFamily);
                    setCurrentFont(settings.fontFamily);
                }
                throw new Error(result.error);
            }

            // Update with the server response data
            await mutate(result.data, false);
        } catch (error) {
            // Revert on error
            await mutate();
            console.error('Failed to update font:', error);
        }
    }, [settings, mutate]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <MobileSettingsHeader title="Appearance" />
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-20 bg-muted rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mobile header with back button */}
            <MobileSettingsHeader title="Appearance" />

            <div className="space-y-6">
                {/* Font Selection */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <TextAa size={16} weight="duotone" className="text-muted-foreground" />
                        <h3 className="text-sm font-medium font-mono">Font Family</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {fonts.map((font) => {
                            // Use currentFont state which is synced with localStorage
                            const isSelected = currentFont === font.id;

                            return (
                                <button
                                    key={font.id}
                                    onClick={() => handleFontChange(font.id)}
                                    disabled={isLoading}
                                    className={cn(
                                        "relative flex items-center justify-between p-4 border rounded-lg text-left hover:border-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed",
                                        // Only apply transition if not initial mount
                                        !isInitialMount.current && "transition-all duration-200",
                                        isSelected
                                            ? "border-foreground/30 bg-accent/50"
                                            : "border-border hover:bg-accent/30"
                                    )}
                                >
                                    <div className="space-y-1">
                                        <div className={cn("text-sm font-medium", font.className)}>
                                            {font.name}
                                        </div>
                                        <div className={cn("text-xs text-muted-foreground", font.className)}>
                                            The quick brown fox jumps over the lazy dog 0123456789
                                        </div>
                                    </div>
                                    <Check
                                        size={16}
                                        weight="duotone"
                                        className={cn(
                                            "text-green-600",
                                            // Only apply transition if not initial mount
                                            !isInitialMount.current && "transition-opacity duration-200",
                                            isSelected ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
} 