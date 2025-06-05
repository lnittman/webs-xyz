import 'server-only';

import { MastraClient } from '@mastra/client-js';

// Types
export interface WorkflowRunResult {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: Error;
}

export interface WorkflowAnalysisData {
  urls: string[];
  prompt?: string | null;
  webId?: string;
}

// Initialize Mastra client
const mastra = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100',
});

// Service class for Mastra workflow operations
export class MastraWorkflowService {
  /**
   * Trigger the analyzeWeb workflow using Mastra client
   */
  async triggerAnalyzeWeb(data: WorkflowAnalysisData): Promise<string> {
    try {
      console.log(`[MastraWorkflow] Starting analyzeWeb workflow using Mastra client`);
      
      // Get the workflow
      const workflow = mastra.getWorkflow('analyzeWeb');
      if (!workflow) {
        throw new Error('analyzeWeb workflow not found');
      }
      
      // Create a run instance
      const run = await workflow.createRun();
      
      // Start the workflow
      const promise = workflow.startAsync({
        runId: run.runId,
        inputData: {
          urls: data.urls,
          prompt: data.prompt || null,
          webId: data.webId,
        },
      });
      
      // Get the runId immediately (assuming it's available on the run instance)
      // Note: This might need adjustment based on actual Mastra API
      const runId = (run as any).runId || crypto.randomUUID();
      
      console.log(`[MastraWorkflow] Workflow started with runId: ${runId}`);
      
      // Store the promise for later retrieval if needed
      this.activeRuns.set(runId, { run, promise });
      
      return runId;
    } catch (error) {
      console.error(`[MastraWorkflow] Error:`, error);
      throw error;
    }
  }

  /**
   * Get workflow run status
   */
  async getWorkflowStatus(workflowId: string, runId: string): Promise<WorkflowRunResult> {
    try {
      const runData = this.activeRuns.get(runId);
      if (!runData) {
        return { runId, status: 'completed' }; // Assume completed if not in active runs
      }
      
      // Check if the promise is resolved
      const result = await Promise.race([
        runData.promise,
        new Promise(resolve => setTimeout(() => resolve(null), 100))
      ]);
      
      if (result) {
        this.activeRuns.delete(runId);
        return {
          runId,
          status: result.status === 'success' ? 'completed' : 'failed',
          result: result.status === 'success' ? result.result : undefined,
          error: result.status === 'failed' ? result.error : undefined,
        };
      }
      
      return { runId, status: 'running' };
    } catch (error) {
      console.error(`[MastraWorkflow] Error getting status:`, error);
      throw error;
    }
  }

  /**
   * Get workflow run result
   */
  async getWorkflowResult(workflowId: string, runId: string): Promise<any> {
    try {
      const runData = this.activeRuns.get(runId);
      if (!runData) {
        throw new Error(`Run ${runId} not found`);
      }
      
      const result = await runData.promise;
      this.activeRuns.delete(runId);
      
      if (result.status === 'success') {
        return result;
      } else {
        throw new Error(result.error?.message || 'Workflow failed');
      }
    } catch (error) {
      console.error(`[MastraWorkflow] Error getting result:`, error);
      throw error;
    }
  }

  /**
   * Stream workflow execution events
   */
  async streamWorkflowExecution(workflowId: string, runId: string): Promise<ReadableStream> {
    try {
      // Get the workflow
      const workflow = mastra.getWorkflow(workflowId);
      console.log(`[MastraWorkflow] Setting up watch for workflow: ${workflowId}, runId: ${runId}`);

      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      // Create a ReadableStream that will handle the events
      return new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          let watchClosed = false;
          
          try {
            console.log(`[MastraWorkflow] Starting watch for runId: ${runId}`);
            
            // Use watch instead of stream to avoid triggering new executions
            workflow.watch({ runId }, (record) => {
              if (watchClosed) return;
              
              // Transform the watch record to our expected format
              const event = {
                type: record.type || 'watch',
                payload: record.payload || {},
                eventTimestamp: record.eventTimestamp,
                runId: record.runId,
              };
              
              // Map watch events to our expected event types
              if (record.payload?.currentStep) {
                const step = record.payload.currentStep;
                if (step.status === 'running') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'step-start',
                    payload: { id: step.id }
                  })}\n\n`));
                } else if (step.status === 'success' || step.status === 'failed') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'step-result',
                    payload: {
                      id: step.id,
                      status: step.status,
                      output: step.output,
                      error: step.error
                    }
                  })}\n\n`));
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'step-finish',
                    payload: { id: step.id, metadata: {} }
                  })}\n\n`));
                }
              }
              
              // Check if workflow is complete
              const workflowStatus = record.payload?.workflowState?.status;
              if (workflowStatus === 'success' || (record.payload?.workflowState as any)?.status === 'completed') {
                // Log the workflow state structure for debugging
                console.log(`[MastraWorkflow] Workflow completed, extracting output from state`);
                console.log(`[MastraWorkflow] WorkflowState keys:`, Object.keys(record.payload?.workflowState || {}));
                console.log(`[MastraWorkflow] Steps available:`, Object.keys(record.payload?.workflowState?.steps || {}));
                
                // Extract the output from the workflow state
                const workflowOutput = record.payload?.workflowState?.output || 
                                     record.payload?.workflowState?.steps?.combine?.output;
                
                console.log(`[MastraWorkflow] Extracted output:`, workflowOutput ? 'Found' : 'Not found');
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'finish',
                  payload: {
                    runId,
                    status: 'success',
                    result: workflowOutput
                  }
                })}\n\n`));
                watchClosed = true;
                controller.close();
              } else if (workflowStatus === 'failed') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'finish',
                  payload: {
                    runId,
                    status: 'failed',
                    error: record.payload.workflowState.error
                  }
                })}\n\n`));
                watchClosed = true;
                controller.close();
              }
              
              // Log the raw event for debugging
              console.log(`[MastraWorkflow] Watch event:`, JSON.stringify(event).substring(0, 200));
            });
            
            // Send initial start event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'start',
              payload: { runId }
            })}\n\n`));
            
            console.log(`[MastraWorkflow] Watch established for runId: ${runId}`);
            
            // Keep the stream open until watch is closed
            // The watch callback will close the stream when workflow completes
          } catch (error: any) {
            console.error(`[MastraWorkflow] Watch error for runId ${runId}:`, error);
            
            // Send error event to client
            const errorEvent = {
              type: 'error',
              error: error.message || 'Watch connection failed',
              timestamp: new Date().toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
            
            controller.close();
          }
        }
      });
    } catch (error) {
      console.error(`[MastraWorkflow] Error setting up watch:`, error);
      throw error;
    }
  }

  // Store active workflow runs
  private activeRuns = new Map<string, { run: any; promise: Promise<any> }>();
}

// Export singleton instance
export const mastraWorkflowService = new MastraWorkflowService(); 