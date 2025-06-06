'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb } from '@/hooks/web/queries';
import { Tag, Sparkle, LinkIcon, Globe } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@repo/design/lib/utils';

interface WebInsightsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function WebInsightsPage({ params }: WebInsightsPageProps) {
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

    const topics = web.topics || [];
    const entities = web.entities || [];
    const insights = web.insights || [];
    const relatedUrls = web.relatedUrls || [];
    const hasAnalysisData = web.analysis && Object.keys(web.analysis).length > 0;

    return (
        <div className="py-8">
            <div className="w-full flex justify-center">
                <div className="w-full max-w-3xl px-6">
                    <div className="space-y-8">
                        {!hasAnalysisData && web.status === 'PROCESSING' ? (
                            <div className="text-center py-12">
                                <p className="text-sm text-muted-foreground">
                                    Analysis in progress...
                                </p>
                            </div>
                        ) : !hasAnalysisData && web.status === 'FAILED' ? (
                            <div className="text-center py-12">
                                <p className="text-sm text-red-600">
                                    Analysis failed. Please try again.
                                </p>
                            </div>
                        ) : hasAnalysisData ? (
                            <>
                                {/* Key Topics */}
                                {topics.length > 0 && (
                                    <div>
                                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Tag size={12} weight="duotone" />
                                            KEY TOPICS
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {topics.map((topic, index) => (
                                                <motion.span
                                                    key={topic}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="px-3 py-1.5 border border-border bg-accent text-xs font-mono hover:bg-accent/80 transition-all cursor-pointer rounded-md"
                                                >
                                                    {topic}
                                                </motion.span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Insights */}
                                {insights.length > 0 && (
                                    <div>
                                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Sparkle size={12} weight="duotone" />
                                            KEY INSIGHTS
                                        </h3>
                                        <div className="space-y-2">
                                            {insights.map((insight, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="p-3 border border-border bg-card rounded-md"
                                                >
                                                    <p className="text-sm">{insight}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Extracted Entities */}
                                {entities.length > 0 && (
                                    <div>
                                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <LinkIcon size={12} weight="duotone" />
                                            EXTRACTED ENTITIES
                                        </h3>
                                        <div className="space-y-2">
                                            {entities.map((entity, index) => (
                                                <motion.div
                                                    key={entity.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="flex items-center justify-between p-3 border border-border bg-card rounded-md"
                                                >
                                                    <span className="text-xs text-muted-foreground font-mono uppercase">
                                                        {entity.type}
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {entity.value}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Related URLs */}
                                {relatedUrls.length > 0 && (
                                    <div>
                                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Globe size={12} weight="duotone" />
                                            RELATED URLS
                                        </h3>
                                        <div className="space-y-2">
                                            {relatedUrls.map((url, index) => (
                                                <motion.a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="block p-3 border border-border bg-card rounded-md hover:bg-accent transition-colors"
                                                >
                                                    <span className="text-sm text-muted-foreground hover:text-foreground truncate">
                                                        {url}
                                                    </span>
                                                </motion.a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-sm text-muted-foreground">
                                    No analysis data available.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 