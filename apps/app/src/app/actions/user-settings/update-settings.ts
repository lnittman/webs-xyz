'use server';

import { auth } from '@repo/auth/server';
import { userSettingsService, updateUserSettingsSchema } from '@repo/api';
import { revalidatePath } from 'next/cache';
import type { UpdateUserSettingsInput } from '@/types/user-settings';

export async function updateUserSettings(
  input: UpdateUserSettingsInput
): Promise<
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

    // Validate input
    const validatedData = updateUserSettingsSchema.parse(input);

    // Update settings using the service
    const settings = await userSettingsService.updateUserSettings(userId, validatedData);

    // Revalidate the settings page
    revalidatePath('/settings');

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error('Error updating user settings:', error);
    
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: 'Failed to update settings' };
  }
} 