import { NextRequest } from 'next/server';
import { websService, webIdParamSchema, mastraWorkflowService } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { validateWith } from '@repo/api/utils/validation';
import { ApiError } from '@repo/api/utils/error';
import { ResourceType } from '@repo/api/constants';

async function handleRetryWeb(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const resolvedParams = await params;
  const { id } = await validateWith(webIdParamSchema, resolvedParams);
  
  // Verify web exists and user has access
  const web = await websService.getWebById(id);
  if (!web) {
    throw ApiError.notFound(ResourceType.WEB, id);
  }
  
  if (web.userId !== userId) {
    throw ApiError.unauthorized('You do not have access to this web');
  }
  
  // Only allow retry for failed webs
  if (web.status !== 'FAILED') {
    throw ApiError.invalidParam('status', 'Web must be in FAILED status to retry');
  }
  
  try {
    // Trigger the analysis workflow
    const runId = await mastraWorkflowService.triggerAnalyzeWeb({
      urls: web.urls || [web.url],
      prompt: web.prompt || undefined,
      webId: id,
    });
    
    // Mark as processing
    await websService.markWebAsProcessing(id, runId);
    
    return ApiResponse.success({ 
      message: 'Web analysis retry started',
      runId,
      status: 'PROCESSING'
    });
  } catch (error) {
    await websService.markWebAsFailed(id, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export const POST = withErrorHandling(withAuthenticatedUser(handleRetryWeb)); 