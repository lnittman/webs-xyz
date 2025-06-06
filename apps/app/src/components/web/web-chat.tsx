'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneTilt, SpinnerGap } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';
import { Textarea } from '@repo/design/components/ui/textarea';
import type { Web } from '@/types/web';
import { useState, useRef, useEffect } from 'react';
import { useWebChatMessages } from '@/hooks/web/queries';
import { useChat } from 'ai/react';
import type { Message } from 'ai';
import { ModelPicker } from '@/components/shared/menu/model-picker';
import { useUser } from '@repo/auth/client';
import { MarkdownRenderer } from './markdown-renderer';

interface WebChatProps {
    web: Web;
    className?: string;
}

const MessageItem = ({ message, isStreaming }: { message: Message; isStreaming?: boolean }) => {
    const isUser = message.role === 'user';
    const { user } = useUser();

    // Get user initials for avatar
    const initials = user?.fullName
        ? user.fullName
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || "?";

    if (isUser) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
            >
                <div className="flex items-start gap-3">
                    {/* User avatar matching user-menu style */}
                    <button className={cn(
                        "h-8 w-8 bg-transparent text-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 border border-border transition-all duration-200 rounded-full",
                        "hover:bg-accent hover:border-foreground/20"
                    )}>
                        {initials}
                    </button>

                    {/* User message with border */}
                    <div className="flex-1">
                        <div className="bg-muted/40 border border-border/40 rounded-lg px-4 py-3 text-sm">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                {message.content}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // AI message - full width, no avatar
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
        >
            <div className="max-w-2xl">
                <MarkdownRenderer content={message.content} />
                {isStreaming && (
                    <motion.span
                        className="inline-block w-[2px] h-[1.2em] bg-foreground/50 ml-1"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    />
                )}
            </div>
        </motion.div>
    );
};

export function WebChat({ web, className }: WebChatProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [selectedModelId, setSelectedModelId] = useState('claude-4-sonnet');

    // Load existing messages
    const { messages: existingMessages = [], isLoading: messagesLoading } = useWebChatMessages(web.id);

    // Use AI SDK's useChat hook
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        error
    } = useChat({
        api: `/api/webs/${web.id}/chat`,
        initialMessages: existingMessages.length > 0 ? existingMessages : [],
        onError: (error) => {
            console.error('Chat error:', error);
        }
    });

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    // Handle scroll behavior - only scroll messages container, not page
    useEffect(() => {
        if (messagesEndRef.current && messagesContainerRef.current) {
            // Only auto-scroll if we're near the bottom
            const container = messagesContainerRef.current;
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

            if (isNearBottom || messages.length === 1) {
                messagesEndRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }
        }
    }, [messages]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        handleSubmit(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
                handleSubmit(e as any);
            }
        }
    };

    const handleModelChange = (modelId: string) => {
        setSelectedModelId(modelId);
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Messages Container - now accounts for sticky input */}
            <div className="flex-1 flex flex-col min-h-0 pb-32"> {/* Add bottom padding for sticky input */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto px-6 py-6 scrollbar-none"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="max-w-2xl mx-auto">
                        {/* Messages */}
                        <AnimatePresence mode="popLayout">
                            {messages.map((message, index) => (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                    isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <div className="max-w-2xl">
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                                        <div className="text-sm text-red-500">
                                            Sorry, there was an error processing your message. Please try again.
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Sticky Input Area at bottom */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/50 backdrop-blur-sm z-10">
                <div className="max-w-2xl mx-auto px-6 py-4">
                    <form onSubmit={handleFormSubmit}>
                        {/* Input row */}
                        <div className={cn(
                            "relative border bg-background transition-all duration-200 rounded-lg mb-3",
                            "focus-within:border-foreground/30 focus-within:shadow-sm"
                        )}>
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything about this web analysis..."
                                disabled={isLoading}
                                className={cn(
                                    "min-h-[48px] max-h-[120px] resize-none border-0 bg-transparent",
                                    "px-4 py-3 text-sm placeholder:text-muted-foreground/60",
                                    "focus-visible:ring-0 focus-visible:ring-offset-0"
                                )}
                                rows={1}
                            />
                        </div>

                        {/* Control row */}
                        <div className="flex items-center justify-between">
                            {/* Model picker on the left */}
                            <ModelPicker
                                selectedModelId={selectedModelId}
                                onModelChange={handleModelChange}
                                disabled={isLoading}
                            />

                            {/* Send button on the right */}
                            <Button
                                type="submit"
                                size="icon"
                                variant="ghost"
                                disabled={!input.trim() || isLoading}
                                className={cn(
                                    "h-8 w-8 transition-all duration-200 rounded-md",
                                    input.trim() && !isLoading
                                        ? "bg-accent hover:bg-accent/80 text-foreground"
                                        : "bg-accent/60 text-foreground/60"
                                )}
                            >
                                {isLoading ? (
                                    <SpinnerGap className="h-4 w-4 animate-spin" weight="bold" />
                                ) : (
                                    <PaperPlaneTilt className="h-4 w-4" weight="bold" />
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 