import { z } from 'zod';

export const userSettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fontFamily: z.string(),
  notifyProcessingComplete: z.boolean(),
  notifyProcessingFailed: z.boolean(),
  notifyWeeklySummary: z.boolean(),
  notifyFeatureUpdates: z.boolean(),
  workspaceName: z.string().nullable(),
  defaultModel: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const updateUserSettingsSchema = userSettingsSchema.partial().extend({
  userId: z.string().optional(),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
