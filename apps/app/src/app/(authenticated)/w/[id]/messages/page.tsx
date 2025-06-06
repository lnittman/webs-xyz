'use client';

import { useState, useEffect } from 'react';
import { useWeb } from '@/hooks/web/queries';

interface WebMessagesPageProps {
    params: Promise<{
        id: string;
    }>;
}

// Helper to format date
function formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export default function WebMessagesPage({ params }: WebMessagesPageProps) {
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
            <div className="text-center py-12">
                <p className="text-sm text-red-600">
                    Web not found or failed to load.
                </p>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="w-full flex justify-center">
                <div className="w-full max-w-3xl px-6">
                    <div className="space-y-4">
                        {web.messages && web.messages.length > 0 ? (
                            web.messages.map((message) => (
                                <div key={message.id} className="border border-border bg-card p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs text-muted-foreground uppercase font-mono px-2 py-1 bg-muted rounded">
                                            {message.type}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(message.createdAt)}
                                        </span>
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-sm text-muted-foreground">
                                    No messages yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 