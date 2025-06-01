import { NextRequest } from 'next/server';
import { websService, webIdParamSchema, updateWebSchema } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { validateWith } from '@repo/api/utils/validation';
import { ApiError } from '@repo/api/utils/error';
import { ResourceType } from '@repo/api/constants';

async function handleGetWeb(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const resolvedParams = await params;
  const { id } = await validateWith(webIdParamSchema, resolvedParams);
  const web = await websService.getWebById(id);
  
  if (!web) {
    throw ApiError.notFound(ResourceType.WEB, id);
  }
  
  if (web.userId !== userId) {
    throw ApiError.unauthorized('You do not have access to this web');
  }
  
  return ApiResponse.success(web);
}

async function handleUpdateWeb(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const resolvedParams = await params;
  const { id } = await validateWith(webIdParamSchema, resolvedParams);
  const body = await request.json();
  const updateData = await validateWith(updateWebSchema, body);
  
  // Verify ownership first
  const existingWeb = await websService.getWebById(id);
  if (!existingWeb) {
    throw ApiError.notFound(ResourceType.WEB, id);
  }
  
  if (existingWeb.userId !== userId) {
    throw ApiError.unauthorized('You do not have access to this web');
  }
  
  const web = await websService.updateWeb(id, updateData);
  return ApiResponse.success(web);
}

async function handleDeleteWeb(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const resolvedParams = await params;
  const { id } = await validateWith(webIdParamSchema, resolvedParams);
  
  // Verify ownership first
  const existingWeb = await websService.getWebById(id);
  if (!existingWeb) {
    throw ApiError.notFound(ResourceType.WEB, id);
  }
  
  if (existingWeb.userId !== userId) {
    throw ApiError.unauthorized('You do not have access to this web');
  }
  
  await websService.deleteWeb(id);
  return ApiResponse.success({ message: 'Web deleted successfully' });
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetWeb));
export const PATCH = withErrorHandling(withAuthenticatedUser(handleUpdateWeb));
export const DELETE = withErrorHandling(withAuthenticatedUser(handleDeleteWeb));
