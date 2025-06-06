'use client';

import React from 'react';
import { useUser } from '@repo/auth/client';
import { useUserSettings } from '@/hooks/user-settings/queries';
import { useSpaces } from '@/hooks/spaces';
import { useWebs } from '@/hooks/web/queries';
import { cn } from '@repo/design/lib/utils';
import { User, Folder, Globe, Clock, Palette, Calendar } from '@phosphor-icons/react/dist/ssr';

export function AccountOverview() {
    const { user } = useUser();
    const { settings, isLoading: settingsLoading } = useUserSettings();
    const { spaces, isLoading: spacesLoading } = useSpaces();
    const { webs, isLoading: websLoading } = useWebs();

    const isLoading = settingsLoading || spacesLoading || websLoading;

    if (isLoading) {
        return (
            <div className="flex-1 py-8">
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-4xl px-6">
                        <div className="space-y-6">
                            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const completeWebs = webs?.filter(web => web.status === 'COMPLETE').length || 0;
    const processingWebs = webs?.filter(web => web.status === 'PROCESSING').length || 0;
    const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '';

    return (
        <div className="flex-1 py-8">
            <div className="w-full flex justify-center">
                <div className="w-full max-w-4xl px-6">
                    <div className="space-y-8">
                        {/* Welcome Section */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">
                                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
                            </h2>
                            <p className="text-muted-foreground">
                                Here's an overview of your account and recent activity.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Spaces */}
                            <div className="border border-border bg-card p-6 rounded-lg hover:border-foreground/20 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg flex items-center justify-center">
                                        <Folder size={20} weight="duotone" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold font-mono">
                                            {spaces?.length || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Spaces</div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Organization containers for your webs
                                </p>
                            </div>

                            {/* Webs */}
                            <div className="border border-border bg-card p-6 rounded-lg hover:border-foreground/20 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg flex items-center justify-center">
                                        <Globe size={20} weight="duotone" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold font-mono">
                                            {completeWebs}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Completed Webs</div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Successfully analyzed web pages
                                </p>
                            </div>

                            {/* Processing */}
                            {processingWebs > 0 && (
                                <div className="border border-border bg-card p-6 rounded-lg hover:border-foreground/20 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-10 w-10 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-lg flex items-center justify-center">
                                            <Clock size={20} weight="duotone" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold font-mono">
                                                {processingWebs}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Processing</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Currently being analyzed
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Account Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Account Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Profile Info */}
                                <div className="border border-border bg-card p-6 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-accent text-foreground rounded-lg flex items-center justify-center text-sm font-medium border border-border">
                                            {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="font-medium">
                                                {user?.firstName && user?.lastName
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : user?.emailAddresses?.[0]?.emailAddress || 'User'
                                                }
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {user?.emailAddresses?.[0]?.emailAddress}
                                            </div>
                                            {joinDate && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar size={12} weight="duotone" />
                                                    Joined {joinDate}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Preferences */}
                                <div className="border border-border bg-card p-6 rounded-lg">
                                    <h4 className="font-medium mb-4 flex items-center gap-2">
                                        <Palette size={16} weight="duotone" />
                                        Preferences
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Workspace:</span>
                                            <span className="font-mono">
                                                {settings?.workspaceName || 'My Workspace'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Default Model:</span>
                                            <span className="font-mono text-xs">
                                                {settings?.defaultModel || 'claude-4-sonnet'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Font:</span>
                                            <span className="font-mono text-xs">
                                                {settings?.fontFamily || 'iosevka-term'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 