"use client"

import * as React from "react"
import {
    Button,
    EmojiPicker,
    EmojiPickerSearch,
    EmojiPickerContent,
    Popover,
    PopoverContent,
    PopoverTrigger,
    type Emoji,
} from "@repo/design"

interface EmojiPickerButtonProps {
    emoji?: string | null
    onEmojiSelect: (emoji: string) => void
    disabled?: boolean
    className?: string
}

export function EmojiPickerButton({
    emoji,
    onEmojiSelect,
    disabled = false,
    className,
}: EmojiPickerButtonProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const handleEmojiSelect = (selectedEmoji: Emoji) => {
        onEmojiSelect(selectedEmoji.emoji)
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className={className}
                    aria-label={emoji ? `Change emoji from ${emoji}` : "Add emoji"}
                >
                    {emoji || "😊"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0" align="start">
                <EmojiPicker
                    className="h-[342px]"
                    onEmojiSelect={handleEmojiSelect}
                >
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                </EmojiPicker>
            </PopoverContent>
        </Popover>
    )
} 