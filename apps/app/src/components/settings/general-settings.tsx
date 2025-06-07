'use client';

import React, { useCallback } from 'react';
import { AVAILABLE_MODELS, SPACE_DEFAULTS } from '@repo/api/constants';
import { useUserSettings } from '@/hooks/user-settings/queries';
import { updateUserSettings } from '@/app/actions/user-settings';
import type { UpdateUserSettingsInput, UserSettings } from '@/types/user-settings';

export function GeneralSettings() {
    const { settings, isLoading, mutate } = useUserSettings();

    const handleUpdateSettings = useCallback(async (updates: UpdateUserSettingsInput) => {
        if (!settings) return;

        // Optimistic update
        const optimisticSettings: UserSettings = {
            ...settings,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        await mutate(optimisticSettings, false);

        try {
            // Call server action
            const result = await updateUserSettings(updates);

            if ('error' in result) {
                throw new Error(result.error);
            }

            // Revalidate to get the server state
            await mutate();
        } catch (error) {
            // Revert on error
            await mutate();
            throw error;
        }
    }, [settings, mutate]);

    const handleWorkspaceNameChange = async (workspaceName: string) => {
        try {
            await handleUpdateSettings({ workspaceName });
        } catch (error) {
            console.error('Failed to update workspace name:', error);
        }
    };

    const handleDefaultModelChange = async (defaultModel: string) => {
        try {
            await handleUpdateSettings({ defaultModel });
        } catch (error) {
            console.error('Failed to update default model:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-20 bg-muted rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold font-mono mb-2">General Settings</h2>
                <p className="text-sm text-muted-foreground font-mono">
                    Manage your account and workspace preferences.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium font-mono">Workspace Name</label>
                    <input
                        type="text"
                        defaultValue={settings?.workspaceName || 'My Workspace'}
                        onBlur={(e) => handleWorkspaceNameChange(e.target.value)}
                        className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
                    />
                    <p className="text-xs text-muted-foreground font-mono">This is your workspace's visible name.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium font-mono">Default Model</label>
                    <select
                        value={settings?.defaultModel || SPACE_DEFAULTS.DEFAULT_MODEL}
                        onChange={(e) => handleDefaultModelChange(e.target.value)}
                        className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-colors"
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
                </div>
            </div>
        </div>
    );
} 