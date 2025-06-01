import { NextRequest } from 'next/server';
import { websService } from '@repo/api';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { ApiError } from '@repo/api/utils/error';
import { ResourceType } from '@repo/api/constants';

async function handleAnalyzeWeb(
  request: NextRequest, 
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const { id: webId } = await params;
  const { urls, prompt } = await request.json();

  // Verify web ownership
  const web = await websService.getWebById(webId);
  if (!web || web.userId !== userId) {
    throw ApiError.notFound(ResourceType.WEB, webId);
  }

  // Only allow analysis for FAILED webs (for retry) or new analysis
  if (web.status === 'PROCESSING') {
    throw ApiError.invalidParam('status', 'Web is already being processed');
  }

  if (web.status === 'COMPLETE' && !urls && !prompt) {
    throw ApiError.invalidParam('status', 'Web analysis is already complete. Provide new URLs or prompt to re-analyze.');
  }

  try {
    // Trigger the analysis workflow
    const runId = await websService.analyzeWebAsync({
      url: web.url,
      prompt: prompt || web.prompt || undefined,
      webId,
    });

    // Mark as processing
    await websService.markWebAsProcessing(webId, runId);

    return ApiResponse.success({
      message: 'Analysis started',
      webId,
      runId,
      status: 'PROCESSING',
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2102'}/api/webhooks/mastra`,
      info: 'The workflow will send updates via webhook as it progresses'
    });
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Mark web as failed
    await websService.markWebAsFailed(webId, error instanceof Error ? error.message : 'Unknown error');
    
    throw error;
  }
}

export const POST = withErrorHandling(withAuthenticatedUser(handleAnalyzeWeb));
 