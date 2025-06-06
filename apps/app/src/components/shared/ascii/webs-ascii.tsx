"use client";

import React from "react";
import { cn } from "@repo/design/lib/utils";

interface WebsAsciiLogoProps {
    size?: 'xs' | 'tiny' | 'small' | 'medium' | 'large';
    className?: string;
    onClick?: () => void;
}

export function WebsAsciiLogo({
    size = 'small',
    className,
    onClick
}: WebsAsciiLogoProps) {
    const sizeClasses = {
        xs: "text-[2px] leading-none",
        tiny: "text-[3px] leading-none",
        small: "text-[4px] leading-none",
        medium: "text-[8px] leading-none",
        large: "text-[10px] leading-none"
    };

    const asciiArt = `
██╗    ██╗███████╗██████╗ ███████╗
██║    ██║██╔════╝██╔══██╗██╔════╝
██║ █╗ ██║█████╗  ██████╔╝███████╗
██║███╗██║██╔══╝  ██╔══██╗╚════██║
╚███╔███╔╝███████╗██████╔╝███████║
╚══╝╚══╝ ╚══════╝╚═════╝ ╚══════╝`;

    const Component = onClick ? 'button' : 'div';

    return (
        <Component
            onClick={onClick}
            className={cn(
                "webs-logo-fixed-font text-foreground select-none",
                sizeClasses[size],
                onClick && "transition-all duration-200 hover:opacity-80 active:opacity-60",
                className
            )}
        >
            <pre className="whitespace-pre select-none webs-logo-fixed-font">{asciiArt}</pre>
        </Component>
    );
} 