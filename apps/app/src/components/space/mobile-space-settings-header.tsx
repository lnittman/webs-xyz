'use client';

import { useRouter, useParams } from 'next/navigation';
import { CaretLeft } from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';

interface MobileSpaceSettingsHeaderProps {
    title: string;
}

export function MobileSpaceSettingsHeader({ title }: MobileSpaceSettingsHeaderProps) {
    const router = useRouter();
    const params = useParams();
    const spaceName = params.spaceName as string;

    const handleBack = () => {
        router.push(`/${spaceName}/settings`);
    };

    return (
        <div className="sm:hidden flex items-center gap-3 p-4 border-b border-border">
            <button
                onClick={handleBack}
                className={cn(
                    "h-8 w-8 flex items-center justify-center transition-all duration-200 rounded-md border select-none",
                    "bg-accent/5 border-accent/50 text-muted-foreground",
                    "hover:bg-accent/40 hover:text-accent-foreground hover:border-accent/50",
                    "focus:outline-none"
                )}
                aria-label="Back to space settings"
            >
                <CaretLeft className="w-3 h-3" weight="duotone" />
            </button>
            <h1 className="text-lg font-semibold">{title}</h1>
        </div>
    );
} 