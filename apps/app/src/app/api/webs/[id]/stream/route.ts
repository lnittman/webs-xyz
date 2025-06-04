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

  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isStreamActive = true;
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'connected',
        webId,
        runId,
        timestamp: new Date().toISOString()
      })}\n\n`));

      try {
        console.log(`[workflow-stream] Connecting to Mastra stream for runId: ${runId}`);
        
        // Use the Mastra workflow service to get the stream
        const response = await mastraWorkflowService.streamWorkflowExecution('analyzeWeb', runId);

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        console.log(`[workflow-stream] Successfully connected to Mastra stream`);

        while (isStreamActive) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log(`[workflow-stream] Received Mastra event:`, data);
                
                // Handle new streaming API events
                switch (data.type) {
                  case 'step-start':
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'step-progress',
                      stepId: data.payload.id,
                      status: 'running',
                      timestamp: new Date().toISOString()
                    })}\n\n`));
                    break;
                    
                  case 'step-result':
                    const stepId = data.payload.id;
                    const output = data.payload.output;
                    
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'step-progress',
                      stepId,
                      status: 'completed',
                      output,
                      timestamp: new Date().toISOString()
                    })}\n\n`));
                    
                    // Handle quick metadata updates
                    if (stepId === 'metadata' && output) {
                      try {
                        await websService.updateWebWithQuickMetadata(webId, {
                          title: output.quickTitle,
                          emoji: output.quickEmoji,
                          description: output.quickDescription,
                          topics: output.suggestedTopics,
                        });
                        console.log(`[workflow-stream] Updated quick metadata for web ${webId}`);
                      } catch (error) {
                        console.error(`[workflow-stream] Failed to update quick metadata:`, error);
                      }
                    }
                    break;
                    
                  case 'step-finish':
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'step-progress',
                      stepId: data.payload.id,
                      status: 'complete',
                      timestamp: new Date().toISOString()
                    })}\n\n`));
                    break;
                    
                  case 'finish':
                    // Get the final result from the workflow
                    const finalResult = await mastraWorkflowService.getWorkflowResult('analyzeWeb', runId);
                    
                    if (finalResult.status === 'success' && finalResult.result) {
                      try {
                        await websService.updateWebWithAnalysis(webId, finalResult.result);
                        console.log(`[workflow-stream] Updated final analysis for web ${webId}`);
                      } catch (error) {
                        console.error(`[workflow-stream] Failed to update final analysis:`, error);
                      }
                    }
                    
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'workflow-complete',
                      timestamp: new Date().toISOString()
                    })}\n\n`));
                    
                    isStreamActive = false;
                    break;
                    
                  default:
                    // Forward other events as-is
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                }
              } catch (error) {
                console.error('[workflow-stream] Error parsing Mastra event:', error);
              }
            }
          }
        }
        
        reader.releaseLock();
      } catch (error) {
        // Check if workflow already completed
        const currentWeb = await websService.getWebById(webId);
        if (currentWeb && currentWeb.status === 'COMPLETE') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'workflow-complete',
            message: 'Workflow already completed',
            web: {
              id: currentWeb.id,
              status: currentWeb.status,
              title: currentWeb.title,
              emoji: currentWeb.emoji,
              description: currentWeb.description,
              topics: currentWeb.topics,
              insights: currentWeb.insights,
            },
            timestamp: new Date().toISOString()
          })}\n\n`));
        } else {
          console.error('[workflow-stream] Error in stream:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          })}\n\n`));
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}

export const GET = withErrorHandling(withAuthenticatedUser(handleWorkflowStream)); 