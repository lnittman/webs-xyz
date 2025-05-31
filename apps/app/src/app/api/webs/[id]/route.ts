import { NextRequest } from 'next/server';
import { getWebById, updateWeb } from '@/lib/api/services/webs';
import { ApiResponse, withErrorHandling } from '@/lib/api/response';
import { withAuthenticatedUser } from '@/lib/api/auth';
import { webIdParamSchema, updateWebSchema } from '@/lib/api/schemas/web';
import { validateWith } from '@/lib/api/validation';
import { ApiError } from '@/lib/api/error';
import { ResourceType } from '@/lib/api/constants';

type RouteParams = { id: string };

async function handleGetWeb(
  request: NextRequest, 
  { params, userId }: { params: Promise<RouteParams>; userId: string }
) {
  // Validate the ID parameter
  try {
    // Await the params Promise first
    const resolvedParams = await params;
    
    const { id } = await validateWith(webIdParamSchema, resolvedParams);
    
    const web = await getWebById(id);
    
    if (!web) {
      throw ApiError.notFound(ResourceType.WEB, id);
    }

    // Check if the web belongs to the authenticated user
    if (web.userId !== userId) {
      throw ApiError.unauthorized('You do not have permission to access this web');
    }

    return ApiResponse.success(web);
  } catch (error) {
    throw error;
  }
}

async function handleUpdateWeb(
  request: NextRequest,
  { params, userId }: { params: Promise<RouteParams>; userId: string }
) {
  // Await the params Promise first
  const resolvedParams = await params;
  
  // Validate the ID parameter
  const { id } = await validateWith(webIdParamSchema, resolvedParams);
  
  // First check if the web exists and belongs to the user
  const existingWeb = await getWebById(id);
  if (!existingWeb) {
    throw ApiError.notFound(ResourceType.WEB, id);
  }

  if (existingWeb.userId !== userId) {
    throw ApiError.unauthorized('You do not have permission to update this web');
  }

  // Validate the update data
  const body = await request.json();
  const validatedData = await validateWith(updateWebSchema, body);

  const updatedWeb = await updateWeb(id, validatedData);
  return ApiResponse.success(updatedWeb);
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetWeb));
export const PATCH = withErrorHandling(withAuthenticatedUser(handleUpdateWeb));
