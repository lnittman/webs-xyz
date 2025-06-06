'use client';

import React from 'react';
import { useWebs } from '@/hooks/web/queries';
import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';
import { Globe, Clock, CheckCircle, XCircle, Hourglass } from '@phosphor-icons/react/dist/ssr';

export function AccountWebs() {
    const { webs, isLoading } = useWebs();

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETE':
                return <CheckCircle size={16} weight="fill" className="text-green-600" />;
            case 'PROCESSING':
                return <Hourglass size={16} weight="fill" className="text-blue-600" />;
            case 'FAILED':
                return <XCircle size={16} weight="fill" className="text-red-600" />;
            default:
                return <Clock size={16} weight="fill" className="text-yellow-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETE':
                return 'text-green-600 bg-green-500/10 border-green-500/20';
            case 'PROCESSING':
                return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
            case 'FAILED':
                return 'text-red-600 bg-red-500/10 border-red-500/20';
            default:
                return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Webs</h1>
                <p className="text-muted-foreground">
                    All your analyzed webs across all spaces
                </p>
            </div>

            {/* Stats */}
            {webs && webs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-2xl font-bold font-mono">
                            {webs.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Webs</div>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-2xl font-bold font-mono text-green-600">
                            {webs.filter(w => w.status === 'COMPLETE').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Complete</div>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-2xl font-bold font-mono text-blue-600">
                            {webs.filter(w => w.status === 'PROCESSING').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Processing</div>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-2xl font-bold font-mono text-red-600">
                            {webs.filter(w => w.status === 'FAILED').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                </div>
            )}

            {/* Webs List */}
            {webs && webs.length > 0 ? (
                <div className="space-y-3">
                    {webs.map((web) => {
                        const domain = new URL(web.url).hostname;

                        return (
                            <Link
                                key={web.id}
                                href={`/w/${web.id}`}
                                className="group block"
                            >
                                <div className="border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className="h-10 w-10 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Globe size={20} weight="duotone" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium truncate group-hover:text-foreground/80 transition-colors">
                                                    {web.title || domain}
                                                </h3>
                                                {getStatusIcon(web.status)}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="font-mono">{domain}</span>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} weight="duotone" />
                                                    {new Date(web.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex-shrink-0">
                                            <span className={cn(
                                                "text-xs px-2 py-1 font-mono rounded-md border",
                                                getStatusColor(web.status)
                                            )}>
                                                {web.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                /* Empty State */
                <div className="border border-dashed border-border rounded-lg p-12 text-center">
                    <div className="space-y-4">
                        <div className="h-12 w-12 bg-muted text-muted-foreground border border-border rounded-lg flex items-center justify-center mx-auto">
                            <Globe size={24} weight="duotone" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">No webs yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start analyzing your first web page to see it here.
                            </p>
                            <button className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-lg text-sm font-medium">
                                Analyze Your First Web
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 