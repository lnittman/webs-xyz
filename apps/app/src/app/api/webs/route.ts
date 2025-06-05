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

  // Create web in database
  const web = await websService.createWeb(validatedData);

  // Trigger analysis workflow
  try {
    const runId = await mastraWorkflowService.triggerAnalyzeWeb({
      urls: web.urls,
      prompt: web.prompt,
      webId: web.id,
    });
    
    // Mark as processing with the runId
    await websService.markWebAsProcessing(web.id, runId);
    
    // Start monitoring the workflow in the background
    // This ensures database updates happen even if client disconnects
    monitorWorkflowProgress(web.id, runId).catch(error => {
      console.error('Failed to monitor workflow:', error);
    });
  } catch (error) {
    console.error('Failed to trigger analysis workflow:', error);
    await websService.markWebAsFailed(web.id, error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Return the latest version of the web
  const finalWeb = await websService.getWebById(web.id);
  
  return ApiResponse.success(finalWeb || web, 201);
}

/**
 * Monitor workflow progress and update database
 * This runs in the background to ensure database consistency
 */
async function monitorWorkflowProgress(webId: string, runId: string) {
  try {
    // Get the workflow stream
    const stream = await mastraWorkflowService.streamWorkflowExecution('analyzeWeb', runId);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let hasReceivedEvents = false;
    let workflowCompleted = false;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split('\n\n');
      buffer = messages.pop() || '';
      
      for (const message of messages) {
        if (message.startsWith('data: ')) {
          try {
            const data = JSON.parse(message.slice(6));
            hasReceivedEvents = true;
            await handleWorkflowEvent(webId, data);
            
            // Track if workflow completed successfully
            if (data.type === 'finish') {
              workflowCompleted = true;
            }
          } catch (error) {
            console.error('Error processing workflow event:', error);
          }
        }
      }
    }
    
    // Only mark as failed if we received events but workflow didn't complete
    // This prevents marking as failed due to connection issues
    if (hasReceivedEvents && !workflowCompleted) {
      console.log(`[monitorWorkflow] Workflow stream ended without completion for web ${webId}`);
      // Don't immediately mark as failed - the workflow might still be running
      // Let the workflow status endpoint handle the final status
    }
  } catch (error) {
    console.error('Error monitoring workflow:', error);
    // Only mark as failed for actual workflow errors, not connection issues
    if (error instanceof Error && error.message.includes('Workflow')) {
      await websService.markWebAsFailed(webId, 'Workflow monitoring failed');
    }
  }
}

/**
 * Handle workflow events and update database
 */
async function handleWorkflowEvent(webId: string, event: any) {
  const { type, payload } = event;
  
  console.log(`[handleWorkflowEvent] Event type: ${type}`, payload?.id || '');
  
  switch (type) {
    case 'step-result':
      // Handle quick metadata updates
      if (payload.id === 'quick-metadata' && payload.status === 'success' && payload.output) {
        console.log(`[handleWorkflowEvent] Metadata step output:`, payload.output);
        const updated = await websService.updateWebWithQuickMetadata(webId, {
          title: payload.output.quickTitle,
          emoji: payload.output.quickEmoji,
          description: payload.output.quickDescription,
          topics: payload.output.suggestedTopics,
        });
        console.log(`[handleWorkflowEvent] Updated quick metadata for web ${webId}:`, {
          title: updated.title,
          emoji: updated.emoji,
          status: updated.status
        });
      }
      break;
      
    case 'finish':
      // Handle workflow completion
      console.log(`[handleWorkflowEvent] Workflow finished with status:`, payload.status);
      console.log(`[handleWorkflowEvent] Finish payload:`, JSON.stringify(payload).substring(0, 200));
      
      if (payload.status === 'success' && payload.result) {
        // Don't overwrite title, emoji, or description - preserve from metadata step
        const resultWithoutMetadata = {
          ...payload.result,
          title: undefined,
          emoji: undefined,
          description: undefined,
        };
        
        const updated = await websService.updateWebWithAnalysis(webId, resultWithoutMetadata);
        console.log(`[handleWorkflowEvent] Updated final analysis for web ${webId}:`, {
          title: updated.title,
          emoji: updated.emoji,
          status: updated.status,
          hasAnalysis: !!updated.analysis
        });
      } else if (payload.status === 'failed') {
        await websService.markWebAsFailed(webId, payload.error || 'Workflow failed');
        console.log(`[handleWorkflowEvent] Marked web ${webId} as failed`);
      } else {
        console.log(`[handleWorkflowEvent] Workflow finished but no result to save`);
      }
      break;
      
    case 'error':
      // Only handle critical errors that should fail the workflow
      console.error(`[handleWorkflowEvent] Workflow error for web ${webId}:`, event.error);
      // Don't immediately fail - let the workflow try to recover
      break;
  }
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetWebs));
export const POST = withErrorHandling(withAuthenticatedUser(handleCreateWeb));
