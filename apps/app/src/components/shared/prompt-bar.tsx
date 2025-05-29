'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { cn } from '@repo/design/lib/utils';
import { Plus, ArrowUp, SpinnerGap, ArrowSquareOut, X, Globe } from '@phosphor-icons/react/dist/ssr';
import dynamic from 'next/dynamic';
import {
  inputTextAtom,
  hasUrlsAtom,
  updateStableUrlsAtom,
  stableUrlsAtom
} from '@/atoms/urls';
import { ModelPicker } from './model-picker';
import { UrlInput } from './url-input';
import { Button } from '@repo/design/components/ui/button';
import { useModals } from '@repo/design/sacred';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollFadeContainer } from './scroll-fade-container';

// Load the modal only when opened to keep the initial bundle small
const BrowserTabsModal = dynamic(
  () => import('./browser-tabs-modal').then(m => m.BrowserTabsModal),
  { ssr: false }
);

interface PromptBarProps {
  onSubmit: (prompt: string) => void | Promise<void>;
  isSubmitting?: boolean;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
}

interface BrowserTab {
  url: string;
  title: string;
  favIconUrl?: string;
}

// Enhanced browser tabs detection
async function getBrowserTabs(): Promise<BrowserTab[]> {
  try {
    // Check if we're in a browser extension context or have tab permissions
    if (typeof window !== 'undefined' && 'chrome' in window && (window as any).chrome?.tabs) {
      const chrome = (window as any).chrome;
      const tabs = await chrome.tabs.query({ currentWindow: true });
      return tabs.map((tab: any) => ({
        url: tab.url || '',
        title: tab.title || '',
        favIconUrl: tab.favIconUrl,
      })).filter((tab: BrowserTab) => tab.url.startsWith('http'));
    }

    // Fallback: try to get current tab info and some mock tabs for demo
    if (typeof window !== 'undefined') {
      const currentTab = {
        url: window.location.href,
        title: document.title,
      };

      // Add some mock tabs for demonstration
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
        }
      ];

      return [currentTab, ...mockTabs];
    }
  } catch (error) {
    console.log('Browser tabs not accessible:', error);
  }

  return [];
}

export function PromptBar({
  onSubmit,
  isSubmitting = false,
  isFocused = false,
  onFocusChange,
  selectedModelId = 'claude-4-sonnet',
  onModelChange,
}: PromptBarProps) {
  const [input, setInput] = useAtom(inputTextAtom);
  const [hasUrls] = useAtom(hasUrlsAtom);
  const [, updateStableUrls] = useAtom(updateStableUrlsAtom);
  const [stableUrls] = useAtom(stableUrlsAtom);
  const [urlInput, setUrlInput] = useState('');
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>([]);
  const { open } = useModals();

  // Load browser tabs on mount
  useEffect(() => {
    getBrowserTabs().then(setBrowserTabs);
  }, []);

  // Update stable URLs when input changes
  useEffect(() => {
    updateStableUrls();
  }, [input, updateStableUrls]);

  const handleSubmit = async () => {
    if (!hasUrls || isSubmitting) return;

    try {
      await onSubmit(input.trim());
      setInput('');
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  const handleUrlSubmit = (url: string) => {
    const newInput = input ? `${input} ${url}` : url;
    setInput(newInput);
  };

  const addTabUrl = (tab: BrowserTab) => {
    const newInput = input ? `${input} ${tab.url}` : tab.url;
    setInput(newInput);
  };

  const addMultipleTabUrls = (tabs: BrowserTab[]) => {
    const urls = tabs.map(tab => tab.url).join(' ');
    const newInput = input ? `${input} ${urls}` : urls;
    setInput(newInput);
  };

  const openTabsModal = () => {
    open(BrowserTabsModal, {
      onSelectTab: addTabUrl,
      onSelectMultipleTabs: addMultipleTabUrls
    });
  };

  const removeUrl = (urlId: string) => {
    const urlToRemove = stableUrls.find(u => u.id === urlId);
    if (urlToRemove) {
      const newInput = input.replace(urlToRemove.url, '').trim();
      setInput(newInput);
    }
  };

  return (
    <div
      className={cn(
        'relative border bg-background transition-all duration-200 rounded-lg z-50',
        isFocused ? 'border-foreground/30 shadow-sm' : 'border-border',
        isSubmitting && 'border-blue-500/30'
      )}
    >
      {/* Top bar with URL input and tabs button */}
      <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b border-border">
        {/* URL Input */}
        <div className="flex-1 max-w-md">
          <UrlInput
            value={urlInput}
            onChange={setUrlInput}
            onSubmit={handleUrlSubmit}
            onFocus={() => onFocusChange?.(true)}
            onBlur={() => onFocusChange?.(false)}
            isFocused={isFocused}
          />
        </div>

        {/* Tabs button */}
        {browserTabs.length > 0 && (
          <button
            onClick={openTabsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 font-mono transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md border border-transparent hover:border-accent/30"
          >
            <Plus size={12} weight="duotone" />
            <span className="uppercase tracking-wider text-xs">Tabs</span>
          </button>
        )}
      </div>

      {/* Main content area with URL tiles */}
      <div className="p-2">
        <ScrollFadeContainer
          showLeft
          showRight
          fadeSize={24}
          className="h-12"
          scrollableClassName="flex gap-3 overflow-x-auto scrollbar-hide"
        >
          <AnimatePresence mode="wait">
            {stableUrls.length > 0 ? (
              stableUrls.map((detectedUrl) => (
                <motion.div
                  key={detectedUrl.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-3 px-3 py-2 border border-border bg-background hover:border-foreground/30 hover:shadow-sm transition-all duration-200 shrink-0 h-12 w-72 rounded-lg relative"
                  style={{
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {/* URL info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-green-600 font-mono uppercase mb-1 tracking-wider">
                      {detectedUrl.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                    </div>
                    <div className="text-xs font-mono text-foreground truncate">
                      {detectedUrl.url}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => window.open(detectedUrl.url, '_blank')}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 rounded-md"
                      title="Open in new tab"
                    >
                      <ArrowSquareOut size={12} weight="duotone" />
                    </button>
                    <button
                      onClick={() => removeUrl(detectedUrl.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 rounded-md"
                      title="Remove URL"
                    >
                      <X size={12} weight="duotone" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center w-full h-12"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe size={14} weight="duotone" />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Enter URLs above to see context
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollFadeContainer>
      </div>

      {/* Bottom bar with model picker and submit button */}
      <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-t border-border">
        {/* Model picker */}
        <ModelPicker
          selectedModelId={selectedModelId}
          onModelChange={onModelChange}
          disabled={isSubmitting}
        />

        {/* Submit button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8 flex items-center justify-center transition-all duration-300 rounded-md",
            hasUrls && !isSubmitting
              ? "bg-accent hover:bg-accent/80 text-foreground hover:text-foreground/80 active:text-foreground"
              : "bg-accent/60 hover:bg-accent/80 text-foreground/60 hover:text-foreground/80"
          )}
          onClick={handleSubmit}
          disabled={isSubmitting || !hasUrls}
        >
          {isSubmitting ? (
            <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp weight="bold" className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
} 