'use client';

import { useEffect } from 'react';
import { useUserSettings } from '@/hooks/user-settings';
import { applyFont } from '@/lib/fonts';

export function FontLoader() {
    const { settings } = useUserSettings();

    useEffect(() => {
        if (settings?.fontFamily) {
            applyFont(settings.fontFamily);
        }
    }, [settings?.fontFamily]);

    return null; // This component doesn't render anything
} 