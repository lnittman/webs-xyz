'use client';

import { ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Header } from './header';
import { SearchModal } from './search-modal';
import { useWebs } from '@/hooks/code/web/queries';
import { searchModalOpenAtom } from '@/atoms/search';

interface ClientLayoutProps {
    children: ReactNode;
    workspaceId?: string;
    webCount?: number;
    showStatus?: boolean;
}

export function ClientLayout({
    children,
    workspaceId = 'default',
    webCount = 0,
    showStatus = true
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
            <Header showStatus={showStatus} />

            {/* Global Search Modal */}
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                webs={webs || []}
            />

            <main className="pt-14 flex-1 flex flex-col">
                {children}
            </main>

            {/* Terminal scanline effect
            <div className="terminal-scanlines" aria-hidden="true" />
            */}
        </div>
    );
} 