'use client';

import { useEffect } from 'react';
import { useUserSettings } from '@/hooks/user-settings/queries';
import { applyFont } from '@/lib/fonts';

export function FontLoader() {
    const { settings, isLoading } = useUserSettings();

    useEffect(() => {
        // Only apply font after settings have loaded
        if (!isLoading && settings?.fontFamily) {
            console.log('[FontLoader] Settings loaded, font:', settings.fontFamily);

            // Check if localStorage differs from DB (user might have changed font on another device)
            const savedFont = localStorage.getItem('preferred-font');
            if (savedFont !== settings.fontFamily) {
                console.log('[FontLoader] Syncing font from DB:', settings.fontFamily, '(was:', savedFont, ')');
            }

        // Apply the font from database settings
            applyFont(settings.fontFamily);
        }
    }, [isLoading, settings?.fontFamily]);

    return null; // This component doesn't render anything
} 