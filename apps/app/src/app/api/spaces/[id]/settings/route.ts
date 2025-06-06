import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth/server';
import { spaceService } from '@repo/api/services/space';
import { updateSpaceSettingsSchema } from '@repo/api/schemas/space';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const spaceId = params.id;
    const body = await request.json();

    // Validate the input
    const settings = updateSpaceSettingsSchema.parse(body);

    // Verify the space belongs to the user
    const space = await spaceService.getSpaceById(spaceId);
    if (!space || space.userId !== userId) {
      return new NextResponse('Space not found', { status: 404 });
    }

    // Update the space settings
    const updatedSpace = await spaceService.updateSpaceSettings(spaceId, settings);

    return NextResponse.json(updatedSpace);
  } catch (error) {
    console.error('Error updating space settings:', error);
    
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 