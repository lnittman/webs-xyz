"use client"

import * as React from "react"
import { EmojiPicker as FrimousseEmojiPicker, type Emoji } from "frimousse"

import { cn } from "@repo/design/lib/utils"

interface EmojiPickerProps {
    onEmojiSelect?: (emoji: Emoji) => void
    className?: string
    children?: React.ReactNode
}

function EmojiPicker({ onEmojiSelect, className, children }: EmojiPickerProps) {
    return (
        <FrimousseEmojiPicker.Root
            className={cn(
                "bg-popover text-popover-foreground border-border flex h-[342px] w-[352px] flex-col overflow-hidden rounded-md border shadow-md",
                className
            )}
            onEmojiSelect={onEmojiSelect}
        >
            {children}
        </FrimousseEmojiPicker.Root>
    )
}

interface EmojiPickerSearchProps {
    placeholder?: string
    className?: string
}

function EmojiPickerSearch({ placeholder = "Search emojis...", className }: EmojiPickerSearchProps) {
    return (
        <FrimousseEmojiPicker.Search
            placeholder={placeholder}
            className={cn(
                "border-border bg-background placeholder:text-muted-foreground mx-2 mt-2 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
        />
    )
}

interface EmojiPickerContentProps {
    className?: string
}

function EmojiPickerContent({ className }: EmojiPickerContentProps) {
    return (
        <FrimousseEmojiPicker.Viewport
            className={cn("flex-1 overflow-hidden", className)}
        >
            <FrimousseEmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                Loading…
            </FrimousseEmojiPicker.Loading>
            <FrimousseEmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                No emoji found.
            </FrimousseEmojiPicker.Empty>
            <FrimousseEmojiPicker.List className="select-none pb-1.5" />
        </FrimousseEmojiPicker.Viewport>
    )
}

interface EmojiPickerFooterProps {
    className?: string
    children?: React.ReactNode
}

function EmojiPickerFooter({ className, children }: EmojiPickerFooterProps) {
    return (
        <div
            className={cn(
                "border-border flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground",
                className
            )}
        >
            {children}
        </div>
    )
}

export { EmojiPicker, EmojiPickerSearch, EmojiPickerContent, EmojiPickerFooter, type Emoji } 