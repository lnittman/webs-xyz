'use client';

import { useState } from 'react';
import { CaretDown, CaretUp, Gear, Empty } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@repo/design/components/ui/dropdown-menu";
import { cn } from '@repo/design/lib/utils';
import { Button } from '@repo/design/components/ui/button';

interface ModelPickerProps {
    disabled?: boolean;
    selectedModelId?: string;
    onModelChange?: (modelId: string) => void;
}

export function ModelPicker({
    disabled = false,
    selectedModelId,
    onModelChange
}: ModelPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // For now, always show "no models configured" state
    const hasModels = false;
    const displayText = 'no models configured';

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "h-8 flex items-center px-3 py-1 gap-2 transition-all hover:bg-accent/40 hover:text-accent-foreground select-none rounded-md border border-transparent hover:border-accent/50",
                        disabled && "opacity-50 pointer-events-none",
                        isOpen && "bg-accent/50 border-accent/50 text-accent-foreground",
                        !hasModels && "border-accent/50 bg-accent/5"
                    )}
                    disabled={disabled}
                >
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        Model
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                        {isOpen ? (
                            <motion.div
                                key="up"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <CaretUp weight="duotone" className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="down"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <CaretDown weight="duotone" className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </DropdownMenuTrigger>

            <AnimatePresence>
                {isOpen && (
                    <DropdownMenuContent
                        side="top"
                        align="start"
                        alignOffset={0}
                        sideOffset={8}
                        onCloseAutoFocus={(event: Event) => {
                            event.preventDefault();
                        }}
                        className="z-[500] w-80 overflow-hidden border border-border bg-popover/95 backdrop-blur-sm shadow-md rounded-lg flex flex-col p-0"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                            transition={{
                                duration: 0.2,
                                ease: [0.32, 0.72, 0, 1]
                            }}
                        >
                            {/* Empty state */}
                            <div className="py-8 px-4">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center">
                                            <Empty size={32} weight="duotone" className="text-muted-foreground/60" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">
                                            No models configured
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Configure models to start analyzing
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Settings option */}
                            <div className="border-t border-border/50 p-1">
                                <DropdownMenuItem
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none transition-colors text-foreground mx-1 rounded-md",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "focus:bg-accent focus:text-accent-foreground"
                                    )}
                                    onSelect={() => {
                                        // TODO: Navigate to settings
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Gear weight="duotone" className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-xs">Configure models</span>
                                    </div>
                                </DropdownMenuItem>
                            </div>
                        </motion.div>
                    </DropdownMenuContent>
                )}
            </AnimatePresence>
        </DropdownMenu>
    );
} 