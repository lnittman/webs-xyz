'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { useAtom } from 'jotai';
import { cn } from '@repo/design/lib/utils';
import { Plus, Pulse, Eye, Question } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextBar } from './context-bar';
import { SyntaxHighlightedTextarea } from './syntax-highlighted-textarea';
import { BrowserTabsModal } from './browser-tabs-modal';
import { useModals } from '@repo/design/sacred';
import {
  inputTextAtom,
  hasUrlsAtom,
  updateStableUrlsAtom
} from '@/atoms/urls';

interface PromptBarProps {
  onSubmit: (prompt: string) => void | Promise<void>;
  isSubmitting?: boolean;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  placeholder?: string;
}

interface BrowserTab {
  url: string;
  title: string;
  favIconUrl?: string;
}

interface ProcessingStatus {
  type: 'idle' | 'extracting' | 'processing' | 'summarizing' | 'complete';
  message: string;
  progress?: number;
}

const models = [
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', short: 'C4S' },
  { id: 'gpt-4o', name: 'GPT-4o', short: 'GP4' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', short: 'GM4' },
  { id: 'gemini-pro', name: 'Gemini Pro', short: 'GEM' },
];

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
  placeholder = 'https://example.com [optional: summarize the main points]',
}: PromptBarProps) {
  const [input, setInput] = useAtom(inputTextAtom);
  const [hasUrls] = useAtom(hasUrlsAtom);
  const [, updateStableUrls] = useAtom(updateStableUrlsAtom);

  const [isExpanded, setIsExpanded] = useState(false);
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>([]);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({ type: 'idle', message: '' });

  const selectedModel = models.find(m => m.id === selectedModelId) || models[0];
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
    if (!input.trim() || isSubmitting) return;

    // Simulate processing status updates when submitting
    setProcessingStatus({ type: 'extracting', message: 'EXTRACTING CONTENT', progress: 25 });

    const statusSequence: ProcessingStatus[] = [
      { type: 'processing', message: 'PROCESSING CONTENT', progress: 50 },
      { type: 'summarizing', message: 'GENERATING SUMMARY', progress: 75 },
    ];

    // Update status every 800ms
    statusSequence.forEach((status, index) => {
      setTimeout(() => {
        setProcessingStatus(status);
      }, (index + 1) * 800);
    });

    // Reset status after completion
    setTimeout(() => {
      setProcessingStatus({ type: 'idle', message: '' });
    }, statusSequence.length * 800 + 1000);

    try {
      await onSubmit(input.trim());
      setInput('');
      setIsExpanded(false);
    } catch (error) {
      setProcessingStatus({ type: 'idle', message: '' });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }

    // Show tab modal on Ctrl/Cmd + T
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      openTabsModal();
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    onFocusChange?.(false);
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

  return (
    <>
      <div
        className={cn(
          'relative border bg-background transition-all duration-200 rounded-lg overflow-hidden',
          isFocused ? 'border-foreground/30 shadow-sm' : 'border-border',
          isSubmitting && 'border-blue-500/30'
        )}
      >
        {/* Model selector bar */}
        <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onMouseEnter={() => setShowHelpTooltip(true)}
                onMouseLeave={() => setShowHelpTooltip(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md hover:bg-background"
              >
                <Question size={14} weight="duotone" />
              </button>
              <AnimatePresence>
                {showHelpTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute left-0 top-8 z-50 w-64 p-3 bg-popover border border-border text-xs text-popover-foreground shadow-lg rounded-lg"
                  >
                    Enter a URL to process. Add optional instructions after the URL. Press ENTER to submit.
                    {browserTabs.length > 0 && (
                      <span className="block mt-2 font-mono text-muted-foreground">⌘T for browser tabs</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Model
              </span>
              <div className="flex gap-1">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => onModelChange?.(model.id)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-mono transition-all duration-200 rounded-md',
                      selectedModelId === model.id
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background'
                    )}
                  >
                    {model.short}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input status indicators */}
          <div className="flex items-center gap-3 text-xs">
            {browserTabs.length > 0 && (
              <button
                onClick={openTabsModal}
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-background rounded-md"
              >
                <Plus size={12} weight="duotone" />
                <span className="uppercase tracking-wider">Tabs</span>
              </button>
            )}
            {hasUrls && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-600/10 border border-green-600/20 text-green-600 rounded-md">
                <Eye size={12} weight="duotone" />
                <span className="font-mono uppercase text-xs">URL</span>
              </div>
            )}
          </div>
        </div>

        {/* Input area with syntax highlighting */}
        <SyntaxHighlightedTextarea
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={isSubmitting}
        />

        {/* Bottom status bar */}
        <div className="flex items-center justify-between bg-muted/30 px-4 py-3 border-t border-border">
          {/* Character count and status */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-mono">
              {input.length} chars
            </span>
            {processingStatus.type !== 'idle' && (
              <div className="flex items-center gap-2">
                <Pulse size={12} weight="duotone" className="text-blue-600 animate-pulse" />
                <span className="text-xs text-blue-600 font-mono uppercase tracking-wider">
                  {processingStatus.message}
                </span>
              </div>
            )}
          </div>

          {/* Submit indicator */}
          <motion.div
            animate={{
              opacity: input.trim() && !isSubmitting ? 1 : 0.5,
            }}
            className="flex items-center gap-2 text-xs text-muted-foreground transition-all duration-200"
          >
            <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">
              ⏎
            </kbd>
            <span className="font-mono uppercase tracking-wider">Submit</span>
          </motion.div>
        </div>
      </div>

      {/* Context Bar */}
      <ContextBar />
    </>
  );
} 