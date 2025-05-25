export function EmptyState() {
    return (
        <div className="flex items-center justify-center py-32">
            <div className="text-center max-w-md">
                <pre className="inline-block text-xs text-muted-foreground mb-8 font-mono leading-tight">
                    {`╔═══════════════════════╗
║                       ║
║    ∅ NO WEBS YET     ║
║                       ║
╚═══════════════════════╝`}
                </pre>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Enter a URL above to create your first web and start analyzing content.
                </p>
            </div>
        </div>
    );
} 