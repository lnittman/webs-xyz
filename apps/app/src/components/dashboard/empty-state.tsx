"use client";

import React from "react";
import { Empty } from "@phosphor-icons/react/dist/ssr";

export function EmptyState() {
    return (
        <div className="flex items-center justify-center">
            <div className="text-center max-w-md space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center">
                        <Empty size={32} weight="duotone" className="text-muted-foreground/60" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">
                        Ready to analyze your first web?
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Enter a URL above to create your first web and start analyzing content.
                    </p>
                </div>
            </div>
        </div>
    );
} 