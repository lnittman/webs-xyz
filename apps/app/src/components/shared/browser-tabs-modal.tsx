'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Plus, ArrowSquareOut, Check, Stack, TrendUp, Heart, Clock, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { useModals } from '@repo/design/sacred';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/design/components/ui/tabs';
import { cn } from '@repo/design/lib/utils';

interface BrowserTab {
    url: string;
    title: string;
    favIconUrl?: string;
    category?: 'trending' | 'favorites' | 'history';
    lastVisited?: Date;
}

interface BrowserTabsModalProps {
    onSelectTab: (tab: BrowserTab) => void;
    onSelectMultipleTabs: (tabs: BrowserTab[]) => void;
}

// Helper to get domain from URL
function getDomain(url: string): string {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

// Enhanced browser tabs detection with categorized data
async function getBrowserTabs(): Promise<{
    trending: BrowserTab[];
    favorites: BrowserTab[];
    history: BrowserTab[];
}> {
    try {
        // Method 1: Chrome Extension API (if available)
        if (typeof window !== 'undefined' && 'chrome' in window && (window as any).chrome?.tabs) {
            const chrome = (window as any).chrome;
            const tabs = await chrome.tabs.query({ currentWindow: true });
            const realTabs = tabs.map((tab: any) => ({
                url: tab.url || '',
                title: tab.title || '',
                favIconUrl: tab.favIconUrl,
                category: 'history' as const,
                lastVisited: new Date()
            })).filter((tab: BrowserTab) => tab.url.startsWith('http'));

            return {
                trending: realTabs.slice(0, 3),
                favorites: realTabs.slice(3, 6),
                history: realTabs
            };
        }

        // Method 2: Check localStorage for user data
        let storedFavorites: BrowserTab[] = [];
        let storedHistory: BrowserTab[] = [];

        try {
            const favorites = localStorage.getItem('browserFavorites');
            const history = localStorage.getItem('browserHistory');

            if (favorites) storedFavorites = JSON.parse(favorites);
            if (history) storedHistory = JSON.parse(history);
        } catch (e) {
            // Ignore localStorage errors
        }

        // Current tab
        const currentTab: BrowserTab = {
            url: window.location.href,
            title: document.title,
            favIconUrl: `${window.location.origin}/favicon.ico`,
            category: 'history',
            lastVisited: new Date()
        };

        // Mock trending sites (popular developer/tech sites)
        const trendingTabs: BrowserTab[] = [
            {
                url: 'https://github.com/trending',
                title: 'Trending repositories on GitHub',
                favIconUrl: 'https://github.com/favicon.ico',
                category: 'trending',
                lastVisited: new Date(Date.now() - 1000 * 60 * 30) // 30 min ago
            },
            {
                url: 'https://news.ycombinator.com',
                title: 'Hacker News',
                favIconUrl: 'https://news.ycombinator.com/favicon.ico',
                category: 'trending',
                lastVisited: new Date(Date.now() - 1000 * 60 * 45) // 45 min ago
            },
            {
                url: 'https://dev.to',
                title: 'DEV Community 👩‍💻👨‍💻',
                favIconUrl: 'https://dev.to/favicon.ico',
                category: 'trending',
                lastVisited: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
            },
            {
                url: 'https://stackoverflow.com/questions/tagged/javascript',
                title: 'Newest \'javascript\' Questions - Stack Overflow',
                favIconUrl: 'https://stackoverflow.com/favicon.ico',
                category: 'trending',
                lastVisited: new Date(Date.now() - 1000 * 60 * 20) // 20 min ago
            },
            {
                url: 'https://reddit.com/r/programming',
                title: 'r/programming - Reddit',
                favIconUrl: 'https://reddit.com/favicon.ico',
                category: 'trending',
                lastVisited: new Date(Date.now() - 1000 * 60 * 90) // 1.5 hours ago
            }
        ];

        // Mock favorite sites (commonly bookmarked dev tools)
        const favoriteTabs: BrowserTab[] = [
            {
                url: 'https://react.dev',
                title: 'React – The library for web and native user interfaces',
                favIconUrl: 'https://react.dev/favicon.ico',
                category: 'favorites',
                lastVisited: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
                url: 'https://nextjs.org',
                title: 'Next.js by Vercel - The React Framework',
                favIconUrl: 'https://nextjs.org/favicon.ico',
                category: 'favorites',
                lastVisited: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
            },
            {
                url: 'https://tailwindcss.com',
                title: 'Tailwind CSS - Rapidly build modern websites',
                favIconUrl: 'https://tailwindcss.com/favicon.ico',
                category: 'favorites',
                lastVisited: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
            },
            {
                url: 'https://developer.mozilla.org',
                title: 'MDN Web Docs',
                favIconUrl: 'https://developer.mozilla.org/favicon.ico',
                category: 'favorites',
                lastVisited: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
            },
            {
                url: 'https://www.typescriptlang.org',
                title: 'TypeScript: JavaScript With Syntax For Types',
                favIconUrl: 'https://www.typescriptlang.org/favicon.ico',
                category: 'favorites',
                lastVisited: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
            },
            {
                url: 'https://vercel.com',
                title: 'Vercel: Build and deploy the best web experiences',
                favIconUrl: 'https://vercel.com/favicon.ico',
                category: 'favorites',
                lastVisited: new Date(Date.now() - 1000 * 60 * 60 * 7) // 7 hours ago
            }
        ];

        // Mock history (mix of work and research)
        const historyTabs: BrowserTab[] = [
            currentTab,
            {
                url: 'https://github.com/vercel/next.js',
                title: 'GitHub - vercel/next.js: The React Framework',
                favIconUrl: 'https://github.com/favicon.ico',
                category: 'history',
                lastVisited: new Date(Date.now() - 1000 * 60 * 15) // 15 min ago
            },
            {
                url: 'https://docs.github.com/en/actions',
                title: 'GitHub Actions Documentation',
                favIconUrl: 'https://github.com/favicon.ico',
                category: 'history',
                lastVisited: new Date(Date.now() - 1000 * 60 * 25) // 25 min ago
            },
            {
                url: 'https://www.npmjs.com/package/framer-motion',
                title: 'framer-motion - npm',
                favIconUrl: 'https://www.npmjs.com/favicon.ico',
                category: 'history',
                lastVisited: new Date(Date.now() - 1000 * 60 * 35) // 35 min ago
            },
            {
                url: 'https://ui.shadcn.com',
                title: 'shadcn/ui',
                favIconUrl: 'https://ui.shadcn.com/favicon.ico',
                category: 'history',
                lastVisited: new Date(Date.now() - 1000 * 60 * 50) // 50 min ago
            },
            {
                url: 'https://www.radix-ui.com',
                title: 'Radix UI',
                favIconUrl: 'https://www.radix-ui.com/favicon.ico',
                category: 'history',
                lastVisited: new Date(Date.now() - 1000 * 60 * 65) // 1 hour 5 min ago
            },
            {
                url: 'https://phosphoricons.com',
                title: 'Phosphor Icons',
                favIconUrl: 'https://phosphoricons.com/favicon.ico',
                category: 'history',
                lastVisited: new Date(Date.now() - 1000 * 60 * 80) // 1 hour 20 min ago
            }
        ];

        // Combine with stored data
        const allTrending = [...trendingTabs];
        const allFavorites = [...storedFavorites, ...favoriteTabs];
        const allHistory = [...storedHistory, ...historyTabs];

        // Deduplicate by URL
        const deduplicateByUrl = (tabs: BrowserTab[]) =>
            tabs.filter((tab, index, self) => 
                index === self.findIndex(t => t.url === tab.url)
            );

        return {
            trending: deduplicateByUrl(allTrending),
            favorites: deduplicateByUrl(allFavorites),
            history: deduplicateByUrl(allHistory).sort((a, b) =>
                (b.lastVisited?.getTime() || 0) - (a.lastVisited?.getTime() || 0)
            )
        };
    } catch (error) {
        console.log('Browser tabs not accessible:', error);
        return { trending: [], favorites: [], history: [] };
    }
}

// Format relative time
function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

export function BrowserTabsModal({ onSelectTab, onSelectMultipleTabs }: BrowserTabsModalProps) {
    const { close } = useModals();
    const [tabData, setTabData] = useState<{
        trending: BrowserTab[];
        favorites: BrowserTab[];
        history: BrowserTab[];
    }>({ trending: [], favorites: [], history: [] });
    const [selectedTabs, setSelectedTabs] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('trending');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        getBrowserTabs().then((data) => {
            setTabData(data);
            setIsLoading(false);
        });
    }, []);

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [close]);

    const handleSelectTab = (tab: BrowserTab) => {
        onSelectTab(tab);
        close();
    };

    const handleToggleTab = (tab: BrowserTab, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSelected = new Set(selectedTabs);
        if (newSelected.has(tab.url)) {
            newSelected.delete(tab.url);
        } else {
            newSelected.add(tab.url);
        }
        setSelectedTabs(newSelected);
    };

    const handleAddSelected = () => {
        const allTabs = [...tabData.trending, ...tabData.favorites, ...tabData.history];
        const tabsToAdd = allTabs.filter(tab => selectedTabs.has(tab.url));
        if (tabsToAdd.length > 0) {
            onSelectMultipleTabs(tabsToAdd);
            close();
        }
    };

    const handleAddAll = () => {
        const currentTabs = getFilteredTabs();
        onSelectMultipleTabs(currentTabs);
        close();
    };

    const handleOpenTab = (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(url, '_blank');
    };

    // Filter tabs based on search query
    const getFilteredTabs = () => {
        const currentTabs = tabData[activeTab as keyof typeof tabData];
        if (!searchQuery.trim()) return currentTabs;

        const query = searchQuery.toLowerCase();
        return currentTabs.filter(tab =>
            tab.title.toLowerCase().includes(query) ||
            tab.url.toLowerCase().includes(query) ||
            getDomain(tab.url).toLowerCase().includes(query)
        );
    };

    const renderTabList = (tabs: BrowserTab[], showTime = false) => (
        <div className="space-y-1 h-80 overflow-y-auto">
            {tabs.length > 0 ? tabs.map((tab, index) => (
                <motion.div
                    key={`${tab.url}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02, duration: 0.15 }}
                    onClick={() => handleSelectTab(tab)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent transition-all duration-200 border border-border hover:border-foreground/30 group cursor-pointer"
                >
                    {/* Selection checkbox */}
                    <button
                        onClick={(e) => handleToggleTab(tab, e)}
                        className={cn(
                            "w-4 h-4 border border-border flex items-center justify-center transition-all duration-200",
                            selectedTabs.has(tab.url)
                                ? "bg-green-600 border-green-600 text-white"
                                : "hover:border-foreground/50"
                        )}
                    >
                        {selectedTabs.has(tab.url) && (
                            <Check size={10} weight="bold" />
                        )}
                    </button>

                    {/* Favicon */}
                    {tab.favIconUrl ? (
                        <img
                            src={tab.favIconUrl}
                            alt=""
                            className="w-4 h-4 shrink-0"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <Globe size={16} weight="duotone" className="text-muted-foreground shrink-0" />
                    )}

                    {/* Tab info */}
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
                            {tab.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate font-mono">{getDomain(tab.url)}</span>
                            {showTime && tab.lastVisited && (
                                <>
                                    <span>•</span>
                                    <span>{formatRelativeTime(tab.lastVisited)}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => handleOpenTab(tab.url, e)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            title="Open in new tab"
                        >
                            <ArrowSquareOut size={14} weight="duotone" />
                        </button>
                        <Plus size={14} weight="duotone" className="text-green-600" />
                    </div>
                </motion.div>
            )) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground font-mono text-sm">
                        {searchQuery ? `NO RESULTS FOR "${searchQuery}"` : 'NO TABS AVAILABLE'}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full max-w-3xl mx-4 bg-background border-2 border-border">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-border bg-card/50">
                <div className="flex items-center gap-3">
                    <Globe size={16} weight="duotone" className="text-foreground" />
                    <span className="text-foreground font-mono uppercase text-sm tracking-wider">
                        BROWSER TABS
                    </span>
                </div>
                <button
                    onClick={() => close()}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={16} weight="duotone" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {isLoading ? (
                    <motion.div 
                        className="flex items-center justify-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="mx-auto mb-3"
                            >
                                <Globe size={24} weight="duotone" className="text-muted-foreground" />
                            </motion.div>
                            <p className="text-sm text-muted-foreground font-mono uppercase">
                                LOADING TABS...
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                            {/* Header with actions */}
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                                    BROWSE BY CATEGORY
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedTabs.size > 0 && (
                                    <button
                                        onClick={handleAddSelected}
                                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white hover:bg-green-700 transition-colors text-xs font-mono uppercase"
                                    >
                                        <Plus size={12} weight="duotone" />
                                        ADD {selectedTabs.size} SELECTED
                                    </button>
                                )}
                                <button
                                    onClick={handleAddAll}
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-mono uppercase"
                                >
                                    <Stack size={12} weight="duotone" />
                                        ADD ALL {activeTab.toUpperCase()}
                                </button>
                            </div>
                        </div>

                            {/* Tabs */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border">
                                    <TabsTrigger value="trending" className="flex items-center gap-2 font-mono text-xs uppercase">
                                        <TrendUp size={14} weight="duotone" />
                                        TRENDING
                                    </TabsTrigger>
                                    <TabsTrigger value="favorites" className="flex items-center gap-2 font-mono text-xs uppercase">
                                        <Heart size={14} weight="duotone" />
                                        FAVORITES
                                    </TabsTrigger>
                                    <TabsTrigger value="history" className="flex items-center gap-2 font-mono text-xs uppercase">
                                        <Clock size={14} weight="duotone" />
                                        HISTORY
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="trending" className="mt-4">
                                    {tabData.trending.length > 0 ? (
                                        renderTabList(tabData.trending)
                                    ) : (
                                            <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                                                NO TRENDING TABS AVAILABLE
                                            </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="favorites" className="mt-4">
                                    {tabData.favorites.length > 0 ? (
                                        renderTabList(tabData.favorites)
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                                            NO FAVORITE TABS SAVED
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="history" className="mt-4">
                                    {tabData.history.length > 0 ? (
                                        renderTabList(tabData.history, true)
                                    ) : (
                                            <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                                                NO HISTORY AVAILABLE
                                            </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t-2 border-border bg-card/50">
                <div className="text-xs text-muted-foreground font-mono">
                    CLICK TO ADD SINGLE • CHECKBOX FOR MULTIPLE • ESC TO CLOSE
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    {selectedTabs.size > 0 && (
                        <span className="text-green-600">{selectedTabs.size} SELECTED</span>
                    )}
                </div>
            </div>
        </div>
    );
} 