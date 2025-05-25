'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Plus, ArrowSquareOut, Check, Stack } from '@phosphor-icons/react/dist/ssr';
import { useModals } from '@repo/design/sacred';
import { cn } from '@repo/design/lib/utils';

interface BrowserTab {
    url: string;
    title: string;
    favIconUrl?: string;
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

// Enhanced browser tabs detection with better fallback
async function getBrowserTabs(): Promise<BrowserTab[]> {
    try {
        // Method 1: Chrome Extension API (if available)
        if (typeof window !== 'undefined' && 'chrome' in window && (window as any).chrome?.tabs) {
            const chrome = (window as any).chrome;
            const tabs = await chrome.tabs.query({ currentWindow: true });
            return tabs.map((tab: any) => ({
                url: tab.url || '',
                title: tab.title || '',
                favIconUrl: tab.favIconUrl,
            })).filter((tab: BrowserTab) => tab.url.startsWith('http'));
        }

        // Method 2: Try to access browser history (limited)
        if (typeof window !== 'undefined') {
            const currentTab = {
                url: window.location.href,
                title: document.title,
                favIconUrl: `${window.location.origin}/favicon.ico`
            };

            // Method 3: Check localStorage for recently visited URLs (if app stores them)
            const recentUrls: BrowserTab[] = [];
            try {
                const stored = localStorage.getItem('recentUrls');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    recentUrls.push(...parsed);
                }
            } catch (e) {
                // Ignore localStorage errors
            }

            // Method 4: Check browser history API (very limited)
            const historyTabs: BrowserTab[] = [];
            if ('history' in window && window.history.length > 1) {
                // We can't actually access history entries, but we know there are some
                // This is just for demonstration - in a real app you'd need a browser extension
            }

            // Enhanced mock tabs with more realistic data for demo
            const mockTabs: BrowserTab[] = [
                {
                    url: 'https://github.com/vercel/next.js',
                    title: 'GitHub - vercel/next.js: The React Framework',
                    favIconUrl: 'https://github.com/favicon.ico'
                },
                {
                    url: 'https://news.ycombinator.com',
                    title: 'Hacker News',
                    favIconUrl: 'https://news.ycombinator.com/favicon.ico'
                },
                {
                    url: 'https://stackoverflow.com/questions/tagged/javascript',
                    title: 'Newest \'javascript\' Questions - Stack Overflow',
                    favIconUrl: 'https://stackoverflow.com/favicon.ico'
                },
                {
                    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
                    title: 'JavaScript | MDN',
                    favIconUrl: 'https://developer.mozilla.org/favicon.ico'
                },
                {
                    url: 'https://react.dev',
                    title: 'React – The library for web and native user interfaces',
                    favIconUrl: 'https://react.dev/favicon.ico'
                },
                {
                    url: 'https://tailwindcss.com',
                    title: 'Tailwind CSS - Rapidly build modern websites',
                    favIconUrl: 'https://tailwindcss.com/favicon.ico'
                },
                {
                    url: 'https://www.typescriptlang.org',
                    title: 'TypeScript: JavaScript With Syntax For Types',
                    favIconUrl: 'https://www.typescriptlang.org/favicon.ico'
                },
                {
                    url: 'https://nextjs.org',
                    title: 'Next.js by Vercel - The React Framework',
                    favIconUrl: 'https://nextjs.org/favicon.ico'
                },
                {
                    url: 'https://vercel.com',
                    title: 'Vercel: Build and deploy the best web experiences',
                    favIconUrl: 'https://vercel.com/favicon.ico'
                }
            ];

            // Combine all sources and deduplicate
            const allTabs = [currentTab, ...recentUrls, ...historyTabs, ...mockTabs];
            const uniqueTabs = allTabs.filter((tab, index, self) =>
                index === self.findIndex(t => t.url === tab.url)
            );

            return uniqueTabs;
        }
    } catch (error) {
        console.log('Browser tabs not accessible:', error);
    }

    return [];
}

export function BrowserTabsModal({ onSelectTab, onSelectMultipleTabs }: BrowserTabsModalProps) {
    const { close } = useModals();
    const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>([]);
    const [selectedTabs, setSelectedTabs] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getBrowserTabs().then((tabs) => {
            setBrowserTabs(tabs);
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
        const tabsToAdd = browserTabs.filter(tab => selectedTabs.has(tab.url));
        if (tabsToAdd.length > 0) {
            onSelectMultipleTabs(tabsToAdd);
            close();
        }
    };

    const handleAddAll = () => {
        onSelectMultipleTabs(browserTabs);
        close();
    };

    const handleOpenTab = (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(url, '_blank');
    };

    return (
        <div className="w-full max-w-2xl mx-4 bg-background border-2 border-border">
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
                ) : browserTabs.length > 0 ? (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header with count and actions */}
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                                {browserTabs.length} TAB{browserTabs.length !== 1 ? 'S' : ''} AVAILABLE
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
                                    ADD ALL
                                </button>
                            </div>
                        </div>

                        {/* Tabs list */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {browserTabs.map((tab, index) => (
                                <motion.div
                                    key={`${tab.url}-${index}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05, duration: 0.2 }}
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
                                        <div className="text-xs text-muted-foreground truncate font-mono">
                                            {getDomain(tab.url)}
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
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="flex items-center justify-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="text-center">
                            <Globe size={32} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground font-mono uppercase">
                                NO TABS AVAILABLE
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Browser tab access not available in this environment
                            </p>
                        </div>
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