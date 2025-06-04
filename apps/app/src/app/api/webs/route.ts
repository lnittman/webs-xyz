import { NextRequest } from 'next/server';
import { websService, createWebSchema, mastraWorkflowService } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { validateWith } from '@repo/api/utils/validation';

async function handleGetWebs(request: NextRequest, { userId }: { userId: string }) {
  const webs = await websService.listWebs(userId);
  return ApiResponse.success(webs);
}

async function handleCreateWeb(request: NextRequest, { userId }: { userId: string }) {
  const body = await request.json();
  const validatedData = await validateWith(createWebSchema, { ...body, userId });

  console.log('app/api/webs/route.ts: [handleCreateWeb] Validated data:', validatedData);
  
  // Create web in database
  const web = await websService.createWeb(validatedData);

  console.log('app/api/webs/route.ts: [handleCreateWeb] Web created:', web);
  
  // Trigger analysis workflow
  try {
    const runId = await mastraWorkflowService.triggerAnalyzeWeb({
      urls: web.urls,
      prompt: web.prompt,
      webId: web.id,
    });
    
    // Mark as processing with the runId
    await websService.markWebAsProcessing(web.id, runId);
  } catch (error) {
    console.error('Failed to trigger analysis workflow:', error);
    await websService.markWebAsFailed(web.id, error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Return the latest version of the web
  const finalWeb = await websService.getWebById(web.id);
  
  return ApiResponse.success(finalWeb || web, 201);
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetWebs));
export const POST = withErrorHandling(withAuthenticatedUser(handleCreateWeb));
