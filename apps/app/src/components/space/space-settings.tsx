'use client';

import React, { useState } from 'react';
import { cn } from '@repo/design/lib/utils';
import { AVAILABLE_MODELS, SPACE_VISIBILITY, type Space } from '@repo/api/constants';
import {
    User,
    Palette,
    Bell,
    Eye,
    Check,
    X
} from '@phosphor-icons/react/dist/ssr';
import { MobileSpaceSettingsHeader } from './mobile-space-settings-header';

interface SpaceSettingsProps {
    space: Space;
}

export function SpaceSettings({ space }: SpaceSettingsProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<'success' | 'error' | null>(null);

    const handleUpdateSettings = async (updates: Partial<Space>) => {
        setIsUpdating(true);
        setUpdateStatus(null);

        try {
            const response = await fetch(`/api/spaces/${space.id}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            setUpdateStatus('success');

            // Clear success message after 2 seconds
            setTimeout(() => setUpdateStatus(null), 2000);
        } catch (error) {
            console.error('Failed to update space settings:', error);
            setUpdateStatus('error');

            // Clear error message after 3 seconds
            setTimeout(() => setUpdateStatus(null), 3000);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDefaultModelChange = (defaultModel: string) => {
        handleUpdateSettings({ defaultModel });
    };

    const handleNotificationChange = (key: keyof Space, value: boolean) => {
        handleUpdateSettings({ [key]: value });
    };

    const handleVisibilityChange = (visibility: string) => {
        handleUpdateSettings({ visibility });
    };

    return (
        <div className="space-y-8">
            {/* Mobile Header */}
            <MobileSpaceSettingsHeader title="General" />

            {/* Desktop Header */}
            <div className="hidden sm:block space-y-2">
                <h1 className="text-xl font-semibold">General Settings</h1>
                <p className="text-muted-foreground">
                    Basic configuration for <span className="font-mono">{space.name}</span>
                </p>
            </div>

            {/* Status Messages */}
            {updateStatus && (
                <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg text-sm",
                    updateStatus === 'success' && "bg-green-500/10 text-green-600 border border-green-500/20",
                    updateStatus === 'error' && "bg-red-500/10 text-red-600 border border-red-500/20"
                )}>
                    {updateStatus === 'success' ? (
                        <>
                            <Check size={16} weight="duotone" />
                            Settings updated successfully
                        </>
                    ) : (
                        <>
                            <X size={16} weight="duotone" />
                            Failed to update settings
                        </>
                    )}
                </div>
            )}

            {/* Basic Settings */}
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium font-mono">Default Model</label>
                        <select
                            value={space.defaultModel}
                            onChange={(e) => handleDefaultModelChange(e.target.value)}
                            disabled={isUpdating}
                            className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors disabled:opacity-50"
                        >
                            {AVAILABLE_MODELS.map((model) => (
                                <option key={model} value={model}>
                                    {model === 'claude-4-sonnet' && 'Claude 4 Sonnet'}
                                    {model === 'gpt-4o' && 'GPT-4o'}
                                    {model === 'gpt-4o-mini' && 'GPT-4o Mini'}
                                    {model === 'gemini-pro' && 'Gemini Pro'}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground font-mono">
                            Default AI model for analyzing webs in this space
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium font-mono">Visibility</label>
                        <select
                            value={space.visibility}
                            onChange={(e) => handleVisibilityChange(e.target.value)}
                            disabled={isUpdating}
                            className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors disabled:opacity-50"
                        >
                            {SPACE_VISIBILITY.map((visibility) => (
                                <option key={visibility} value={visibility}>
                                    {visibility === 'PRIVATE' && 'Private'}
                                    {visibility === 'SHARED' && 'Shared'}
                                    {visibility === 'PUBLIC' && 'Public'}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground font-mono">
                            Who can view and access this space
                        </p>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                    <p className="text-sm text-muted-foreground mb-4">Control notifications for this space</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="space-y-1">
                            <div className="text-sm font-medium">Web Processing Complete</div>
                            <div className="text-xs text-muted-foreground">
                                Get notified when web analysis finishes in this space
                            </div>
                        </div>
                        <button
                            onClick={() => handleNotificationChange('notifyWebComplete', !space.notifyWebComplete)}
                            disabled={isUpdating}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50",
                                space.notifyWebComplete ? "bg-foreground" : "bg-muted"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                                    space.notifyWebComplete ? "translate-x-6" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="space-y-1">
                            <div className="text-sm font-medium">Web Processing Failed</div>
                            <div className="text-xs text-muted-foreground">
                                Get notified when web analysis encounters errors in this space
                            </div>
                        </div>
                        <button
                            onClick={() => handleNotificationChange('notifyWebFailed', !space.notifyWebFailed)}
                            disabled={isUpdating}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50",
                                space.notifyWebFailed ? "bg-foreground" : "bg-muted"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                                    space.notifyWebFailed ? "translate-x-6" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Space Information */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Space Information</h3>
                    <p className="text-sm text-muted-foreground mb-4">Details about this space</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-sm font-medium mb-1">Space ID</div>
                        <div className="text-xs text-muted-foreground font-mono break-all">{space.id}</div>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-sm font-medium mb-1">Created</div>
                        <div className="text-xs text-muted-foreground">
                            {new Date(space.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-sm font-medium mb-1">Total Webs</div>
                        <div className="text-xs text-muted-foreground">{space._count?.webs || 0}</div>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-lg">
                        <div className="text-sm font-medium mb-1">Last Updated</div>
                        <div className="text-xs text-muted-foreground">
                            {new Date(space.updatedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 