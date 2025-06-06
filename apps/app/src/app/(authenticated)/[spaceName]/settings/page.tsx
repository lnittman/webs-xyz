'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { notFound } from 'next/navigation';
import { useSpaces } from '@/hooks/spaces';
import { currentSpaceIdAtom, currentSpaceAtom } from '@/atoms/spaces';
import { SpaceSettings } from '@/components/space/space-settings';

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

    return <SpaceSettings space={currentSpace} />;
} 