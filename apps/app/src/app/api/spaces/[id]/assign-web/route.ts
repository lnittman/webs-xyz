import { NextRequest } from 'next/server';
import { spaceService, assignWebToSpaceSchema } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { validateWith } from '@repo/api/utils/validation';

async function handleAssignWebToSpace(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const resolvedParams = await params;
  const spaceId = resolvedParams.id;
  
  const body = await request.json();
  const { webId } = await validateWith(assignWebToSpaceSchema, { ...body, spaceId });
  
  // Use the actual spaceId from body if provided, otherwise use route param
  const targetSpaceId = body.spaceId !== undefined ? body.spaceId : spaceId;
  
  await spaceService.assignWebToSpace(webId, targetSpaceId, userId);
  
  return ApiResponse.success({ 
    message: 'Web assigned to space successfully',
    webId,
    spaceId: targetSpaceId
  });
}

export const POST = withErrorHandling(withAuthenticatedUser(handleAssignWebToSpace)); 