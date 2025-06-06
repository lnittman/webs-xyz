'use client';

import { useState, useEffect } from 'react';
import { useWeb } from '@/hooks/web/queries';

interface WebRawPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function WebRawPage({ params }: WebRawPageProps) {
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
                    <div className="bg-card border border-border p-4 rounded-lg">
                        <pre className="text-xs text-muted-foreground overflow-auto font-mono">
                            {JSON.stringify(web, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
} 