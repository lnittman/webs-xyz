'use client';

import { ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useTransitionRouter } from 'next-view-transitions';

import { searchModalOpenAtom } from '@/atoms/search';
import { Navigation } from '@/components/shared/layout/navigation';
import { SearchModal } from '@/components/shared/modal/search-modal';
import { FontLoader } from '@/components/shared/font-loader';
import { ProgressBar } from '@/components/shared/layout/progress-bar';
import { MobileUserMenuOverlay } from '@/components/shared/menu/user/mobile-user-menu-overlay';
import { MobileNotificationsOverlay } from '@/components/shared/menu/notifications/mobile-notifications-overlay';
import { MobileDocsOverlay } from '@/components/shared/menu/docs/mobile-docs-overlay';
import { MobileSpacesOverlay } from '@/components/shared/menu/spaces/mobile-spaces-overlay';
import { MobileFeedbackOverlay } from '@/components/shared/menu/feedback/mobile-feedback-overlay';
import { useWebs } from '@/hooks/web/queries';
import { useSpaces } from '@/hooks/spaces';
import { currentSpaceIdAtom, currentSpaceAtom } from '@/atoms/spaces';

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
    const router = useTransitionRouter();

    const { webs } = useWebs();

    const [isSearchModalOpen, setIsSearchModalOpen] = useAtom(searchModalOpenAtom);
    const [currentSpaceId] = useAtom(currentSpaceIdAtom);

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

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    const handleCreateSpace = () => {
        // This will be handled by the CreateSpaceModal in navigation
    };

    return (
        <div className="min-h-screen bg-background antialiased font-mono flex flex-col">
            <FontLoader />
            <div className="sticky top-0">
                <Navigation webTitle={webTitle} webId={webId} />
            </div>

            <main className="flex-1 flex flex-col">
                {children}
            </main>

            {/* Global Search Modal */}
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                webs={webs || []}
            />

            {/* Mobile Menu Overlays */}
            <MobileUserMenuOverlay />
            <MobileNotificationsOverlay onNavigate={handleNavigate} />
            <MobileDocsOverlay />
            <MobileSpacesOverlay
                currentSpaceId={currentSpaceId}
                onNavigate={handleNavigate}
                onCreateSpace={handleCreateSpace}
            />
            <MobileFeedbackOverlay />

            {/* Global Progress Bar */}
            <ProgressBar />
        </div>
    );
} 