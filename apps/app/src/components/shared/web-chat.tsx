'use client';

import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneTilt, SpinnerGap, User, Robot, Plus, MagnifyingGlass, Tag, Brain, Link as LinkIcon } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';
import { Textarea } from '@repo/design/components/ui/textarea';
import { Card } from '@repo/design/components/ui/card';
import { Badge } from '@repo/design/components/ui/badge';
import type { Web } from '@/types/web';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WebChatProps {
    web: Web;
    className?: string;
}

// Component for rendering tool invocations
function ToolInvocation({ toolInvocation, web }: { toolInvocation: any; web: Web }) {
    const router = useRouter();
    const { toolName, args, state, result } = toolInvocation;

    // Render different UI based on tool and state
    switch (toolName) {
        case 'addUrlToWeb':
            return (
                <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                        <Plus size={16} weight="duotone" className="text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {state === 'result' ? 'Added URL' : 'Adding URL...'}
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                {args.url}
                            </div>
                            {args.reason && (
                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
                                    "{args.reason}"
                                </div>
                            )}
                            {state === 'result' && result?.success && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                    Total URLs: {result.updatedUrlCount}
                                </Badge>
                            )}
                        </div>
                    </div>
                </Card>
            );

        case 'updateWebEmoji':
            return (
                <Card className="p-3 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{args.emoji}</span>
                        <div className="text-sm text-purple-900 dark:text-purple-100">
                            {state === 'result' ? 'Emoji updated!' : 'Updating emoji...'}
                        </div>
                    </div>
                </Card>
            );

        case 'searchRelatedWebs':
            if (state === 'call' || state === 'partial-call') {
                return (
                    <Card className="p-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                            <MagnifyingGlass size={16} weight="duotone" className="text-green-600 animate-pulse" />
                            <span className="text-sm text-green-900 dark:text-green-100">
                                Searching for: "{args.query}"...
                            </span>
                        </div>
                    </Card>
                );
            }

            if (state === 'result' && result) {
                return (
                    <Card className="p-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-900 dark:text-green-100">
                                <MagnifyingGlass size={16} weight="duotone" className="text-green-600" />
                                Found {result.count} related webs
                            </div>
                            {result.webs?.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {result.webs.map((relatedWeb: any) => (
                                        <button
                                            key={relatedWeb.id}
                                            onClick={() => router.push(`/w/${relatedWeb.id}`)}
                                            className="w-full text-left p-2 rounded hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {relatedWeb.emoji && <span>{relatedWeb.emoji}</span>}
                                                <span className="text-sm text-green-800 dark:text-green-200 flex-1 truncate">
                                                    {relatedWeb.title || relatedWeb.url}
                                                </span>
                                            </div>
                                            {relatedWeb.topics?.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {relatedWeb.topics.slice(0, 3).map((topic: string, idx: number) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {topic}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                );
            }
            break;

        case 'getDetailedInsight':
            if (state === 'result' && result) {
                const { aspect, filter, details } = result;
                return (
                    <Card className="p-3 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-100">
                                <Brain size={16} weight="duotone" className="text-orange-600" />
                                Detailed {aspect} insights
                                {filter && <span className="text-xs text-orange-700">• filtered by "{filter}"</span>}
                            </div>
                            <div className="text-xs text-orange-800 dark:text-orange-200 space-y-1">
                                {aspect === 'topics' && details.filtered?.map((topic: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="mr-1">
                                        {topic}
                                    </Badge>
                                ))}
                                {aspect === 'entities' && details.byType && (
                                    <div className="space-y-1">
                                        {Object.entries(details.byType).map(([type, values]: [string, any]) => (
                                            <div key={type}>
                                                <span className="font-medium">{type}:</span> {values.join(', ')}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {aspect === 'sentiment' && (
                                    <div>
                                        <div>Overall: <Badge>{details.overall}</Badge></div>
                                        {details.confidence && (
                                            <div>Confidence: {Math.round(details.confidence * 100)}%</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            }
            break;
    }

    // Default loading state
    return (
        <Card className="p-3 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
                <SpinnerGap size={16} className="animate-spin text-gray-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    Processing {toolName}...
                </span>
            </div>
        </Card>
    );
}

export function WebChat({ web, className }: WebChatProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
        api: `/api/webs/${web.id}/chat`,
        maxSteps: 5,
        onError: (error) => {
            console.error('Chat error:', error);
        },
        initialMessages: web.status === 'COMPLETE' ? [
            {
                id: 'welcome',
                role: 'assistant',
                content: `I can help you explore and understand the analysis of "${web.title}". You can ask me questions about the content, insights, topics, or I can help you:

• Add related URLs to expand the analysis
• Search for similar webs in your collection
• Get detailed insights about specific topics or entities
• Update the web's emoji

What would you like to know?`,
            }
        ] : [],
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    // Suggested prompts
    const suggestedPrompts = [
        "What are the main topics?",
        "Search for related webs about " + (web.topics?.[0] || "this topic"),
        "Add a related URL",
        "Show me entity details",
    ];

    if (web.status !== 'COMPLETE') {
        return (
            <div className={cn("p-4 border border-border rounded-lg bg-muted/30", className)}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <SpinnerGap className="h-4 w-4 animate-spin" />
                    Chat will be available once analysis is complete
                </div>
            </div>
        );
    }

    return (
        <div className={cn("border border-border rounded-lg bg-background overflow-hidden", className)}>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Robot size={16} weight="duotone" className="text-blue-600" />
                        <span className="text-sm font-medium">AI Assistant</span>
                        <span className="text-xs text-muted-foreground">• Ready to help</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs"
                    >
                        {isExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className={cn(
                "transition-all duration-300",
                isExpanded ? "h-96" : "h-64"
            )}>
                <div className="h-full overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={cn(
                                    "flex gap-3",
                                    message.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex-shrink-0">
                                        <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center">
                                            <Robot size={12} weight="duotone" className="text-blue-600" />
                                        </div>
                                    </div>
                                )}

                                <div className={cn(
                                    "max-w-[80%] space-y-2",
                                    message.role === 'user' && "items-end"
                                )}>
                                    {/* Text content */}
                                    {message.content && (
                                        <div className={cn(
                                            "rounded-lg px-3 py-2 text-sm",
                                            message.role === 'user'
                                                ? "bg-blue-600 text-white ml-auto"
                                                : "bg-muted text-foreground"
                                        )}>
                                            <div className="whitespace-pre-wrap">{message.content}</div>
                                        </div>
                                    )}

                                    {/* Tool invocations */}
                                    {message.toolInvocations?.map((toolInvocation, idx) => (
                                        <ToolInvocation
                                            key={`${toolInvocation.toolCallId}-${idx}`}
                                            toolInvocation={toolInvocation}
                                            web={web}
                                        />
                                    ))}
                                </div>

                                {message.role === 'user' && (
                                    <div className="flex-shrink-0">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                            <User size={12} weight="duotone" className="text-white" />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center">
                                    <SpinnerGap size={12} weight="duotone" className="text-blue-600 animate-spin" />
                                </div>
                            </div>
                            <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                                <div className="flex items-center gap-1">
                                    <span>Thinking</span>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Suggested prompts */}
            {messages.length <= 1 && (
                <div className="px-4 pb-2">
                    <div className="flex flex-wrap gap-1">
                        {suggestedPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInput(prompt)}
                                className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border bg-muted/30">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about this web analysis..."
                        className="flex-1 min-h-[40px] max-h-32 resize-none"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="h-10 w-10 flex-shrink-0"
                    >
                        {isLoading ? (
                            <SpinnerGap size={16} weight="duotone" className="animate-spin" />
                        ) : (
                            <PaperPlaneTilt size={16} weight="duotone" />
                        )}
                    </Button>
                </form>
                <div className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                </div>
            </div>
        </div>
    );
} 