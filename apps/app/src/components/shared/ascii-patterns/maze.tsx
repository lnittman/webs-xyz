"use client";

import React from "react";
import { cn } from "@repo/design/lib/utils";

interface MazeProps {
    size?: 'xs' | 'small' | 'medium' | 'large';
    className?: string;
}

export function Maze({ size = 'small', className }: MazeProps) {
    const sizeClasses = {
        xs: "text-[2px] leading-none",
        small: "text-[4px] leading-none",
        medium: "text-[8px] leading-none",
        large: "text-[10px] leading-none"
    };

    const asciiArt = `
█▀▀▀█▀▀▀█
█   █   █
█ █▀█ █ █
█ █   █ █
█ █▀▀▀█ █
█       █
█▀▀▀▀▀▀▀█`;

    return (
        <div
            className={cn(
                "ascii-pattern text-foreground select-none",
                sizeClasses[size],
                className
            )}
        >
            <pre className="whitespace-pre select-none">{asciiArt}</pre>
        </div>
    );
} 