import { NextRequest } from 'next/server';
import { spaceService, createSpaceSchema } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { validateWith } from '@repo/api/utils/validation';

async function handleGetSpaces(request: NextRequest, { userId }: { userId: string }) {
  const { searchParams } = new URL(request.url);
  const includeWebs = searchParams.get('includeWebs') !== 'false'; // Default to true
  
  // Ensure user has a default space (for existing users)
  await spaceService.ensureUserHasDefaultSpace(userId);
  
  const spaces = await spaceService.listSpaces(userId, includeWebs);
  return ApiResponse.success(spaces);
}

async function handleCreateSpace(request: NextRequest, { userId }: { userId: string }) {
  const body = await request.json();
  const validatedData = await validateWith(createSpaceSchema, { ...body, userId });

  const space = await spaceService.createSpace(validatedData);
  return ApiResponse.success(space, 201);
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetSpaces));
export const POST = withErrorHandling(withAuthenticatedUser(handleCreateSpace)); 