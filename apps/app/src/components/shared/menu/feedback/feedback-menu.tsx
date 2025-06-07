"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    PaperPlaneTilt,
    CaretDown,
    CaretUp,
    Check,
    Smiley,
    Bug,
    Sparkle,
    Gauge,
    ChatText,
    ThumbsUp,
    ThumbsDown,
} from "@phosphor-icons/react/dist/ssr";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@repo/design/components/ui/dropdown-menu";
import { cn } from "@repo/design/lib/utils";

interface FeedbackMenuProps {
    className?: string;
}

const feedbackTopics = [
    { id: 'bug', label: 'Bug Report', icon: Bug },
    { id: 'feature', label: 'Feature Request', icon: Sparkle },
    { id: 'ui', label: 'UI/UX Feedback', icon: Smiley },
    { id: 'performance', label: 'Performance', icon: Gauge },
    { id: 'general', label: 'General Feedback', icon: ChatText },
];

export function FeedbackMenu({ className }: FeedbackMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showTopicDropdown, setShowTopicDropdown] = useState(false);
    const [sentiment, setSentiment] = useState<'positive' | 'negative' | null>(null);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        // Reset topic dropdown when main menu closes
        if (!open) {
            setShowTopicDropdown(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTopic || !feedback.trim()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: selectedTopic,
                    message: feedback.trim(),
                    sentiment: sentiment,
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSelectedTopic('');
                    setFeedback('');
                    setIsSubmitted(false);
                    setSentiment(null);
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedTopic('');
        setFeedback('');
        setIsSubmitted(false);
        setSentiment(null);
    };

    const selectedTopicData = feedbackTopics.find(t => t.id === selectedTopic);

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex h-8 items-center gap-2 px-3 py-1.5 text-sm font-medium font-mono text-muted-foreground hover:text-foreground transition-all duration-200 rounded-md border border-border hover:border-foreground/20 hover:bg-accent",
                        "focus:outline-none select-none",
                        isOpen && "bg-accent/80 border-foreground/30 text-foreground",
                        className
                    )}
                >
                    <span>Feedback</span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="w-[320px] p-0 bg-popover border-border/50 rounded-lg overflow-hidden"
            >
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 0.8
                    }}
                >
                    {isSubmitted ? (
                        <div className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-12 h-12 bg-green-600/10 border border-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <Check size={24} weight="duotone" className="text-green-600" />
                            </motion.div>
                            <h3 className="text-sm font-medium text-foreground mb-1 font-mono">Thank you!</h3>
                            <p className="text-xs text-muted-foreground font-mono">Your feedback has been submitted.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Content */}
                            <div className="p-4 space-y-4">
                                {/* Topic Selection */}
                                <div className="space-y-2">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                                            className="w-full h-9 px-3 pr-8 bg-background border border-border rounded-md text-sm text-left flex items-center justify-between hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all duration-200 font-mono"
                                        >
                                            <div className="flex items-center gap-2">
                                                {selectedTopicData && (
                                                    <selectedTopicData.icon size={16} weight="duotone" className="text-muted-foreground" />
                                                )}
                                                <span className={selectedTopicData ? 'text-foreground' : 'text-muted-foreground'}>
                                                    {selectedTopicData ? selectedTopicData.label : 'Select a topic...'}
                                                </span>
                                            </div>
                                                <AnimatePresence mode="wait" initial={false}>
                                                    {showTopicDropdown ? (
                                                        <motion.div
                                                            key="up"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                                        >
                                                            <CaretUp
                                                                size={12}
                                                                weight="duotone"
                                                                className="text-muted-foreground"
                                                            />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="down"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                                        >
                                                                <CaretDown
                                                                    size={12}
                                                                    weight="duotone"
                                                                    className="text-muted-foreground"
                                                                />
                                                            </motion.div>
                                                )}
                                                </AnimatePresence>
                                        </button>

                                        <AnimatePresence>
                                            {showTopicDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.15 }}
                                                        className="absolute top-full right-0 left-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden"
                                                >
                                                        <div className="py-1">
                                                            {feedbackTopics.map((topic) => (
                                                                <button
                                                                    key={topic.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedTopic(topic.id);
                                                                        setShowTopicDropdown(false);
                                                                    }}
                                                                    className="w-[calc(100%-8px)] mx-1 px-2 py-1.5 text-left text-sm hover:bg-accent transition-all duration-200 flex items-center justify-between font-mono group rounded-md"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <topic.icon size={16} weight="duotone" className="text-muted-foreground group-hover:text-foreground transition-all duration-200" />
                                                                        <span className="transition-colors duration-200">{topic.label}</span>
                                                                    </div>
                                                                    {selectedTopic === topic.id && (
                                                                        <Check size={14} weight="duotone" className="text-green-600 transition-all duration-200" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Feedback Text */}
                                <div className="space-y-2">
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Your feedback..."
                                        className="w-full h-24 px-3 py-2 bg-background border border-border rounded-md text-sm resize-none hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all duration-200 placeholder:text-muted-foreground font-mono"
                                        required
                                    />
                                    <div className="flex items-center justify-end">
                                        <span className="text-xs text-muted-foreground font-mono">
                                            Markdown supported
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer with subtle background */}
                                <div className="bg-muted/30 border-t border-border p-4 flex items-center justify-between">
                                    {/* Thumbs up/down buttons */}
                                    <div className="flex items-center gap-1">
                                        <motion.button
                                            type="button"
                                            onClick={() => setSentiment(sentiment === 'positive' ? null : 'positive')}
                                            className="p-2 rounded-full"
                                            animate={{
                                                backgroundColor: sentiment === 'positive'
                                                    ? 'rgba(34, 197, 94, 0.2)'
                                                    : 'transparent'
                                            }}
                                            whileHover={{
                                                backgroundColor: sentiment === 'positive'
                                                    ? 'rgba(34, 197, 94, 0.3)'  // Lighter when active
                                                    : 'rgba(255, 255, 255, 0.08)'
                                            }}
                                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                                            title="Positive feedback"
                                        >
                                            <motion.div
                                                className="text-muted-foreground"
                                                animate={{
                                                    color: sentiment === 'positive'
                                                        ? '#22c55e'  // green-500
                                                        : undefined
                                                }}
                                                whileHover={{
                                                    color: sentiment !== 'positive'
                                                        ? 'hsl(var(--foreground))'
                                                        : undefined
                                                }}
                                                transition={{
                                                    duration: 0.2,
                                                    ease: 'easeInOut',
                                                    color: { duration: 0.2 }
                                                }}
                                            >
                                                <ThumbsUp
                                                    size={16}
                                                    weight="duotone"
                                                />
                                            </motion.div>
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            onClick={() => setSentiment(sentiment === 'negative' ? null : 'negative')}
                                            className="p-2 rounded-full"
                                            animate={{
                                                backgroundColor: sentiment === 'negative'
                                                    ? 'rgba(239, 68, 68, 0.2)'
                                                    : 'transparent'
                                            }}
                                            whileHover={{
                                                backgroundColor: sentiment === 'negative'
                                                    ? 'rgba(239, 68, 68, 0.3)'  // Lighter when active
                                                    : 'rgba(255, 255, 255, 0.08)'
                                            }}
                                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                                            title="Negative feedback"
                                        >
                                            <motion.div
                                                className="text-muted-foreground"
                                                animate={{
                                                    color: sentiment === 'negative'
                                                        ? '#ef4444'  // red-500
                                                        : undefined
                                                }}
                                                whileHover={{
                                                    color: sentiment !== 'negative'
                                                        ? 'hsl(var(--foreground))'
                                                        : undefined
                                                }}
                                                transition={{
                                                    duration: 0.2,
                                                    ease: 'easeInOut',
                                                    color: { duration: 0.2 }
                                                }}
                                            >
                                                <ThumbsDown
                                                    size={16}
                                                    weight="duotone"
                                                />
                                            </motion.div>
                                        </motion.button>
                                    </div>

                                    {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={!selectedTopic || !feedback.trim() || isSubmitting}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 font-mono",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        selectedTopic && feedback.trim() && !isSubmitting
                                            ? "bg-foreground text-background hover:bg-foreground/90"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                            />
                                            Sending...
                                        </span>
                                    ) : (
                                        'Send'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 