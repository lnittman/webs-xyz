'use server';

import { auth } from '@repo/auth/server';
import { userSettingsService } from '@repo/api';

export async function getUserSettings(): Promise<
  | {
      success: true;
      data: any;
    }
  | {
      error: string;
    }
> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'Not authenticated' };
    }

    // Get settings using the service
    const settings = await userSettingsService.getUserSettings(userId);

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error('Error getting user settings:', error);
    
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Failed to get settings' };
  }
} 