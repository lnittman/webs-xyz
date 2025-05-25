'use client';

import { ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Navigation } from './navigation';
import { SearchModal } from './search-modal';
import { FontLoader } from './font-loader';
import { useWebs } from '@/hooks/code/web/queries';
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

            {/* Global Search Modal */}
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                webs={webs || []}
            />

            <main className="flex-1 flex flex-col pt-14">
                {children}
            </main>

            {/* Terminal scanline effect
            <div className="terminal-scanlines" aria-hidden="true" />
            */}
        </div>
    );
} 