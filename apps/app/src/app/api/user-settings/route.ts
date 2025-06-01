import { NextRequest } from 'next/server';
import { userSettingsService, updateUserSettingsSchema } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { validateWith } from '@repo/api/utils/validation';

async function handleGetUserSettings(
  request: NextRequest,
  { userId }: { userId: string }
) {
  const settings = await userSettingsService.getUserSettings(userId);
  return ApiResponse.success(settings);
}

async function handleUpdateUserSettings(
  request: NextRequest,
  { userId }: { userId: string }
) {
  const body = await request.json();
  const validatedData = await validateWith(updateUserSettingsSchema, body);
  
  const settings = await userSettingsService.updateUserSettings(userId, validatedData);
  return ApiResponse.success(settings);
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetUserSettings));
export const PATCH = withErrorHandling(withAuthenticatedUser(handleUpdateUserSettings));
