'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { cn } from '@repo/design/lib/utils';
import { X, ArrowSquareOut, Plus, Brain, Pulse, Eye, FileText, Question } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextBar } from './context-bar';

interface PromptBarProps {
  onSubmit: (prompt: string) => void | Promise<void>;
  isSubmitting?: boolean;
  isFocused?: boolean;
  onFocusChange?: (focused: boolean) => void;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  placeholder?: string;
}

interface DetectedUrl {
  url: string;
  id: string;
  isFromTabs?: boolean;
}

interface BrowserTab {
  url: string;
  title: string;
  favIconUrl?: string;
}

interface AIStatus {
  type: 'idle' | 'analyzing' | 'extracting' | 'summarizing' | 'indexing';
  message: string;
  progress?: number;
}

const models = [
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', short: 'C4S' },
  { id: 'gpt-4', name: 'GPT-4', short: 'GP4' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', short: 'G35' },
];

// Helper to detect if input contains a URL
function containsUrl(text: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+)/;
  return urlRegex.test(text);
}

// Helper to extract URLs from text
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Helper to extract URL and prompt
function parseInput(text: string): { url?: string; prompt?: string } {
  const urlRegex = /(https?:\/\/[^\s]+)/;
  const match = text.match(urlRegex);

  if (match) {
    const url = match[1];
    const prompt = text.replace(urlRegex, '').trim();
    return { url, prompt: prompt || undefined };
  }

  return { prompt: text };
}

