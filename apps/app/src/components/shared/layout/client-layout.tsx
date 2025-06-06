'use client';

import { ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';

import { Navigation } from '@/components/shared/layout/navigation';
import { SearchModal } from '@/components/shared/modal/search-modal';
import { FontLoader } from '@/components/shared/font-loader';
import { ProgressBar } from '@/components/shared/layout/progress-bar';
import { useWebs } from '@/hooks/web/queries';
import { searchModalOpenAtom } from '@/atoms/search';

interface ClientLayoutProps {
    children: ReactNode;
    webTitle?: string;
    webId?: string;
}

export function ClientLayout({
    children,
    webTitle,
    webId
}: ClientLayoutProps) {
    const [isSearchModalOpen, setIsSearchModalOpen] = useAtom(searchModalOpenAtom);
    const { webs } = useWebs();

    // Handle command-k to open search modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchModalOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [setIsSearchModalOpen]);

    return (
        <div className="min-h-screen bg-background antialiased font-mono flex flex-col">
            <FontLoader />
            <Navigation webTitle={webTitle} webId={webId} />

            <main className="flex-1 flex flex-col pt-[104px]">
                {children}
            </main>

            {/* Global Search Modal */}
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                webs={webs || []}
            />

            {/* Global Progress Bar */}
            <ProgressBar />
        </div>
    );
} 