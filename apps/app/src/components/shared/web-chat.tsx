'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneTilt, SpinnerGap, User, Robot } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';
import { Textarea } from '@repo/design/components/ui/textarea';
import type { Web } from '@/types/web';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    webContext?: boolean;
}

interface WebChatProps {
    web: Web;
    className?: string;
}

export function WebChat({ web, className }: WebChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add initial context message when web analysis is complete
    useEffect(() => {
        if (web.status === 'COMPLETE' && messages.length === 0) {
            const contextMessage: Message = {
                id: `context-${Date.now()}`,
                role: 'assistant',
                content: `I can help you explore and understand the analysis of "${web.title}". You can ask me questions about the content, insights, topics, or request additional analysis. What would you like to know?`,
                timestamp: new Date(),
                webContext: true,
            };
            setMessages([contextMessage]);
        }
    }, [web.status, web.title, messages.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // TODO: Integrate with chatAgent API
            // For now, simulate a response
            await new Promise(resolve => setTimeout(resolve, 1000));

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: `I understand you're asking about "${userMessage.content}". Based on the analysis of ${web.title}, I can provide insights about the ${web.topics?.slice(0, 3).join(', ')} topics covered. This is a placeholder response - the actual chat integration will connect to the chatAgent.`,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

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
                isExpanded ? "h-96" : "h-48"
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
                                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                                    message.role === 'user'
                                        ? "bg-blue-600 text-white ml-auto"
                                        : message.webContext
                                            ? "bg-green-600/10 text-green-700 border border-green-600/20"
                                            : "bg-muted text-foreground"
                                )}>
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                    <div className={cn(
                                        "text-xs mt-1 opacity-70",
                                        message.role === 'user' ? "text-blue-100" : "text-muted-foreground"
                                    )}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
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

            {/* Input */}
            <div className="p-4 border-t border-border bg-muted/30">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
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