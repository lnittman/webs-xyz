'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'next-view-transitions';
import { PromptBar } from '@/components/shared/prompt-bar';
import { ClientLayout } from '@/components/shared/client-layout';
import { promptFocusedAtom } from '@/atoms/chat';
import { searchModalOpenAtom } from '@/atoms/search';
import { useWebs } from '@/hooks/code/web/queries';
import { useCreateWeb } from '@/hooks/code/web/mutations';
import { cn } from '@repo/design/lib/utils';
import { Brain, Sparkle, Clock, Globe, Lightning, Sliders, Pulse, Database, MagnifyingGlass, FunnelSimple, SortAscending } from '@phosphor-icons/react/dist/ssr';

// Helper to extract domain from URL
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
}

// Helper to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

interface AIActivity {
  id: string;
  type: 'processing' | 'completed' | 'queued';
  action: string;
  target: string;
  timestamp: Date;
  icon?: any;
}

export default function RootPage() {
  const { webs } = useWebs();
  const { createWeb } = useCreateWeb();
  const [workspaceId] = useState('default');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromptFocused, setIsPromptFocused] = useAtom(promptFocusedAtom);
  const [selectedModelId, setSelectedModelId] = useState('claude-4-sonnet');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setIsSearchModalOpen] = useAtom(searchModalOpenAtom);

  // Mock AI activities (in real app, this would come from a subscription/polling)
  const [aiActivities] = useState<AIActivity[]>([
    {
      id: '1',
      type: 'processing',
      action: 'EXTRACTING CONTENT',
      target: 'github.com/vercel/next.js',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      icon: Globe
    },
    {
      id: '2',
      type: 'completed',
      action: 'GENERATED SUMMARY',
      target: 'news.ycombinator.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      icon: Sparkle
    },
    {
      id: '3',
      type: 'queued',
      action: 'PENDING ANALYSIS',
      target: 'arxiv.org/papers/2024',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      icon: Clock
    }
  ]);

  const handleSubmit = async (input: string) => {
    setIsSubmitting(true);
    try {
      // Parse input to extract URL and optional prompt
      const urlRegex = /(https?:\/\/[^\s]+)/;
      const match = input.match(urlRegex);
      const url = match ? match[1] : input;
      const prompt = input.replace(urlRegex, '').trim() || undefined;

      await createWeb({ workspaceId, url, prompt });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  // Group webs by domain for context
  const websByDomain = (webs || []).reduce((acc, web) => {
    const domain = extractDomain(web.url);
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(web);
    return acc;
  }, {} as Record<string, typeof webs>);

  // Filter webs based on search query
  const filteredWebs = (webs || []).filter(web => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      web.title?.toLowerCase().includes(query) ||
      web.url.toLowerCase().includes(query) ||
      web.prompt?.toLowerCase().includes(query) ||
      extractDomain(web.url).toLowerCase().includes(query)
    );
  });

  // Get recent activity for context tile
  const recentWebs = (webs || []).slice(0, 5);
  const topDomains = Object.entries(websByDomain)
    .sort(([, a], [, b]) => (b?.length || 0) - (a?.length || 0))
    .slice(0, 3);

  const processingCount = aiActivities.filter(a => a.type === 'processing').length;

  return (
    <ClientLayout workspaceId={workspaceId} webCount={webs?.length || 0}>
      {/* Command interface */}
      <div className="bg-card/50">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-3xl px-6 py-8">
            <PromptBar
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isFocused={isPromptFocused}
              onFocusChange={setIsPromptFocused}
              selectedModelId={selectedModelId}
              onModelChange={handleModelChange}
              placeholder="https://example.com [optional: summarize the main points]"
            />
          </div>
        </div>
      </div>

      {/* Navigation Toolbar */}
      <div className={cn(
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky z-30",
        processingCount > 0 ? "top-[113px]" : "top-14"
      )}>
        <div className="w-full flex justify-center">
          <div className="w-full max-w-3xl px-6">
            <div className="flex h-12 items-center justify-between gap-4">
              {/* Left section - Search */}
              <div className="flex-1 max-w-md">
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="relative w-full text-left"
                >
                  <MagnifyingGlass size={16} weight="duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <div className="w-full h-8 pl-9 pr-16 text-sm bg-background border border-border font-mono flex items-center text-muted-foreground">
                    Search webs...
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <kbd className="px-1 py-0.5 text-xs bg-border text-muted-foreground font-mono">⌘</kbd>
                    <kbd className="px-1 py-0.5 text-xs bg-border text-muted-foreground font-mono">K</kbd>
                  </div>
                </button>
              </div>

              {/* Right section - Controls */}
              <div className="flex items-center gap-2">
                {/* Filters */}
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors bg-background border border-border font-mono">
                  <FunnelSimple size={14} weight="duotone" />
                  <span className="hidden sm:inline uppercase">Filters</span>
                </button>

                {/* Sort */}
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors bg-background border border-border font-mono">
                  <SortAscending size={14} weight="duotone" />
                  <span className="hidden sm:inline uppercase">Sort</span>
                </button>

                {/* Results count */}
                <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-background border border-border font-mono">
                  <Database size={14} weight="duotone" />
                  <span>{filteredWebs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive webs dashboard - centered */}
      <div className="flex-1 py-8">
        {/* Wide layout (1400px+) - 3 column with context sidebar */}
        <div className="hidden 2xl:block">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-7xl px-6">
              <div className="grid grid-cols-12 gap-8">
                {/* Main content - 8 columns */}
                <div className="col-span-8">
                  {/* Webs grid */}
                  {filteredWebs && filteredWebs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredWebs.map((web) => (
                        <Link
                          key={web.id}
                          href={`/w/${web.id}`}
                          className="group block"
                        >
                          <div className="border-2 border-border bg-card p-4 hover:border-foreground/50 transition-all duration-200 h-full min-h-[140px] flex flex-col">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs text-muted-foreground uppercase font-mono">
                                  {extractDomain(web.url)}
                                </span>
                                <span className={cn(
                                  "text-xs px-1 font-mono transition-all duration-200",
                                  web.status === 'COMPLETE' && "text-green-600",
                                  web.status === 'PENDING' && "text-yellow-600",
                                  web.status === 'PROCESSING' && "text-blue-600 animate-pulse",
                                  web.status === 'FAILED' && "text-red-600"
                                )}>
                                  [{web.status}]
                                </span>
                              </div>
                              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-foreground/80 transition-all duration-200">
                                {web.title || web.url}
                              </h3>
                              {web.prompt && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  "{web.prompt}"
                                </p>
                              )}
                              <div className="pt-2 text-xs text-muted-foreground font-mono mt-auto">
                                {formatRelativeTime(new Date(web.createdAt))}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="flex items-center justify-center py-24">
                      <div className="text-center">
                        <MagnifyingGlass size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          No webs found for "{searchQuery}"
                        </p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Clear search
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-24">
                      <div className="text-center">
                        <pre className="inline-block text-xs text-muted-foreground mb-6 font-mono">
                          {`╔═══════════════════════╗
║                       ║
║    ∅ NO WEBS YET     ║
║                       ║
╚═══════════════════════╝`}
                        </pre>
                        <p className="text-sm text-muted-foreground">
                          Enter a URL above to create your first web.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Context sidebar - 4 columns */}
                <div className="col-span-4 space-y-6">
                  {/* AI Activity Feed */}
                  <div className="border border-border bg-card p-4">
                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Brain size={12} weight="duotone" />
                      AI AGENT ACTIVITY
                    </h3>
                    <div className="space-y-3">
                      {aiActivities.length > 0 ? (
                        aiActivities.map((activity) => {
                          const Icon = activity.icon;
                          return (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start gap-3 p-2 rounded transition-all duration-200"
                            >
                              <div className={cn(
                                "mt-0.5",
                                activity.type === 'processing' && "text-blue-600",
                                activity.type === 'completed' && "text-green-600",
                                activity.type === 'queued' && "text-yellow-600"
                              )}>
                                <Icon size={14} weight="duotone" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-mono text-muted-foreground">
                                  {activity.action}
                                </div>
                                <div className="text-xs text-foreground truncate">
                                  {activity.target}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono mt-1">
                                  {formatRelativeTime(activity.timestamp)}
                                </div>
                              </div>
                              {activity.type === 'processing' && (
                                <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" />
                              )}
                            </motion.div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground">No recent activity</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="border border-border bg-card p-4">
                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                      RECENT WEBS
                    </h3>
                    <div className="space-y-3">
                      {recentWebs.length > 0 ? (
                        recentWebs.map((web) => (
                          <Link
                            key={web.id}
                            href={`/w/${web.id}`}
                            className="block group"
                          >
                            <div className="flex items-center gap-3 p-2 hover:bg-accent transition-all duration-200 rounded">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                web.status === 'COMPLETE' && "bg-green-600",
                                web.status === 'PENDING' && "bg-yellow-600",
                                web.status === 'PROCESSING' && "bg-blue-600",
                                web.status === 'FAILED' && "bg-red-600"
                              )} />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-mono text-muted-foreground">
                                  {extractDomain(web.url)}
                                </div>
                                <div className="text-xs text-foreground truncate group-hover:text-foreground/80">
                                  {web.title || web.url}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {formatRelativeTime(new Date(web.createdAt))}
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No recent activity</p>
                      )}
                    </div>
                  </div>

                  {/* Top Domains */}
                  <div className="border border-border bg-card p-4">
                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                      TOP DOMAINS
                    </h3>
                    <div className="space-y-2">
                      {topDomains.length > 0 ? (
                        topDomains.map(([domain, domainWebs]) => (
                          <div key={domain} className="flex items-center justify-between">
                            <span className="text-xs font-mono text-foreground">{domain}</span>
                            <span className="text-xs text-muted-foreground">{domainWebs?.length || 0}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No domains yet</p>
                      )}
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="border border-border bg-card p-4">
                    <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                      SYSTEM INFO
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Workspace:</span>
                        <span className="font-mono">{workspaceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span className="font-mono">{selectedModelId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-mono text-green-600">READY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span className="font-mono">v1.0.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop layout (768px - 1399px) - Centered grid */}
        <div className="hidden md:block 2xl:hidden">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-3xl px-6">
              {/* Webs grid */}
              {filteredWebs && filteredWebs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWebs.map((web) => (
                    <Link
                      key={web.id}
                      href={`/w/${web.id}`}
                      className="group block"
                    >
                      <div className="border-2 border-border bg-card p-4 hover:border-foreground/50 transition-all duration-200 h-full min-h-[140px] flex flex-col">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs text-muted-foreground uppercase font-mono">
                              {extractDomain(web.url)}
                            </span>
                            <span className={cn(
                              "text-xs px-1 font-mono transition-all duration-200",
                              web.status === 'COMPLETE' && "text-green-600",
                              web.status === 'PENDING' && "text-yellow-600",
                              web.status === 'PROCESSING' && "text-blue-600 animate-pulse",
                              web.status === 'FAILED' && "text-red-600"
                            )}>
                              [{web.status}]
                            </span>
                          </div>
                          <h3 className="text-sm font-medium line-clamp-2 group-hover:text-foreground/80 transition-all duration-200">
                            {web.title || web.url}
                          </h3>
                          {web.prompt && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              "{web.prompt}"
                            </p>
                          )}
                          <div className="pt-2 text-xs text-muted-foreground font-mono mt-auto">
                            {formatRelativeTime(new Date(web.createdAt))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <MagnifyingGlass size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No webs found for "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Clear search
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <pre className="inline-block text-xs text-muted-foreground mb-6 font-mono">
                      {`╔═══════════════════════╗
║                       ║
║    ∅ NO WEBS YET     ║
║                       ║
╚═══════════════════════╝`}
                    </pre>
                    <p className="text-sm text-muted-foreground">
                      Enter a URL above to create your first web.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile layout (< 768px) - List view */}
        <div className="block md:hidden">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-3xl px-6">
              {/* Webs list */}
              {filteredWebs && filteredWebs.length > 0 ? (
                <div className="space-y-2">
                  {filteredWebs.map((web) => (
                    <Link
                      key={web.id}
                      href={`/w/${web.id}`}
                      className="group block"
                    >
                      <div className="border border-border bg-card hover:border-foreground/50 transition-all duration-200 p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs text-muted-foreground uppercase font-mono">
                              {extractDomain(web.url)}
                            </span>
                            <span className={cn(
                              "text-xs px-1 font-mono transition-all duration-200",
                              web.status === 'COMPLETE' && "text-green-600",
                              web.status === 'PENDING' && "text-yellow-600",
                              web.status === 'PROCESSING' && "text-blue-600 animate-pulse",
                              web.status === 'FAILED' && "text-red-600"
                            )}>
                              [{web.status}]
                            </span>
                          </div>
                          <h3 className="text-sm font-medium group-hover:text-foreground/80 transition-all duration-200">
                            {web.title || web.url}
                          </h3>
                          {web.prompt && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              "{web.prompt}"
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground font-mono">
                            {formatRelativeTime(new Date(web.createdAt))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <MagnifyingGlass size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No webs found for "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Clear search
                    </button>
                  </div>
                </div>
              ) : (
                    <div className="flex items-center justify-center py-24">
                      <div className="text-center">
                        <pre className="inline-block text-xs text-muted-foreground mb-6 font-mono">
                          {`╔═══════════════════════╗
║                       ║
║    ∅ NO WEBS YET     ║
║                       ║
╚═══════════════════════╝`}
                        </pre>
                    <p className="text-sm text-muted-foreground">
                      Enter a URL above to create your first web.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 