// Helper to get domain from URL
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Helper to get browser tabs (with fallback for unsupported browsers)
async function getBrowserTabs(): Promise<BrowserTab[]> {
  try {
    // Check if we're in a browser extension context or have tab permissions
    if (typeof window !== 'undefined' && 'chrome' in window && (window as any).chrome?.tabs) {
      const chrome = (window as any).chrome;
      const tabs = await chrome.tabs.query({ active: false, currentWindow: true });
      return tabs.map((tab: any) => ({
        url: tab.url || '',
        title: tab.title || '',
        favIconUrl: tab.favIconUrl,
      })).filter((tab: BrowserTab) => tab.url.startsWith('http'));
    }

    // Fallback: try to get current tab info
    if (typeof window !== 'undefined') {
      return [{
        url: window.location.href,
        title: document.title,
      }];
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
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [detectedUrls, setDetectedUrls] = useState<DetectedUrl[]>([]);
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>([]);
  const [showTabSuggestions, setShowTabSuggestions] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus>({ type: 'idle', message: '' });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedModel = models.find(m => m.id === selectedModelId) || models[0];

  const hasUrl = containsUrl(input);
  const parsed = parseInput(input);

  // Load browser tabs on mount
  useEffect(() => {
    getBrowserTabs().then(setBrowserTabs);
  }, []);

  // Update detected URLs when input changes
  useEffect(() => {
    const urls = extractUrls(input);
    const newDetectedUrls = urls.map(url => ({
      url,
      id: Math.random().toString(36).substr(2, 9),
      isFromTabs: false,
    }));
    setDetectedUrls(newDetectedUrls);
  }, [input]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Simulate AI status updates when submitting
  useEffect(() => {
    if (isSubmitting) {
      const statusSequence: AIStatus[] = [
        { type: 'analyzing', message: 'ANALYZING URL STRUCTURE', progress: 25 },
        { type: 'extracting', message: 'EXTRACTING CONTENT', progress: 50 },
        { type: 'summarizing', message: 'GENERATING AI SUMMARY', progress: 75 },
        { type: 'indexing', message: 'INDEXING FOR SEARCH', progress: 90 }
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < statusSequence.length) {
          setAiStatus(statusSequence[index]);
          index++;
        } else {
          clearInterval(interval);
          setAiStatus({ type: 'idle', message: '' });
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isSubmitting]);

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting) return;

    await onSubmit(input.trim());
    setInput('');
    setIsExpanded(false);
    setDetectedUrls([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    if (e.key === 'Escape') {
      textareaRef.current?.blur();
    }

    // Show tab suggestions on Ctrl/Cmd + T
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      setShowTabSuggestions(!showTabSuggestions);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setIsExpanded(e.target.value.length > 0 || isFocused);
  };

  const handleFocus = () => {
    setIsExpanded(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    if (!input.trim()) {
      setIsExpanded(false);
    }
    onFocusChange?.(false);
  };

  const removeUrl = (urlId: string) => {
    const urlToRemove = detectedUrls.find(u => u.id === urlId);
    if (urlToRemove) {
      const newInput = input.replace(urlToRemove.url, '').trim();
      setInput(newInput);
    }
  };

  const addTabUrl = (tab: BrowserTab) => {
    const newInput = input ? `${input} ${tab.url}` : tab.url;
    setInput(newInput);
    setShowTabSuggestions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full">
      {/* Command prompt indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 ml-4"
            >
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Brain size={12} weight="duotone" className="text-blue-500" />
                </motion.div>
                <Pulse size={12} weight="duotone" className="text-blue-500 animate-pulse" />
              </div>
              <span className="text-xs text-blue-500 font-mono uppercase">
                {aiStatus.message}
              </span>
              {aiStatus.progress && (
                <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${aiStatus.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Main input container */}
      <div
        className={cn(
          'relative border bg-background transition-all duration-300',
          isFocused ? 'border-foreground/30 shadow-sm' : 'border-border',
          isSubmitting && 'border-blue-500/30'
        )}
      >
        {/* Model selector bar */}
        <div className="flex items-center justify-between border-b border-border bg-card/50 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onMouseEnter={() => setShowHelpTooltip(true)}
                onMouseLeave={() => setShowHelpTooltip(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <Question size={12} weight="duotone" />
              </button>
              <AnimatePresence>
                {showHelpTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute left-0 top-6 z-50 w-64 p-2 bg-popover border border-border text-xs text-popover-foreground shadow-lg"
                  >
                    Enter a URL to process. Add optional instructions after the URL. Press ENTER to submit.
                    {browserTabs.length > 0 && (
                      <span className="block mt-1 font-mono">Ctrl+T for browser tabs.</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              MODEL
            </span>
            <div className="flex gap-1">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onModelChange?.(model.id)}
                  className={cn(
                    'px-2 py-1 text-xs font-mono transition-all duration-200',
                    selectedModelId === model.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {model.short}
                </button>
              ))}
            </div>
          </div>

          {/* Input status indicators */}
          <div className="flex items-center gap-2 text-xs">
            {browserTabs.length > 0 && (
              <button
                onClick={() => setShowTabSuggestions(!showTabSuggestions)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 font-mono transition-all duration-200',
                  showTabSuggestions
                    ? 'text-blue-600 bg-blue-600/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Plus size={10} weight="duotone" />
                TABS
              </button>
            )}
            {hasUrl && (
              <span className="text-green-600 font-mono">
                [URL]
              </span>
            )}
          </div>
        </div>

        {/* Tab suggestions dropdown */}
        <AnimatePresence>
          {showTabSuggestions && browserTabs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-border bg-card/30 overflow-hidden"
            >
              <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  BROWSER TABS
                </div>
                {browserTabs.slice(0, 5).map((tab, index) => (
                  <motion.button
                    key={tab.url}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => addTabUrl(tab)}
                    className="w-full flex items-center gap-2 p-2 text-left hover:bg-accent transition-all duration-200 rounded"
                  >
                    {tab.favIconUrl && (
                      <img src={tab.favIconUrl} alt="" className="w-4 h-4" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{tab.title}</div>
                      <div className="text-xs text-muted-foreground truncate font-mono">
                        {getDomain(tab.url)}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={isSubmitting}
            className={cn(
              'w-full resize-none bg-transparent font-mono text-sm',
              'placeholder:text-muted-foreground focus:outline-none',
              'min-h-[24px] max-h-[120px] leading-relaxed',
              'transition-all duration-200'
            )}
            rows={1}
          />
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between border-t border-border bg-card/50 px-3 py-2">
          {/* Character count */}
          <div className="flex items-center gap-3">
            {input.length > 0 && (
              <span className="text-xs text-muted-foreground font-mono">
                {input.length}
              </span>
            )}
          </div>

          {/* ENTER button */}
          <motion.div
            animate={{
              opacity: input.trim() && !isSubmitting ? 1 : 0.5,
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-all duration-200"
          >
            <span className="font-mono">ENTER</span>
          </motion.div>
        </div>
      </div>

      {/* Context Bar */}
      <ContextBar
        detectedUrls={detectedUrls}
        onRemoveUrl={removeUrl}
      />
    </div>
  );
} 