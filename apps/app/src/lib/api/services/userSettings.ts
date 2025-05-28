import { database } from '@repo/database';
import { updateUserSettingsSchema, UserSettings } from '../schemas/userSettings';

export async function getUserSettings(userId: string): Promise<UserSettings> {
  let settings = await database.userSettings.findUnique({
    where: { userId },
  });
  if (!settings) {
    settings = await database.userSettings.create({ data: { userId } });
  }
  return {
    ...settings,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export async function updateUserSettings(
  userId: string,
  input: unknown,
): Promise<UserSettings> {
  const data = updateUserSettingsSchema.parse(input);
  const settings = await database.userSettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
  return {
    ...settings,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}
