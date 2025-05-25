'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PromptBar } from '@/components/shared/prompt-bar';
import { promptFocusedAtom } from '@/atoms/chat';
import { useWebs } from '@/hooks/code/web/queries';
import { useCreateWeb } from '@/hooks/code/web/mutations';
import { cn } from '@repo/design/lib/utils';

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

export default function RootPage() {
  const { webs } = useWebs();
  const { createWeb } = useCreateWeb();
  const [workspaceId] = useState('default');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromptFocused, setIsPromptFocused] = useAtom(promptFocusedAtom);
  const [selectedModelId, setSelectedModelId] = useState('claude-4-sonnet');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // Group webs by domain
  const websByDomain = (webs || []).reduce((acc, web) => {
    const domain = extractDomain(web.url);
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(web);
    return acc;
  }, {} as Record<string, typeof webs>);

  return (
    <div className="min-h-screen bg-background antialiased font-mono">
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="h-14 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium tracking-tight">WEBS</h1>
            <span className="text-xs text-muted-foreground">/ AI-NATIVE INTERNET INTERFACE</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "text-xs px-2 py-1 transition-all duration-200",
                  viewMode === 'grid' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                [GRID]
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "text-xs px-2 py-1 transition-all duration-200",
                  viewMode === 'list' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                [LIST]
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14 min-h-screen">
        {/* Command interface */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-6xl mx-auto px-6 py-8">
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

        {/* Webs dashboard */}
        <div className="px-6 py-8">
          <div className="w-full max-w-none">
            {/* Stats bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span>[TOTAL: {webs?.length || 0}]</span>
                <span>[DOMAINS: {Object.keys(websByDomain).length}]</span>
                <span>[MODEL: {selectedModelId}]</span>
              </div>
            </div>

            {/* Webs grid/list */}
            {webs && webs.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {viewMode === 'grid' ? (
                    // Grid view - improved responsiveness
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {webs.map((web) => (
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
                                  web.status === 'PROCESSING' && "text-blue-600",
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
                  ) : (
                      // List view - full width with consistent heights
                      <div className="w-full space-y-2">
                        {webs.map((web) => (
                          <Link
                            key={web.id}
                            href={`/w/${web.id}`}
                            className="group block w-full"
                          >
                            <div className="border border-border bg-card hover:border-foreground/50 transition-all duration-200 h-16 flex items-center">
                              <div className="flex items-center justify-between gap-4 w-full px-4">
                                <div className="flex-1 min-w-0 flex items-center gap-4">
                                  <span className="text-xs text-muted-foreground uppercase shrink-0 font-mono w-24">
                                    {extractDomain(web.url)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm truncate group-hover:text-foreground/80 transition-all duration-200">
                                      {web.title || web.url}
                                    </h3>
                                    {web.prompt && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        "{web.prompt}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <span className={cn(
                                    "text-xs font-mono transition-all duration-200",
                                    web.status === 'COMPLETE' && "text-green-600",
                                    web.status === 'PENDING' && "text-yellow-600",
                                    web.status === 'PROCESSING' && "text-blue-600",
                                    web.status === 'FAILED' && "text-red-600"
                                  )}>
                                    [{web.status}]
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono w-16 text-right">
                                    {formatRelativeTime(new Date(web.createdAt))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              // Empty state
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

        {/* Footer status bar */}
        <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="h-8 px-6 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>[WORKSPACE: {workspaceId}]</span>
              <span>[WEBS: {webs?.length || 0}]</span>
              <span>[STATUS: READY]</span>
            </div>
            <div className="flex items-center gap-4">
              <span>WEBS v1.0.0</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Terminal scanline effect */}
      <div className="terminal-scanlines" aria-hidden="true" />
    </div>
  );
} 
