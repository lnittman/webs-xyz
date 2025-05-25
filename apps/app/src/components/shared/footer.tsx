'use client';

interface FooterProps {
    workspaceId: string;
    webCount: number;
}

export function Footer({ workspaceId, webCount }: FooterProps) {
    return (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
            <div className="h-8 px-6 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span>[WORKSPACE: {workspaceId}]</span>
                    <span>[WEBS: {webCount}]</span>
                    <span>[STATUS: READY]</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>WEBS v1.0.0</span>
                </div>
            </div>
        </footer>
    );
} 