'use client';

import { motion } from 'framer-motion';
import { Person } from '@phosphor-icons/react/dist/ssr';
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/design/components/ui/tooltip';

interface HeaderProps {
    showStatus?: boolean;
    children?: React.ReactNode;
}

export function Header({ showStatus = true, children }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="h-14 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-sm font-medium tracking-tight">WEBS</h1>
                </div>

                {children && (
                    <div className="flex-1 flex justify-center">
                        {children}
                    </div>
                )}

                <div className="flex items-center gap-6">
                    <span className="text-xs text-muted-foreground">
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {showStatus && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    className="flex items-center gap-2 cursor-pointer"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Person size={14} weight="duotone" className="text-green-600" />
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span className="text-xs font-mono">ONLINE</span>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </header>
    );
} 