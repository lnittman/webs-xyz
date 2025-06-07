"use client";

import React, { useState } from 'react';

import { Sparkle, Shuffle } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'framer-motion';
import { useTransitionRouter } from 'next-view-transitions';

import { useUser } from '@repo/auth/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@repo/design/components/ui/dialog';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { Textarea } from '@repo/design/components/ui/textarea';
import { Label } from '@repo/design/components/ui/label';
import { toast } from '@repo/design/components/ui/sonner';

import { EmojiPickerButton } from '@/components/shared/ui/emoji-picker-button';
import { useCreateSpace } from '@/hooks/spaces';
import { generateRandomSpaceData } from '@/lib/space-utils';

interface CreateSpaceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateSpaceModal({ open, onOpenChange }: CreateSpaceModalProps) {
    const { user } = useUser();
    const { createSpace } = useCreateSpace();
    const router = useTransitionRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [emoji, setEmoji] = useState('🚀');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Space name is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const newSpace = await createSpace({
                name: name.trim(),
                description: description.trim() || undefined,
                emoji: emoji || undefined,
                isDefault: false,
                userId: user?.id || ''
            });

            toast.success('Space created successfully!');
            onOpenChange(false);

            // Reset form
            setName('');
            setDescription('');
            setEmoji('🚀');

            // Navigate to the new space
            const spaceUrlName = newSpace.name.toLowerCase().replace(/\s+/g, '-');
            router.push(`/${spaceUrlName}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create space');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRandomize = () => {
        const randomData = generateRandomSpaceData();
        setName(randomData.name);
        setEmoji(randomData.emoji);
    };

    const handleEmojiSelect = (selectedEmoji: string) => {
        setEmoji(selectedEmoji);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkle className="w-5 h-5" weight="duotone" />
                        Create New Space
                    </DialogTitle>
                    <DialogDescription>
                        Create a new space to organize your webs. Spaces help you group related content together.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name and Emoji Row */}
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <Label htmlFor="emoji" className="text-sm font-medium">
                                Icon
                            </Label>
                            <div className="mt-1">
                                <EmojiPickerButton
                                    emoji={emoji}
                                    onEmojiSelect={handleEmojiSelect}
                                    className="h-10 w-10 text-lg border border-border rounded-md hover:bg-accent"
                                />
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Name
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRandomize}
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <Shuffle className="w-3 h-3 mr-1" weight="duotone" />
                                    Random
                                </Button>
                            </div>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My Awesome Space"
                                className="mt-1"
                                maxLength={100}
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What will you organize in this space?"
                            className="mt-1 resize-none"
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="min-w-[80px]"
                        >
                            {isSubmitting ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                />
                            ) : (
                                'Create'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 