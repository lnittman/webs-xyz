import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { viewModeAtom } from '@/atoms/dashboard';
import { WebCard } from './web-card';
import { EmptyState } from './empty-state';
import { SearchEmptyState } from './search-empty-state';
import type { Web } from '@/types/dashboard';

interface WebsGridProps {
    webs: Web[];
    searchQuery: string;
    onClearSearch: () => void;
    layout: 'wide' | 'desktop' | 'mobile';
}

export function WebsGrid({ webs, searchQuery, onClearSearch, layout }: WebsGridProps) {
    const [viewMode] = useAtom(viewModeAtom);

    // Show search empty state if there's a search query but no results
    if (searchQuery && webs.length === 0) {
        return <SearchEmptyState searchQuery={searchQuery} onClearSearch={onClearSearch} />;
    }

    // Show general empty state if no webs at all
    if (webs.length === 0) {
        return <EmptyState />;
    }

    // Force list view on mobile or when list mode is selected
    const shouldShowList = layout === 'mobile' || viewMode === 'list';

    const fadeTransition = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: 'easeInOut' }
    };

    return (
        <AnimatePresence mode="wait">
            {shouldShowList ? (
                <motion.div
                    key="list-view"
                    {...fadeTransition}
                    className="space-y-2"
                >
                    {webs.map((web) => (
                        <WebCard key={web.id} web={web} variant="list" />
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    key="grid-view"
                    {...fadeTransition}
                    className={`grid ${layout === 'wide'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1 md:grid-cols-2'
                            } gap-4`}
                    >
                        {webs.map((web) => (
                            <WebCard key={web.id} web={web} variant="grid" />
                        ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
} 