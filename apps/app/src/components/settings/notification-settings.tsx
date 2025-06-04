'use client';

import React, { useCallback } from 'react';
import { useUserSettings } from '@/hooks/user-settings/queries';
import { updateUserSettings } from '@/app/actions/user-settings';
import type { UserSettings } from '@/types/user-settings';

export function NotificationSettings() {
    const { settings, isLoading, mutate } = useUserSettings();

    const handleNotificationToggle = useCallback(async (key: string, value: boolean) => {
        if (!settings) return;

        // Optimistic update
        const optimisticSettings: UserSettings = {
            ...settings,
            [key]: value,
            updatedAt: new Date().toISOString(),
        };

        await mutate(optimisticSettings, false);

        try {
            // Call server action
            const result = await updateUserSettings({ [key]: value });

            if ('error' in result) {
                throw new Error(result.error);
            }

            // Revalidate to get the server state
            await mutate();
        } catch (error) {
            // Revert on error
            await mutate();
            console.error('Failed to update notification setting:', error);
        }
    }, [settings, mutate]);

    const notifications = [
        {
            key: 'notifyProcessingComplete',
            title: 'Processing Complete',
            description: 'Get notified when web processing finishes',
            enabled: settings?.notifyProcessingComplete ?? true
        },
        {
            key: 'notifyProcessingFailed',
            title: 'Processing Failed',
            description: 'Get notified when web processing encounters errors',
            enabled: settings?.notifyProcessingFailed ?? true
        },
        {
            key: 'notifyWeeklySummary',
            title: 'Weekly Summary',
            description: 'Receive a weekly summary of your activity',
            enabled: settings?.notifyWeeklySummary ?? false
        },
        {
            key: 'notifyFeatureUpdates',
            title: 'Feature Updates',
            description: 'Get notified about new features and improvements',
            enabled: settings?.notifyFeatureUpdates ?? false
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold font-mono mb-2">Notifications</h2>
                <p className="text-sm text-muted-foreground font-mono">
                    Configure how and when you receive notifications.
                </p>
            </div>

            <div className="space-y-4">
                {notifications.map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-foreground/20 transition-colors">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium font-mono">{notification.title}</h3>
                            <p className="text-xs text-muted-foreground font-mono">
                                {notification.description}
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={notification.enabled}
                                onChange={(e) => handleNotificationToggle(notification.key, e.target.checked)}
                                disabled={isLoading}
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-foreground/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
} 