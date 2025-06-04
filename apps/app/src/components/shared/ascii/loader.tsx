"use client";

import React, { useState, useEffect } from "react";

import { cn } from "@repo/design/lib/utils";

import { Spiral } from "./patterns/spiral";
import { Wave } from "./patterns/wave";
import { Diamond } from "./patterns/diamond";
import { Grid } from "./patterns/grid";
import { Dots } from "./patterns/dots";
import { Circuit } from "./patterns/circuit";
import { Maze } from "./patterns/maze";

interface AsciiLoaderProps {
    size?: 'xs' | 'small' | 'medium' | 'large';
    className?: string;
    changeInterval?: number;
}

const patterns = [
    Spiral,
    Wave,
    Diamond,
    Grid,
    Dots,
    Circuit,
    Maze,
];

export function AsciiLoader({
    size = 'medium',
    className,
    changeInterval = 1500
}: AsciiLoaderProps) {
    const [currentPatternIndex, setCurrentPatternIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPatternIndex((prev) => (prev + 1) % patterns.length);
        }, changeInterval);

        return () => clearInterval(interval);
    }, [changeInterval]);

    const CurrentPattern = patterns[currentPatternIndex];

    return (
        <div className={cn("ascii-loader", className)}>
            <CurrentPattern size={size} />
        </div>
    );
} 