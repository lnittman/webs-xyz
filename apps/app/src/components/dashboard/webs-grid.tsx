import { useState } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { viewModeAtom } from '@/atoms/dashboard';
import { isLoadingAtom } from '@/atoms/loading';
import { WebCard } from './web-card';
import { EmptyState } from './empty-state';
import { SearchEmptyState } from './search-empty-state';
import type { Web } from '@/types/dashboard';
import { toast } from '@repo/design/components/ui/sonner';

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
    const [deletingWebs, setDeletingWebs] = useState<Set<string>>(new Set());

    const fadeTransition = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: 'easeOut' }
    };

    const emptyStateTransition = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.4, ease: 'easeOut' }
    };

    // Animation variants for individual web items
    const webItemVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: 'easeOut' }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: 'easeIn' }
        }
    };

    // Callback functions for WebCard actions
    const handleDelete = (id: string) => {
        // Mark web as deleting for immediate UI feedback
        setDeletingWebs(prev => new Set(prev).add(id));

        // Remove from deleting set after a short delay to allow for server action completion
        setTimeout(() => {
            setDeletingWebs(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }, 1000); // Give time for the actual deletion to complete
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

    // Filter out deleting webs for smooth animation
    const displayWebs = webs.filter(web => !deletingWebs.has(web.id));

    // Show empty content area while loading (progress bar is handled globally)
    if (isLoading) {
        return <div className="flex-1" style={{ minHeight: '60vh' }} />;
    }

    // Show search empty state if there's a search query but no results
    if (searchQuery && displayWebs.length === 0) {
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
    if (displayWebs.length === 0) {
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
                    <AnimatePresence>
                        {displayWebs.map((web, index) => (
                            <motion.div
                                key={web.id}
                                variants={webItemVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                layout
                                style={{
                                    transitionDelay: `${Math.min(index * 0.05, 0.3)}s`
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
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div
                    key="grid-view"
                    {...fadeTransition}
                    className={`grid ${layout === 'wide'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        } gap-4 auto-rows-fr`}
                    >
                        <AnimatePresence>
                            {displayWebs.map((web, index) => (
                                <motion.div
                                    key={web.id}
                                    variants={webItemVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    layout
                                    className="h-fit"
                                    style={{
                                        transitionDelay: `${Math.min(index * 0.05, 0.3)}s`
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
                        </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 