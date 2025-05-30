import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { viewModeAtom } from '@/atoms/dashboard';
import { isLoadingAtom } from '@/atoms/loading';
import { WebCard } from './web-card';
import { EmptyState } from './empty-state';
import { SearchEmptyState } from './search-empty-state';
import type { Web } from '@/types/dashboard';
import { toast } from 'sonner';

interface WebsGridProps {
    webs: Web[];
    searchQuery: string;
    onClearSearch: () => void;
    layout: 'wide' | 'desktop' | 'mobile';
    processingCount?: number;
}

export function WebsGrid({
    webs,
    searchQuery,
    onClearSearch,
    layout,
    processingCount = 0
}: WebsGridProps) {
    const [viewMode] = useAtom(viewModeAtom);
    const [isLoading] = useAtom(isLoadingAtom);

    const fadeTransition = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.3, ease: 'easeOut' }
    };

    const emptyStateTransition = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.4, ease: 'easeOut' }
    };

    // Callback functions for WebCard actions
    const handleDelete = (id: string) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 500)), // Replace with actual delete API call
            {
                loading: 'Deleting web...',
                success: 'Web deleted successfully',
                error: 'Failed to delete web'
            }
        );
    };

    const handleShare = (id: string) => {
        // Copy share URL to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/w/${id}`);
        toast.success('Share link copied to clipboard');
    };

    const handleFavorite = (id: string) => {
        toast.success('Added to favorites');
    };

    const handleRename = (id: string) => {
        toast('Rename functionality coming soon');
    };

    // Show empty content area while loading (progress bar is handled globally)
    if (isLoading) {
        return <div className="flex-1" style={{ minHeight: '60vh' }} />;
    }

    // Show search empty state if there's a search query but no results
    if (searchQuery && webs.length === 0) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="search-empty"
                    {...emptyStateTransition}
                    className="flex items-center justify-center flex-grow"
                    style={{ minHeight: '60vh' }}
                >
                    <SearchEmptyState searchQuery={searchQuery} onClearSearch={onClearSearch} />
                </motion.div>
            </AnimatePresence>
        );
    }

    // Show general empty state if no webs at all
    if (webs.length === 0) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="empty"
                    {...emptyStateTransition}
                    className="flex items-center justify-center flex-grow"
                    style={{ minHeight: '60vh' }}
                >
                    <EmptyState />
                </motion.div>
            </AnimatePresence>
        );
    }

    // Force list view on mobile or when list mode is selected
    const shouldShowList = layout === 'mobile' || viewMode === 'list';

    return (
        <AnimatePresence mode="wait">
            {shouldShowList ? (
                <motion.div
                    key="list-view"
                    {...fadeTransition}
                    className="space-y-3"
                >
                    {webs.map((web, index) => (
                        <motion.div
                            key={web.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: 'easeOut',
                                delay: Math.min(index * 0.05, 0.3) // Stagger with max delay
                            }}
                        >
                            <WebCard
                                web={web}
                                variant="list"
                                onDelete={handleDelete}
                                onShare={handleShare}
                                onFavorite={handleFavorite}
                                onRename={handleRename}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    key="grid-view"
                    {...fadeTransition}
                    className={`grid ${layout === 'wide'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                            } gap-4`}
                    >
                        {webs.map((web, index) => (
                            <motion.div
                                key={web.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    ease: 'easeOut',
                                    delay: Math.min(index * 0.05, 0.3) // Stagger with max delay
                                }}
                            >
                                <WebCard
                                    web={web}
                                    variant="grid"
                                    onDelete={handleDelete}
                                    onShare={handleShare}
                                    onFavorite={handleFavorite}
                                    onRename={handleRename}
                                />
                            </motion.div>
                        ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
} 