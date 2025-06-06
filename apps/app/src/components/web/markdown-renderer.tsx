'use client';

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Copy, Check } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

interface CodeBlockProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);
    const { theme } = useTheme();

    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(codeString);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [codeString]);

    if (inline) {
        return (
            <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm" {...props}>
                {children}
            </code>
        );
    }

    return (
        <div className="relative group my-4">
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm border border-border"
                >
                    {isCopied ? (
                        <Check className="h-4 w-4 text-green-500" weight="bold" />
                    ) : (
                        <Copy className="h-4 w-4" weight="duotone" />
                    )}
                </Button>
            </div>
            <SyntaxHighlighter
                language={language || 'text'}
                style={theme === 'dark' ? oneDark : oneLight}
                customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    fontSize: '0.875rem',
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f6f6f6',
                }}
                codeTagProps={{
                    style: {
                        fontFamily: 'var(--font-mono)',
                    }
                }}
            >
                {codeString}
            </SyntaxHighlighter>
        </div>
    );
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headings
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mt-5 mb-3 text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base font-medium mt-3 mb-2 text-foreground">{children}</h4>
                    ),

                    // Paragraph
                    p: ({ children }) => (
                        <p className="my-3 leading-relaxed text-foreground/90">{children}</p>
                    ),

                    // Lists
                    ul: ({ children }) => (
                        <ul className="my-3 ml-6 list-disc space-y-1 text-foreground/90">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-3 ml-6 list-decimal space-y-1 text-foreground/90">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="ml-2">{children}</li>
                    ),

                    // Links
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            {children}
                        </a>
                    ),

                    // Blockquote
                    blockquote: ({ children }) => (
                        <blockquote className="my-4 border-l-4 border-accent pl-4 italic text-muted-foreground">
                            {children}
                        </blockquote>
                    ),

                    // Code
                    code: CodeBlock,

                    // Emphasis
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-foreground">{children}</strong>
                    ),

                    // Tables
                    table: ({ children }) => (
                        <div className="my-4 overflow-x-auto">
                            <table className="min-w-full border border-border">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-muted">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-border">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-muted/50 transition-colors">{children}</tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 text-foreground/90 border-b border-border">
                            {children}
                        </td>
                    ),

                    // Horizontal rule
                    hr: () => (
                        <hr className="my-6 border-border" />
                    ),

                    // Images
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt || ''}
                            className="my-4 rounded-lg max-w-full h-auto"
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
} 