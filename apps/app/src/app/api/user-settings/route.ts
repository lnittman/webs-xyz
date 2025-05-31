import { NextRequest } from 'next/server';
import { getUserSettings, updateUserSettings } from '@/lib/api/services/userSettings';
import { ApiResponse, withErrorHandling } from '@/lib/api/response';
import { withAuthenticatedUser } from '@/lib/api/auth';
import { updateUserSettingsSchema } from '@/lib/api/schemas/userSettings';
import { validateWith } from '@/lib/api/validation';

async function handleGetUserSettings(
  request: NextRequest,
  { userId }: { userId: string }
) {
  const settings = await getUserSettings(userId);
  return ApiResponse.success(settings);
}

async function handleUpdateUserSettings(
  request: NextRequest,
  { userId }: { userId: string }
) {
  const body = await request.json();
  const validatedData = await validateWith(updateUserSettingsSchema, body);
  
  const settings = await updateUserSettings(userId, validatedData);
  return ApiResponse.success(settings);
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetUserSettings));
export const PATCH = withErrorHandling(withAuthenticatedUser(handleUpdateUserSettings));
