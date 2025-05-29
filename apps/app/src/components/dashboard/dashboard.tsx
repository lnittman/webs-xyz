'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { PromptBar } from '@/components/shared/prompt-bar';
import { ClientLayout } from '@/components/shared/client-layout';
import { promptFocusedAtom } from '@/atoms/chat';
import { NavigationToolbar } from './navigation-toolbar';
import { DashboardLayout } from './dashboard-layout';
import { useDashboard } from '@/hooks/use-dashboard';
import { Globe, Sparkle, Clock } from '@phosphor-icons/react/dist/ssr';
import type { ProcessingActivity, Web } from '@/types/dashboard';

interface DashboardProps {
    webs?: Web[];
    onSubmit: (input: string) => Promise<void>;
    isSubmitting: boolean;
    onModelChange: (modelId: string) => void;
    selectedModelId: string;
}

export function Dashboard({
    webs,
    onSubmit,
    isSubmitting,
    onModelChange,
    selectedModelId
}: DashboardProps) {
    const [isPromptFocused, setIsPromptFocused] = useAtom(promptFocusedAtom);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock processing activities (in real app, this would come from a subscription/polling)
    const [processingActivities] = useState<ProcessingActivity[]>([
        {
            id: '1',
            type: 'processing',
            action: 'EXTRACTING CONTENT',
            target: 'github.com/vercel/next.js',
            timestamp: new Date(Date.now() - 1000 * 60 * 2),
            icon: Globe
        },
        {
            id: '2',
            type: 'completed',
            action: 'GENERATED SUMMARY',
            target: 'news.ycombinator.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            icon: Sparkle
        },
        {
            id: '3',
            type: 'queued',
            action: 'PENDING ANALYSIS',
            target: 'arxiv.org/papers/2024',
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            icon: Clock
        }
    ]);

    const {
        filteredWebs,
        recentWebs,
        topDomains,
        processingCount
    } = useDashboard({ webs, searchQuery, activities: processingActivities });

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <ClientLayout>
            {/* Command interface */}
            <div className="bg-card/50 border-b border-border">
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-4xl px-6 py-4">
                        <PromptBar
                            onSubmit={onSubmit}
                            isSubmitting={isSubmitting}
                            isFocused={isPromptFocused}
                            onFocusChange={setIsPromptFocused}
                            selectedModelId={selectedModelId}
                            onModelChange={onModelChange}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Toolbar */}
            <NavigationToolbar
                resultsCount={filteredWebs.length}
                processingCount={processingCount}
            />

            {/* Dashboard Layout */}
            <DashboardLayout
                webs={filteredWebs}
                searchQuery={searchQuery}
                onClearSearch={handleClearSearch}
                activities={processingActivities}
                recentWebs={recentWebs}
                topDomains={topDomains}
                selectedModelId={selectedModelId}
            />
        </ClientLayout>
    );
} 