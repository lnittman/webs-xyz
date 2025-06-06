'use client';

import React from 'react';
import { useSpaces } from '@/hooks/spaces';
import { Link } from 'next-view-transitions';
import { cn } from '@repo/design/lib/utils';
import { Folder, Plus, Clock } from '@phosphor-icons/react/dist/ssr';

export function AccountSpaces() {
    const { spaces, isLoading } = useSpaces();

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Spaces</h1>
                <p className="text-muted-foreground">
                    Manage your spaces and their organization
                </p>
            </div>

            {/* Spaces Grid */}
            {spaces && spaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {spaces.map((space) => {
                        const spaceUrlName = space.name.toLowerCase().replace(/\s+/g, '-');

                        return (
                            <Link
                                key={space.id}
                                href={`/${spaceUrlName}`}
                                className="group block h-full"
                            >
                                <div className="border border-border bg-card p-6 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 h-full min-h-[140px] flex flex-col rounded-lg">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                {space.emoji ? (
                                                    <span className="text-2xl">{space.emoji}</span>
                                                ) : (
                                                    <div className="h-8 w-8 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg flex items-center justify-center">
                                                        <Folder size={16} weight="duotone" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium line-clamp-1 group-hover:text-foreground/80 transition-all duration-200 leading-snug">
                                                        {space.name}
                                                    </h3>
                                                    {space.isDefault && (
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {space.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {space.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="font-mono">
                                                {space._count?.webs || 0} webs
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} weight="duotone" />
                                                {new Date(space.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Create New Space Card */}
                    <button className="border border-dashed border-border bg-card/50 p-6 hover:border-foreground/20 hover:bg-card transition-all duration-200 h-full min-h-[140px] flex flex-col items-center justify-center rounded-lg group">
                        <div className="space-y-3 text-center">
                            <div className="h-8 w-8 bg-muted text-muted-foreground border border-border rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-foreground transition-all duration-200">
                                <Plus size={16} weight="duotone" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-all duration-200">
                                    Create Space
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Organize your webs
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            ) : (
                /* Empty State */
                <div className="border border-dashed border-border rounded-lg p-12 text-center">
                    <div className="space-y-4">
                        <div className="h-12 w-12 bg-muted text-muted-foreground border border-border rounded-lg flex items-center justify-center mx-auto">
                            <Folder size={24} weight="duotone" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">No spaces yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first space to organize your webs and projects.
                            </p>
                            <button className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-lg text-sm font-medium">
                                Create Your First Space
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 