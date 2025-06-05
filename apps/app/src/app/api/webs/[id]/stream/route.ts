import { NextRequest } from 'next/server';
import { websService, mastraWorkflowService } from '@repo/api';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { withErrorHandling } from '@repo/api/utils/response';
import { ApiError } from '@repo/api/utils/error';
import { ResourceType } from '@repo/api/constants';

async function handleWorkflowStream(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const { id: webId } = await params;
  
  // Verify web ownership
  const web = await websService.getWebById(webId);
  if (!web || web.userId !== userId) {
    throw ApiError.notFound(ResourceType.WEB, webId);
  }

  // Only stream for processing webs
  if (web.status !== 'PROCESSING') {
    return new Response('Web is not processing', { status: 400 });
  }

  const runId = web.analysis?.runId;
  if (!runId) {
    return new Response('No runId found', { status: 400 });
  }

  try {
    // Get the stream directly from the Mastra workflow service
    // This is a read-only stream - all database updates are handled by the main route
    const mastraStream = await mastraWorkflowService.streamWorkflowExecution('analyzeWeb', runId);
    
    return new Response(mastraStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
      },
    });
  } catch (error) {
    console.error('[workflow-stream] Error setting up stream:', error);
    
    // Return an error event
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })}\n\n`));
        controller.close();
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}

export const GET = withErrorHandling(withAuthenticatedUser(handleWorkflowStream)); 