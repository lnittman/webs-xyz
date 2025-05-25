'use client';

import { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface ClientLayoutProps {
    children: ReactNode;
    workspaceId?: string;
    webCount?: number;
    showFooter?: boolean;
    showStatus?: boolean;
}

export function ClientLayout({
    children,
    workspaceId = 'default',
    webCount = 0,
    showFooter = true,
    showStatus = true
}: ClientLayoutProps) {
    return (
        <div className="min-h-screen bg-background antialiased font-mono flex flex-col">
            <Header showStatus={showStatus} />

            <main className="pt-14 flex-1 flex flex-col">
                {children}
            </main>

            {showFooter && (
                <Footer workspaceId={workspaceId} webCount={webCount} />
            )}

            {/* Terminal scanline effect */}
            <div className="terminal-scanlines" aria-hidden="true" />
        </div>
    );
} 