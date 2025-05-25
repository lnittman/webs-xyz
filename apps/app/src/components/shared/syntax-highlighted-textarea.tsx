'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@repo/design/lib/utils';

interface SyntaxHighlightedTextareaProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function SyntaxHighlightedTextarea({
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    placeholder,
    disabled,
    className,
}: SyntaxHighlightedTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    // Sync scroll position between textarea and highlight layer
    const handleScroll = () => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

            // Sync highlight layer height
            if (highlightRef.current) {
                highlightRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        }
    }, [value]);

    // Syntax highlighting function
    const highlightSyntax = (text: string): string => {
        if (!text) return '';

        return text
            // Highlight URLs
            .replace(
                /(https?:\/\/[^\s]+)/g,
                '<span class="text-blue-600 bg-blue-600/10 px-1 rounded">$1</span>'
            )
            // Highlight markdown bold
            .replace(
                /(\*\*[^*]+\*\*)/g,
                '<span class="text-yellow-600 bg-yellow-600/10 px-1 rounded">$1</span>'
            )
            // Highlight markdown italic
            .replace(
                /(\*[^*]+\*)/g,
                '<span class="text-green-600 bg-green-600/10 px-1 rounded">$1</span>'
            )
            // Highlight markdown code
            .replace(
                /(`[^`]+`)/g,
                '<span class="text-purple-600 bg-purple-600/10 px-1 rounded font-mono">$1</span>'
            )
            // Convert newlines to <br> tags
            .replace(/\n/g, '<br>');
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="relative p-4">
            {/* Syntax highlighting layer */}
            <div
                ref={highlightRef}
                className={cn(
                    'absolute inset-4 pointer-events-none overflow-hidden whitespace-pre-wrap break-words',
                    'font-mono text-sm leading-relaxed',
                    'text-transparent', // Make text transparent so only highlights show
                    className
                )}
                style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                }}
                dangerouslySetInnerHTML={{
                    __html: highlightSyntax(value),
                }}
            />

            {/* Actual textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleTextareaChange}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                onScroll={handleScroll}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    'relative z-10 w-full resize-none bg-transparent font-mono text-sm',
                    'placeholder:text-muted-foreground focus:outline-none',
                    'min-h-[32px] max-h-[120px] leading-relaxed',
                    'transition-all duration-200',
                    // Make background transparent so highlights show through
                    'bg-transparent',
                    className
                )}
                rows={1}
                style={{
                    // Ensure textarea text is visible
                    color: 'inherit',
                }}
            />
        </div>
    );
} 