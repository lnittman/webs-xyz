import { useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import { searchModalOpenAtom } from '@/atoms/search';
import { viewModeAtom } from '@/atoms/dashboard';
import { cn } from '@repo/design/lib/utils';
import { MagnifyingGlass, FunnelSimple, SortAscending, Database, SquaresFour, List } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@repo/design/hooks/use-mobile';

interface NavigationToolbarProps {
    resultsCount: number;
    processingCount: number;
    isLoadingResults?: boolean;
}

export function NavigationToolbar({ resultsCount, processingCount, isLoadingResults = false }: NavigationToolbarProps) {
    const [, setIsSearchModalOpen] = useAtom(searchModalOpenAtom);
    const [viewMode, setViewMode] = useAtom(viewModeAtom);
    const isMobile = useIsMobile();
    const [mounted, setMounted] = useState(false);

    // Handle mounting for proper mobile detection
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={cn(
            "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky z-30",
            processingCount > 0 ? "top-[152px]" : "top-[104px]"
        )}>
            <div className="w-full flex justify-center py-4">
                <div className="w-full max-w-4xl px-6">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left section - Search */}
                        <div className="flex-1 max-w-md">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mounted && isMobile ? 'mobile-search' : 'desktop-search'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full"
                                >
                                    {mounted && !isMobile && (
                            // Desktop - Full search input
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
                                    )}

                                    {mounted && isMobile && (
                                        // Mobile - Simple search button
                                        <button
                                            onClick={() => setIsSearchModalOpen(true)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-background border border-border font-mono rounded-lg"
                                        >
                                            <MagnifyingGlass size={14} weight="duotone" />
                                            <span className="uppercase tracking-wider">Search</span>
                                        </button>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right section - Controls */}
                        <div className="flex items-center gap-2">
                            {/* Responsive Controls */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mounted && isMobile ? 'mobile' : 'desktop'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2"
                                >
                                    {mounted && !isMobile && (
                                        <>
                                            {/* Desktop - Filters */}
                                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-background border border-border font-mono rounded-lg">
                                                <FunnelSimple size={14} weight="duotone" />
                                                <span className="uppercase tracking-wider">Filters</span>
                                            </button>

                                            {/* Desktop - Sort */}
                                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-background border border-border font-mono rounded-lg">
                                                <SortAscending size={14} weight="duotone" />
                                                <span className="uppercase tracking-wider">Sort</span>
                                            </button>

                                            {/* Desktop - View Toggle */}
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
                                        </>
                                    )}

                                    {mounted && isMobile && (
                                        <>
                                            {/* Mobile - Filters (icon only) */}
                                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-background border border-border font-mono rounded-lg">
                                                <FunnelSimple size={14} weight="duotone" />
                                            </button>

                                            {/* Mobile - Sort (icon only) */}
                                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-background border border-border font-mono rounded-lg">
                                                <SortAscending size={14} weight="duotone" />
                                            </button>

                                            {/* No view toggle on mobile */}
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Results count - outside animation to avoid affecting it */}
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