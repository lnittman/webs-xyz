"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatCircle, X, PaperPlaneTilt, CaretDown, Check } from "@phosphor-icons/react";
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
    { id: 'bug', label: 'Bug Report' },
    { id: 'feature', label: 'Feature Request' },
    { id: 'ui', label: 'UI/UX Feedback' },
    { id: 'performance', label: 'Performance' },
    { id: 'general', label: 'General Feedback' },
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
                        "flex h-8 items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg border border-border hover:border-foreground/20 hover:bg-accent/50",
                        "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 focus:ring-offset-background",
                        className
                    )}
                >
                    <span className="font-medium font-mono">Feedback</span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="w-80 p-0 bg-popover/95 backdrop-blur-sm border-border/20 rounded-lg"
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
                        <div className="p-6 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-12 h-12 bg-green-600/10 border border-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3"
                            >
                                <motion.div
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <motion.path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </motion.div>
                            </motion.div>
                            <h3 className="text-sm font-medium text-foreground mb-1 font-mono">Thank you!</h3>
                            <p className="text-xs text-muted-foreground font-mono">Your feedback has been submitted.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-foreground font-mono">Send Feedback</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Topic Selection */}
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium font-mono">
                                    Select a topic
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                                        className="w-full h-9 px-3 pr-8 bg-background border border-border rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors font-mono"
                                    >
                                        <span className={selectedTopicData ? 'text-foreground' : 'text-muted-foreground'}>
                                            {selectedTopicData ? selectedTopicData.label : 'Choose a topic...'}
                                        </span>
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
                                                className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                                            >
                                                {feedbackTopics.map((topic) => (
                                                    <button
                                                        key={topic.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTopic(topic.id);
                                                            setShowTopicDropdown(false);
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between font-mono"
                                                    >
                                                        <span>{topic.label}</span>
                                                        {selectedTopic === topic.id && (
                                                            <Check size={12} weight="duotone" className="text-green-600" />
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
                                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium font-mono">
                                    Your feedback
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us what you think..."
                                    className="w-full h-24 px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors placeholder:text-muted-foreground font-mono"
                                    required
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                                    <span>{feedback.length} characters</span>
                                    <span>Markdown supported</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                                    disabled={isSubmitting}
                                >
                                    Clear
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedTopic || !feedback.trim() || isSubmitting}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 font-mono",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        selectedTopic && feedback.trim() && !isSubmitting
                                            ? "bg-foreground text-background hover:bg-foreground/90"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                            />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <PaperPlaneTilt size={14} weight="duotone" />
                                            <span>Send</span>
                                        </>
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