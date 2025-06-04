'use client';

import { WorkflowProgress } from '@/components/shared/workflow-progress';
import { useWebStream } from '@/hooks/web/use-web-stream';
import { Card } from '@repo/design/components/ui/card';
import { Badge } from '@repo/design/components/ui/badge';
import { Brain, Sparkle, Globe } from '@phosphor-icons/react/dist/ssr';
import type { Web } from '@/types/web';
import { useEffect } from 'react';
import { mutate } from 'swr';

interface WorkflowTabProps {
    web: Web;
}

export function WorkflowTab({ web }: WorkflowTabProps) {
    const {
        steps,
        currentStep,
        progress,
        isComplete,
        error,
        webUpdate,
        startAnalysis,
        isLoading
    } = useWebStream(web.status === 'PROCESSING' ? web.id : null);

    // Auto-start streaming when component mounts
    useEffect(() => {
        if (web.status === 'PROCESSING' && startAnalysis && !isLoading) {
            // Small delay to ensure component is mounted
            const timer = setTimeout(() => {
                startAnalysis();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [web.id, web.status]); // Only depend on stable values

    // Update the web in SWR cache when we get quick metadata
    useEffect(() => {
        if (webUpdate && web.id) {
            mutate(`/api/webs/${web.id}`, (current: any) => ({
                ...current,
                ...webUpdate
            }), false);
        }
    }, [webUpdate, web.id]);

    if (web.status === 'COMPLETE') {
        return (
            <div className="space-y-4">
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                            <Brain size={20} weight="duotone" className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-medium">Analysis Complete</h3>
                            <p className="text-sm text-muted-foreground">
                                Processed {web.urls?.length || 0} URL{(web.urls?.length || 0) > 1 ? 's' : ''} successfully
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Processing Time</span>
                            <p className="text-sm font-mono">
                                {new Date(web.updatedAt).getTime() - new Date(web.createdAt).getTime() > 60000
                                    ? `${Math.round((new Date(web.updatedAt).getTime() - new Date(web.createdAt).getTime()) / 60000)} min`
                                    : `${Math.round((new Date(web.updatedAt).getTime() - new Date(web.createdAt).getTime()) / 1000)} sec`
                                }
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Confidence</span>
                            <p className="text-sm font-mono">
                                {web.confidence ? `${Math.round(web.confidence * 100)}%` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Analysis Stats */}
                <Card className="p-6">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Sparkle size={16} weight="duotone" />
                        Analysis Statistics
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{web.topics?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">Topics</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{web.entities?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">Entities</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{web.insights?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">Insights</div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (web.status === 'FAILED' || error) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                        <Globe size={20} weight="duotone" className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-medium text-red-900 dark:text-red-100">Analysis Failed</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">
                            {error || 'An error occurred during analysis'}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    // Show workflow progress for PROCESSING status
    return (
        <div className="space-y-4">
            <Card className="p-6">
                <h3 className="font-medium mb-4">Analysis Progress</h3>
                <WorkflowProgress
                    steps={steps}
                    currentStep={currentStep}
                    progress={progress}
                />
            </Card>

            {/* Quick metadata preview */}
            {webUpdate && (
                <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Sparkle size={14} weight="duotone" className="text-blue-600" />
                        Quick Analysis Results
                    </h4>
                    <div className="space-y-2">
                        {webUpdate.title && (
                            <div>
                                <span className="text-xs text-muted-foreground">Title:</span>
                                <p className="text-sm font-medium">{webUpdate.title}</p>
                            </div>
                        )}
                        {webUpdate.emoji && (
                            <div>
                                <span className="text-xs text-muted-foreground">Emoji:</span>
                                <p className="text-2xl mt-1">{webUpdate.emoji}</p>
                            </div>
                        )}
                        {webUpdate.description && (
                            <div>
                                <span className="text-xs text-muted-foreground">Quick Summary:</span>
                                <p className="text-sm mt-1">{webUpdate.description}</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
} 