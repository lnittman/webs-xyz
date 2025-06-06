'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { notFound } from 'next/navigation';
import { Dashboard } from '@/components/dashboard';
import { useWebs } from '@/hooks/web/queries';
import { useCreateWeb } from '@/hooks/web/mutations';
import { useUserSettings } from '@/hooks/user-settings/queries';
import { useSpaces } from '@/hooks/spaces';
import { inputTextAtom } from '@/atoms/urls';
import { startLoadingAtom, stopLoadingAtom } from '@/atoms/loading';
import { currentSpaceIdAtom, currentSpaceAtom } from '@/atoms/spaces';

const LOADING_ID = 'space-dashboard';

interface SpacePageProps {
    params: Promise<{
        spaceName: string;
    }>;
}

export default function SpacePage({ params }: SpacePageProps) {
    const [spaceName, setSpaceName] = useState<string | null>(null);
    const { webs, isLoading } = useWebs();
    const { settings } = useUserSettings();
    const { spaces } = useSpaces();

    const { createWeb } = useCreateWeb();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedModelId, setSelectedModelId] = useState('claude-4-sonnet');

    const [, setInput] = useAtom(inputTextAtom);
    const [, startLoading] = useAtom(startLoadingAtom);
    const [, stopLoading] = useAtom(stopLoadingAtom);
    const [currentSpaceId, setCurrentSpaceId] = useAtom(currentSpaceIdAtom);
    const [currentSpace, setCurrentSpace] = useAtom(currentSpaceAtom);

    // Extract spaceName from params
    useEffect(() => {
        params.then(({ spaceName }) => setSpaceName(spaceName));
    }, [params]);

    // Find and set current space when spaceName is available
    useEffect(() => {
        if (spaceName && spaces.length > 0) {
            // Convert space name from URL format (kebab-case) to space name
            const decodedSpaceName = spaceName.replace(/-/g, ' ');
            const space = spaces.find(s =>
                s.name.toLowerCase() === decodedSpaceName.toLowerCase()
            );

            if (space) {
                setCurrentSpaceId(space.id);
                setCurrentSpace(space);
            } else {
                // Space not found, show 404
                notFound();
            }
        }
    }, [spaceName, spaces, setCurrentSpaceId, setCurrentSpace]);

    // Manage loading state with atoms
    useEffect(() => {
        if (isLoading) {
            startLoading(LOADING_ID);
        } else {
            stopLoading(LOADING_ID);
        }
    }, [isLoading, startLoading, stopLoading]);

    // Update selected model when user settings load
    useEffect(() => {
        if (settings?.defaultModel) {
            setSelectedModelId(settings.defaultModel);
        }
    }, [settings?.defaultModel]);

    const handleSubmit = async (input: string) => {
        if (!currentSpaceId) return;

        setIsSubmitting(true);
        try {
            // Extract all URLs from the input
            const urlRegex = /https?:\/\/[^\s]+/g;
            const urls = input.match(urlRegex) || [];

            // Extract prompt by removing all URLs
            const prompt = input.replace(urlRegex, '').trim() || undefined;

            if (urls.length === 0) {
                console.warn('No URLs found in input');
                return;
            }

            // Create web with multiple URLs and current space
            await createWeb({
                urls,
                prompt,
                url: urls[0] || '', // Primary URL for backward compatibility
                spaceId: currentSpaceId, // Pass current space ID
            });

            // Clear the prompt bar
            setInput('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModelChange = (modelId: string) => {
        setSelectedModelId(modelId);
    };

    // Filter webs to current space
    const filteredWebs = webs.filter(web => web.spaceId === currentSpaceId);

    // Show loading if we don't have spaceName yet or spaces are loading
    if (!spaceName || !currentSpace) {
        return <div className="flex-1" />; // Simple loading state
    }

    return (
        <Dashboard
            webs={filteredWebs}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onModelChange={handleModelChange}
            selectedModelId={selectedModelId}
        />
    );
} 