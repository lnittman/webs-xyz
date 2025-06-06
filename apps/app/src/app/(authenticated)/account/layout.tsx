'use client';

import React from 'react';
import { ViewTransitions } from 'next-view-transitions';

interface AccountLayoutProps {
    children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
    return (
        <ViewTransitions>
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </ViewTransitions>
    );
} 