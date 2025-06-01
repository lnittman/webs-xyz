import 'server-only';
import { database } from '@repo/database';
import { z } from 'zod';

// Types
export interface UserSettings {
  id: string;
  userId: string;
  fontFamily: string;
  notifyProcessingComplete: boolean;
  notifyProcessingFailed: boolean;
  notifyWeeklySummary: boolean;
  notifyFeatureUpdates: boolean;
  workspaceName: string | null;
  defaultModel: string;
  createdAt: string;
  updatedAt: string;
}

// Input schema
export const updateUserSettingsSchema = z.object({
  fontFamily: z.string().optional(),
  notifyProcessingComplete: z.boolean().optional(),
  notifyProcessingFailed: z.boolean().optional(),
  notifyWeeklySummary: z.boolean().optional(),
  notifyFeatureUpdates: z.boolean().optional(),
  workspaceName: z.string().nullable().optional(),
  defaultModel: z.string().optional(),
});

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;

// Service class
export class UserSettingsService {
  /**
   * Get user settings (creates if doesn't exist)
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    let settings = await database.userSettings.findUnique({
      where: { userId },
    });
    
    if (!settings) {
      settings = await database.userSettings.create({ 
        data: { userId } 
      });
    }
    
    return this.serializeSettings(settings);
  }

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    input: unknown,
  ): Promise<UserSettings> {
    const data = updateUserSettingsSchema.parse(input);
    
    const settings = await database.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    
    return this.serializeSettings(settings);
  }

  /**
   * Serialize settings with proper date formatting
   */
  private serializeSettings(settings: any): UserSettings {
    return {
      ...settings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };
  }
}

// Export singleton instance
export const userSettingsService = new UserSettingsService(); 