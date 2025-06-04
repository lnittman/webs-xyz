'use server';

import { auth } from '@repo/auth/server';
import { websService, userSettingsService } from '@repo/api';

export async function exportUserData(): Promise<
  | {
      success: true;
      data: {
        webs: any[];
        settings: any;
        exportedAt: string;
      };
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

    // Get all user data
    const [webs, settings] = await Promise.all([
      websService.listWebs(userId),
      userSettingsService.getUserSettings(userId),
    ]);

    return {
      success: true,
      data: {
        webs,
        settings,
        exportedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Failed to export data' };
  }
} 