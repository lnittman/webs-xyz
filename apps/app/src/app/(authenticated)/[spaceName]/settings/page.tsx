'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { notFound } from 'next/navigation';
import { useSpaces } from '@/hooks/spaces';
import { currentSpaceIdAtom, currentSpaceAtom } from '@/atoms/spaces';

interface SpaceSettingsPageProps {
    params: Promise<{
        spaceName: string;
    }>;
}

export default function SpaceSettingsPage({ params }: SpaceSettingsPageProps) {
    const [spaceName, setSpaceName] = useState<string | null>(null);
    const { spaces } = useSpaces();

    const [currentSpaceId, setCurrentSpaceId] = useAtom(currentSpaceIdAtom);
    const [currentSpace, setCurrentSpace] = useAtom(currentSpaceAtom);

    // Extract spaceName from params
    useEffect(() => {
        params.then(({ spaceName }) => setSpaceName(spaceName));
    }, [params]);

    // Find and set current space when spaceName is available
    useEffect(() => {
        if (spaceName && spaces.length > 0) {
            const decodedSpaceName = spaceName.replace(/-/g, ' ');
            const space = spaces.find(s =>
                s.name.toLowerCase() === decodedSpaceName.toLowerCase()
            );

            if (space) {
                setCurrentSpaceId(space.id);
                setCurrentSpace(space);
            } else {
                notFound();
            }
        }
    }, [spaceName, spaces, setCurrentSpaceId, setCurrentSpace]);

    if (!spaceName || !currentSpace) {
        return <div className="flex-1" />;
    }

    return (
        <div className="flex-1 py-8">
            <div className="w-full flex justify-center">
                <div className="w-full max-w-4xl px-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage settings for <span className="font-mono">{currentSpace.name}</span> space
                        </p>
                    </div>

                    <div className="border border-border rounded-lg p-8 text-center">
                        <div className="text-muted-foreground">
                            ⚙️ Space settings coming soon...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 