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
    // Show search empty state if there's a search query but no results
    if (searchQuery && webs.length === 0) {
        return <SearchEmptyState searchQuery={searchQuery} onClearSearch={onClearSearch} />;
    }

    // Show general empty state if no webs at all
    if (webs.length === 0) {
        return <EmptyState />;
    }

    // Mobile layout - list view
    if (layout === 'mobile') {
        return (
            <div className="space-y-2">
                {webs.map((web) => (
                    <WebCard key={web.id} web={web} variant="list" />
                ))}
            </div>
        );
    }

    // Desktop and wide layouts - grid view
    const gridCols = layout === 'wide'
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2';

    return (
        <div className={`grid ${gridCols} gap-4`}>
            {webs.map((web) => (
                <WebCard key={web.id} web={web} variant="grid" />
            ))}
        </div>
    );
} 