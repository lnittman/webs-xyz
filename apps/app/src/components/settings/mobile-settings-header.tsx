'use client';

import React from 'react';
import { useTransitionRouter } from 'next-view-transitions';
import { CaretLeft } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';

interface MobileSettingsHeaderProps {
    title: string;
    className?: string;
}

export function MobileSettingsHeader({ title, className }: MobileSettingsHeaderProps) {
    const router = useTransitionRouter();

    const handleBack = () => {
        router.push('/account/settings');
    };

    return (
        <div className={cn("flex items-center gap-3 mb-6 sm:hidden", className)}>
            <button
                onClick={handleBack}
                className={cn(
                    "h-8 w-8 flex items-center justify-center transition-all duration-200 rounded-md border select-none",
                    "bg-accent/5 border-accent/50 text-muted-foreground",
                    "hover:bg-accent/40 hover:text-accent-foreground hover:border-accent/50",
                    "focus:outline-none"
                )}
                aria-label="Back to settings"
            >
                <CaretLeft className="w-3 h-3" weight="duotone" />
            </button>
            <h2 className="text-lg font-semibold font-mono">{title}</h2>
        </div>
    );
} 