'use client';

import { useState, useRef, useEffect, KeyboardEvent, forwardRef, useImperativeHandle } from 'react';

import { Plus } from '@phosphor-icons/react/dist/ssr';

import { cn } from '@repo/design/lib/utils';

import { UrlSuggestionsDropdown } from './url-suggestions-dropdown';

interface UrlInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (url: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    isFocused?: boolean;
    placeholder?: string;
}

export interface UrlInputRef {
    focus: () => void;
}

export const UrlInput = forwardRef<UrlInputRef, UrlInputProps>(({
    value,
    onChange,
    onSubmit,
    onFocus,
    onBlur,
    isFocused,
    placeholder = "example.com"
}, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>();

    // Expose focus method to parent components
    useImperativeHandle(ref, () => ({
        focus: () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }), []);

    // Mock suggestions for calculating navigation bounds
    const mockSuggestions = [
        'github.com', 'vercel.com', 'react.dev', 'news.ycombinator.com',
        'stackoverflow.com', 'reddit.com/r/programming', 'dev.to'
    ];

    // Filter suggestions based on value
    const filteredSuggestions = value
        ? mockSuggestions.filter(url => url.toLowerCase().includes(value.toLowerCase()))
        : mockSuggestions;

    // Measure container width for dropdown
    useEffect(() => {
        if (containerRef.current) {
            const updateWidth = () => {
                setContainerWidth(containerRef.current?.offsetWidth);
            };
            updateWidth();
            window.addEventListener('resize', updateWidth);
            return () => window.removeEventListener('resize', updateWidth);
        }
    }, []);

    // Reset selected index when value changes
    useEffect(() => {
        setSelectedIndex(-1);
    }, [value]);

    // Focus input when isFocused prop becomes true (keeping for backward compatibility)
    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions) {
            if (e.key === 'Enter' && value.trim()) {
                e.preventDefault();
                handleSubmit();
            }
            if (e.key === 'Escape') {
                inputRef.current?.blur();
            }
            return;
        }

        // Handle navigation within dropdown
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                );
                break;

            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                );
                break;

            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
                    handleSuggestionSelect(filteredSuggestions[selectedIndex]);
                } else if (value.trim()) {
                    handleSubmit();
                }
                break;

            case 'Escape':
                e.preventDefault();
                setShowSuggestions(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleSubmit = () => {
        if (!value.trim()) return;
        const urlToAdd = value.startsWith('http') ? value : `https://${value}`;
        onSubmit(urlToAdd);
        onChange('');
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    const handleSuggestionSelect = (url: string) => {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        // Auto-submit without showing in input field
        const urlToAdd = url.startsWith('http') ? url : `https://${url}`;
        onSubmit(urlToAdd);
    };

    const isValidUrl = (url: string) => {
        if (!url.trim()) return false;
        try {
            // For URLs that already have protocol
            if (url.startsWith('http')) {
                new URL(url);
                return true;
            }

            // For domain-only strings, require at least one dot and valid TLD
            const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
            if (!domainPattern.test(url)) return false;

            // Must have at least one dot (for TLD)
            if (!url.includes('.')) return false;

            // Check if it's a valid URL when https:// is prepended
            const testUrl = `https://${url}`;
            new URL(testUrl);
            return true;
        } catch {
            return false;
        }
    };

    const handleFocus = () => {
        setShowSuggestions(true);
        setSelectedIndex(-1);
        onFocus?.();
    };

    const handleBlur = (e: React.FocusEvent) => {
        // Don't close suggestions if clicking within the dropdown
        if (containerRef.current?.contains(e.relatedTarget as Node)) {
            return;
        }
        // Slight delay to allow for selection clicks
        setTimeout(() => {
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }, 150);
        onBlur?.();
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-2 z-40">
                <span className="px-2 py-1 text-xs bg-accent/80 text-accent-foreground font-mono rounded-sm border border-accent/40 shadow-sm">
                    https://
                </span>
            </div>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={cn(
                    "w-full h-10 pl-[84px] pr-12 text-sm bg-background border font-mono text-foreground rounded-lg transition-all duration-200",
                    "placeholder:text-muted-foreground/60",
                    "hover:border-foreground/30 hover:shadow-sm",
                    "focus:border-foreground/50 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-foreground/10",
                    isFocused ? "border-foreground/50 shadow-md ring-2 ring-foreground/10" : "border-border"
                )}
            />

            {/* Plus button for adding URL */}
            <button
                onClick={handleSubmit}
                disabled={!isValidUrl(value)}
                className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-md transition-all duration-200",
                    isValidUrl(value)
                        ? "bg-accent hover:bg-accent/80 text-accent-foreground hover:shadow-sm border border-accent/40"
                        : "bg-muted/50 text-muted-foreground/40 border border-muted cursor-not-allowed"
                )}
            >
                <Plus size={12} weight="bold" />
            </button>

            {/* Suggestions dropdown */}
            <UrlSuggestionsDropdown
                isOpen={showSuggestions}
                searchValue={value}
                selectedIndex={selectedIndex}
                onSelect={handleSuggestionSelect}
                width={containerWidth}
                anchorElement={containerRef.current}
            />
        </div>
    );
});

UrlInput.displayName = 'UrlInput'; 