import { NextRequest } from 'next/server';
import { websService } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { z } from 'zod';
import { ApiError } from '@repo/api/utils/error';

// Webhook payload schema
const webhookPayloadSchema = z.object({
  workflowName: z.string(),
  runId: z.string(),
  status: z.enum(['started', 'running', 'completed', 'failed', 'success', 'error']),
  stepId: z.string().optional(),
  stepStatus: z.enum(['started', 'completed', 'failed']).optional(),
  results: z.any().optional(),
  metadata: z.object({
    webId: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
});

async function handleMastraWebhook(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[mastra-webhook] Received webhook:', JSON.stringify(body, null, 2));

    // Validate webhook payload
    const payload = webhookPayloadSchema.parse(body);
    const { workflowName, runId, status, stepId, stepStatus, results, metadata, error } = payload;

    // Only process analyzeWeb workflow
    if (workflowName !== 'analyzeWeb') {
      console.log(`[mastra-webhook] Ignoring webhook for workflow: ${workflowName}`);
      return ApiResponse.success({ acknowledged: true });
    }

    const webId = metadata?.webId;
    if (!webId) {
      console.error('[mastra-webhook] No webId in metadata');
      return ApiResponse.error(ApiError.missingParam('webId'));
    }

    console.log(`[mastra-webhook] Processing webhook for web ${webId}, status: ${status}, step: ${stepId}`);

    // Handle step-level events
    if (stepId && stepStatus) {
      await handleStepEvent(webId, stepId, stepStatus, results);
    }

    // Handle workflow-level events
    await handleWorkflowEvent(webId, status, results, error);

    return ApiResponse.success({ 
      acknowledged: true,
      processed: {
        webId,
        workflowName,
        status,
        stepId
      }
    });
  } catch (error) {
    console.error('[mastra-webhook] Error processing webhook:', error);
    throw error;
  }
}

async function handleStepEvent(
  webId: string, 
  stepId: string, 
  stepStatus: string, 
  results: any
) {
  console.log(`[mastra-webhook] Handling step event: ${stepId} - ${stepStatus}`);

  // Handle step completions
  if (stepStatus === 'completed' && results) {
    switch (stepId) {
      case 'generate-quick-metadata':
        if (results['generate-quick-metadata']?.output) {
          const quickData = results['generate-quick-metadata'].output;
          console.log(`[mastra-webhook] Updating quick metadata for web ${webId}`, quickData);
          
          await websService.updateWebWithQuickMetadata(webId, {
            title: quickData.quickTitle,
            emoji: quickData.quickEmoji,
            description: quickData.quickDescription,
            topics: quickData.suggestedTopics,
          });
        }
        break;

      case 'final-assembly':
        if (results['final-assembly']?.output) {
          console.log(`[mastra-webhook] Updating web ${webId} with final analysis`);
          await websService.updateWebWithAnalysis(webId, results['final-assembly'].output);
        }
        break;

      default:
        console.log(`[mastra-webhook] No handler for step: ${stepId}`);
    }
  }
}

async function handleWorkflowEvent(
  webId: string,
  status: string,
  results: any,
  error?: string
) {
  console.log(`[mastra-webhook] Handling workflow event: ${status}`);

  switch (status) {
    case 'started':
    case 'running':
      // Workflow is running, no action needed
      break;

    case 'failed':
    case 'error':
      console.error(`[mastra-webhook] Workflow failed for web ${webId}:`, error);
      await websService.markWebAsFailed(webId, error);
      break;

    case 'completed':
    case 'success':
      // Check if we have final results
      if (results?.['final-assembly']?.status === 'success' && results['final-assembly']?.output) {
        console.log(`[mastra-webhook] Workflow completed successfully for web ${webId}`);
        await websService.updateWebWithAnalysis(webId, results['final-assembly'].output);
      } else if (!results || Object.keys(results).length === 0) {
        // No results means the workflow might have completed without errors but no output
        console.warn(`[mastra-webhook] Workflow completed but no results for web ${webId}`);
      } else {
        // Check if any step failed
        const failedSteps = Object.entries(results)
          .filter(([_, result]: [string, any]) => result?.status === 'failed');
        
        if (failedSteps.length > 0) {
          console.error(`[mastra-webhook] Workflow completed with failures for web ${webId}:`, failedSteps);
          await websService.markWebAsFailed(webId, 'Workflow completed with failures');
        }
      }
      break;

    default:
      console.log(`[mastra-webhook] Unknown workflow status: ${status}`);
  }
}

export const POST = withErrorHandling(handleMastraWebhook); 