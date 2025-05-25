import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

interface SearchEmptyStateProps {
    searchQuery: string;
    onClearSearch: () => void;
}

export function SearchEmptyState({ searchQuery, onClearSearch }: SearchEmptyStateProps) {
    return (
        <div className="flex items-center justify-center py-32">
            <div className="text-center max-w-md">
                <MagnifyingGlass size={48} weight="duotone" className="mx-auto mb-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    No webs found for <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">"{searchQuery}"</span>
                </p>
                <button
                    onClick={onClearSearch}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-accent hover:bg-accent/80 transition-colors rounded-lg border border-border"
                >
                    Clear search
                </button>
            </div>
        </div>
    );
} 