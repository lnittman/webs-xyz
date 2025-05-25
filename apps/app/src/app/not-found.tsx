import { Link } from 'next-view-transitions';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <pre className="inline-block text-xs text-muted-foreground mb-6 font-mono">
                    {`╔═══════════════════════════╗
║                           ║
║       404 NOT FOUND       ║
║                           ║
╚═══════════════════════════╝`}
                </pre>
                <p className="text-sm text-muted-foreground mb-4">
                    The page you're looking for doesn't exist.
                </p>
                <Link
                    href="/"
                    className="text-sm text-foreground hover:text-foreground/80 transition-colors font-mono uppercase"
                >
                    ← BACK TO HOME
                </Link>
            </div>
        </div>
    );
} 