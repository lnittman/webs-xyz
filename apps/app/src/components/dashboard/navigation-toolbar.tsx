import { useAtom } from 'jotai';
import { searchModalOpenAtom } from '@/atoms/search';
import { viewModeAtom } from '@/atoms/dashboard';
import { cn } from '@repo/design/lib/utils';
import { MagnifyingGlass, FunnelSimple, SortAscending, Database, SquaresFour, List } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'framer-motion';

interface NavigationToolbarProps {
    resultsCount: number;
    processingCount: number;
    isLoadingResults?: boolean;
}

export function NavigationToolbar({ resultsCount, processingCount, isLoadingResults = false }: NavigationToolbarProps) {
    const [, setIsSearchModalOpen] = useAtom(searchModalOpenAtom);
    const [viewMode, setViewMode] = useAtom(viewModeAtom);

    return (
        <div className={cn(
            "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky z-30",
            processingCount > 0 ? "top-[113px]" : "top-14"
        )}>
            <div className="w-full flex justify-center">
                <div className="w-full max-w-4xl px-6">
                    <div className="flex h-14 items-center justify-between gap-4">
                        {/* Left section - Search */}
                        <div className="flex-1 max-w-md">
                            <button
                                onClick={() => setIsSearchModalOpen(true)}
                                className="relative w-full text-left group"
                            >
                                <MagnifyingGlass size={16} weight="duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors" />
                                <div className="w-full h-9 pl-10 pr-16 text-sm bg-background border border-border font-mono flex items-center text-muted-foreground rounded-lg hover:border-foreground/20 transition-colors">
                                    Search webs...
                                </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 text-xs bg-muted text-muted-foreground font-mono rounded flex items-center border border-border">
                                        <span className="text-xs">⌘</span>
                                        <span className="text-xs">K</span>
                                    </kbd>
                                </div>
                            </button>
                        </div>

                        {/* Right section - Controls */}
                        <div className="flex items-center gap-2">
                            {/* Filters */}
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-background border border-border font-mono rounded-lg">
                                <FunnelSimple size={14} weight="duotone" />
                                <span className="hidden sm:inline uppercase tracking-wider">Filters</span>
                            </button>

                            {/* Sort */}
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-background border border-border font-mono rounded-lg">
                                <SortAscending size={14} weight="duotone" />
                                <span className="hidden sm:inline uppercase tracking-wider">Sort</span>
                            </button>

                            {/* View Toggle - Exact Vercel Style */}
                            <div className="flex items-center bg-background border border-border rounded-md">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "flex items-center justify-center w-7 h-7 m-0.5 transition-all duration-150 rounded-sm",
                                        viewMode === 'grid'
                                            ? "bg-muted text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <SquaresFour size={13} weight="duotone" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "flex items-center justify-center w-7 h-7 m-0.5 transition-all duration-150 rounded-sm",
                                        viewMode === 'list'
                                            ? "bg-muted text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <List size={13} weight="duotone" />
                                </button>
                            </div>

                            {/* Results count */}
                            <motion.div
                                initial={isLoadingResults ? { opacity: 0 } : { opacity: 1 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted border border-border font-mono rounded-lg"
                            >
                                <Database size={14} weight="duotone" />
                                <span className="font-medium">{resultsCount}</span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 