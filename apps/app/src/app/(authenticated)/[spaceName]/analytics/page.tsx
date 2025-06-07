'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { notFound } from 'next/navigation';
import { useSpaces } from '@/hooks/spaces';
import { currentSpaceIdAtom, currentSpaceAtom } from '@/atoms/spaces';

interface SpaceAnalyticsPageProps {
    params: Promise<{
        spaceName: string;
    }>;
}

export default function SpaceAnalyticsPage({ params }: SpaceAnalyticsPageProps) {
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

    // Update document title dynamically
    useEffect(() => {
        if (currentSpace?.name) {
            document.title = `${currentSpace.name} Analytics | webs`;
        }
    }, [currentSpace?.name]);

    if (!spaceName || !currentSpace) {
        return <div className="flex-1" />;
    }

    return (
        <div className="flex-1 py-8">
            <div className="w-full flex justify-center">
                <div className="w-full max-w-4xl px-6">
                    <div className="border border-border rounded-lg p-8 text-center">
                        <div className="text-muted-foreground">
                            📊 coming soon...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 