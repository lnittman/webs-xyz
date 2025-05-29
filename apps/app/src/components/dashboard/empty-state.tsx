"use client";

import React from "react";
import { Empty } from "@phosphor-icons/react/dist/ssr";
import Balancer from "react-wrap-balancer";

export function EmptyState() {
    return (
        <div className="flex items-center justify-center">
            <div className="text-center max-w-md space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center">
                        <Empty size={32} weight="duotone" className="text-muted-foreground/60" />
                    </div>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <Balancer>
                            Enter a URL above to create your first web and start analyzing content.
                        </Balancer>
                    </p>
                </div>
            </div>
        </div>
    );
} 