import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth/server';
import { getUserSettings, updateUserSettings } from '@/lib/api/services/userSettings';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const settings = await getUserSettings(userId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const settings = await updateUserSettings(userId, body);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update user settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
