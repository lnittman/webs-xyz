import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await database.userSettings.findUnique({
      where: { userId }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await database.userSettings.create({
        data: { userId }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const allowedFields = [
      'fontFamily',
      'notifyProcessingComplete',
      'notifyProcessingFailed', 
      'notifyWeeklySummary',
      'notifyFeatureUpdates',
      'workspaceName',
      'defaultModel'
    ];

    const updateData = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {} as any);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const settings = await database.userSettings.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
 