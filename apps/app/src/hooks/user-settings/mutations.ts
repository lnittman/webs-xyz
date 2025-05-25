import { useState } from 'react';
import { mutate } from 'swr';
import type { UpdateUserSettingsInput, UserSettings } from '@/types/user-settings';

export function useUpdateUserSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateSettings = async (updates: UpdateUserSettingsInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json() as UserSettings;
      
      // Invalidate and refetch user settings
      await mutate('/api/user-settings');
      
      return updatedSettings;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateSettings,
    isLoading,
    error,
  };
} 