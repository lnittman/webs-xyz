import { NextRequest } from 'next/server';
import {
  withAuthenticatedUser,
  withErrorHandling,
  ApiResponse,
  ApiError,
  spaceService,
  spaceIdParamSchema
} from '@repo/api';
import { updateSpaceSettingsSchema } from '@repo/api/schemas/space';

// PATCH handler for updating space settings
async function updateSpaceSettings(
  request: NextRequest,
  { params, userId }: { params: { id: string }; userId: string }
) {
  // Validate space ID parameter
  const { id: spaceId } = spaceIdParamSchema.parse(params);
  
  // Parse request body
  const body = await request.json();
  
  // Validate the settings input
  const settings = updateSpaceSettingsSchema.parse(body);

  // Verify the space belongs to the user
  const space = await spaceService.getSpaceById(spaceId);
  if (!space || space.userId !== userId) {
    throw ApiError.notFound('Space');
  }

  // Update the space settings
  const updatedSpace = await spaceService.updateSpaceSettings(spaceId, settings);
  
  return ApiResponse.success(updatedSpace);
}

// Export the PATCH handler with authentication and error handling
export const PATCH = withErrorHandling(withAuthenticatedUser(updateSpaceSettings)); 