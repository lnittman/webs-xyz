"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatCircle,
  X,
  PaperPlaneTilt,
  CaretDown,
  Check,
  Smiley,
  Bug,
  Sparkle,
  Gauge,
  ChatText,
} from "@phosphor-icons/react/dist/ssr";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@repo/design/components/ui/dropdown-menu";
import { cn } from "@repo/design/lib/utils";

interface FeedbackDropdownProps {
    className?: string;
}

const feedbackTopics = [
    { id: 'bug', label: 'Bug Report', icon: Bug },
    { id: 'feature', label: 'Feature Request', icon: Sparkle },
    { id: 'ui', label: 'UI/UX Feedback', icon: Smiley },
    { id: 'performance', label: 'Performance', icon: Gauge },
    { id: 'general', label: 'General Feedback', icon: ChatText },
];

export function FeedbackDropdown({ className }: FeedbackDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showTopicDropdown, setShowTopicDropdown] = useState(false);

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
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSelectedTopic('');
                    setFeedback('');
                    setIsSubmitted(false);
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
    };

    const selectedTopicData = feedbackTopics.find(t => t.id === selectedTopic);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex h-8 items-center gap-2 px-3 py-1.5 text-sm font-medium font-mono text-muted-foreground hover:text-foreground transition-all duration-200 rounded-md border border-border hover:border-foreground/20 hover:bg-accent",
                        "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 focus:ring-offset-background",
                        isOpen && "bg-accent border-foreground/20 text-foreground",
                        className
                    )}
                >
                    <ChatCircle size={16} weight="duotone" />
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
                                        <label className="text-xs text-muted-foreground font-medium font-mono">
                                            Select a topic
                                        </label>
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
                                                <CaretDown
                                                    size={12}
                                                    weight="duotone"
                                                    className={cn(
                                                        "text-muted-foreground transition-transform duration-200",
                                                        showTopicDropdown && "rotate-180"
                                                    )}
                                                />
                                            </button>

                                            <AnimatePresence>
                                                {showTopicDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -5 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden"
                                                    >
                                                        {feedbackTopics.map((topic) => (
                                                            <button
                                                                key={topic.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTopic(topic.id);
                                                                    setShowTopicDropdown(false);
                                                                }}
                                                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between font-mono group"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <topic.icon size={16} weight="duotone" className="text-muted-foreground group-hover:text-foreground" />
                                                                    <span>{topic.label}</span>
                                                                </div>
                                                                {selectedTopic === topic.id && (
                                                                    <Check size={14} weight="duotone" className="text-green-600" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Feedback Text */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-muted-foreground font-medium font-mono">
                                            Your feedback
                                        </label>
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
                                <div className="bg-muted/30 border-t border-border p-4 flex justify-end">
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