import { NextRequest } from 'next/server';
import { spaceService, spaceIdParamSchema, updateSpaceSchema } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { validateWith } from '@repo/api/utils/validation';
import { ApiError } from '@repo/api/utils/error';
import { ResourceType } from '@repo/api/constants';

async function handleGetSpace(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const resolvedParams = await params;
  const { id } = await validateWith(spaceIdParamSchema, resolvedParams);
  const { searchParams } = new URL(request.url);
  const includeWebs = searchParams.get('includeWebs') === 'true';
  
  const space = await spaceService.getSpaceById(id, includeWebs);
  
  if (!space) {
    throw ApiError.notFound(ResourceType.WEB, id); // Using WEB since we don't have SPACE type yet
  }
  
  if (space.userId !== userId) {
    throw ApiError.unauthorized('You do not have access to this space');
  }
  
  return ApiResponse.success(space);
}

async function handleUpdateSpace(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const resolvedParams = await params;
  const { id } = await validateWith(spaceIdParamSchema, resolvedParams);
  const body = await request.json();
  const updateData = await validateWith(updateSpaceSchema, body);
  
  // Verify ownership first
  const existingSpace = await spaceService.getSpaceById(id);
  if (!existingSpace) {
    throw ApiError.notFound(ResourceType.WEB, id); // Using WEB since we don't have SPACE type yet
  }
  
  if (existingSpace.userId !== userId) {
    throw ApiError.unauthorized('You do not have access to this space');
  }
  
  const space = await spaceService.updateSpace(id, updateData);
  return ApiResponse.success(space);
}

async function handleDeleteSpace(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const resolvedParams = await params;
  const { id } = await validateWith(spaceIdParamSchema, resolvedParams);
  
  // Verify ownership first
  const existingSpace = await spaceService.getSpaceById(id);
  if (!existingSpace) {
    throw ApiError.notFound(ResourceType.WEB, id); // Using WEB since we don't have SPACE type yet
  }
  
  if (existingSpace.userId !== userId) {
    throw ApiError.unauthorized('You do not have access to this space');
  }
  
  await spaceService.deleteSpace(id);
  return ApiResponse.success({ message: 'Space deleted successfully' });
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetSpace));
export const PATCH = withErrorHandling(withAuthenticatedUser(handleUpdateSpace));
export const DELETE = withErrorHandling(withAuthenticatedUser(handleDeleteSpace)); 