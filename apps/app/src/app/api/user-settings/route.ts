import { NextRequest } from 'next/server';
import { auth } from '@repo/auth/server';
import { getUserSettings, updateUserSettings } from '@/lib/api/services/userSettings';
import { success, error as errorResponse } from '@/lib/api/response';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    const settings = await getUserSettings(userId);
    return success(settings);
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    return errorResponse('Failed to fetch settings');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    const body = await request.json();
    const settings = await updateUserSettings(userId, body);
    return success(settings);
  } catch (error) {
    console.error('Failed to update user settings:', error);
    return errorResponse('Failed to update settings');
  }
}
