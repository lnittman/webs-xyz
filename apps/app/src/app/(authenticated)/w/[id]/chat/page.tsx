'use client';

import { useState, useEffect } from 'react';
import { useWeb } from '@/hooks/web/queries';
import { WebChat } from '@/components/web/web-chat';

interface WebChatPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function WebChatPage({ params }: WebChatPageProps) {
    const [id, setId] = useState<string | null>(null);
    const { web, isLoading, isError } = useWeb(id);

    useEffect(() => {
        params.then(({ id }) => setId(id));
    }, [params]);

    if (!id || isLoading) {
        return <div />;
    }

    if (isError || !web) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <pre className="inline-block text-xs text-muted-foreground mb-4">
                        {`╔═══════════════════════╗
║                       ║
║    ⚠ WEB NOT FOUND   ║
║                       ║
╚═══════════════════════╝`}
                    </pre>
                    <p className="text-sm text-muted-foreground mb-4">
                        The requested web could not be found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Chat Interface - Full height */}
            <div className="flex-1 flex justify-center">
                <div className="w-full max-w-4xl flex flex-col h-full">
                    <WebChat web={web} className="flex-1" />
                </div>
            </div>
        </div>
    );
} 