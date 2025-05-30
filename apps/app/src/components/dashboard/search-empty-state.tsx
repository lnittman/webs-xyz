import { Empty } from '@phosphor-icons/react/dist/ssr';

interface SearchEmptyStateProps {
    searchQuery: string;
    onClearSearch: () => void;
}

export function SearchEmptyState({ searchQuery, onClearSearch }: SearchEmptyStateProps) {
    return (
        <div className="flex items-center justify-center py-32">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center">
                        <Empty size={32} weight="duotone" className="text-muted-foreground/60" />
                    </div>
                </div>
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