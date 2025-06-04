'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';

import { promptFocusedAtom } from '@/atoms/chat';
import { PromptBar } from '@/components/dashboard/prompt-bar';
import { ClientLayout } from '@/components/shared/layout/client-layout';
import { useDashboard } from '@/hooks/use-dashboard';
import type { Web } from '@/types/dashboard';

import { DashboardLayout } from './dashboard-layout';
import { NavigationToolbar } from './navigation-toolbar';

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

    const {
        filteredWebs,
        recentWebs,
        topDomains,
        processingCount
    } = useDashboard({ webs, searchQuery, activities: [] });

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
                activities={[]}
                recentWebs={recentWebs}
                topDomains={topDomains}
                selectedModelId={selectedModelId}
            />
        </ClientLayout>
    );
} 