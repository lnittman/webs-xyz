import { DataStreamWriter } from 'ai';
import type { Workflow } from '@mastra/core/workflows';

export interface WorkflowStreamOptions {
  onQuickMetadata?: (metadata: any) => void;
  onStepComplete?: (step: any) => void;
  onWorkflowComplete?: (result: any) => void;
  onError?: (error: any) => void;
}

/**
 * Stream Mastra workflow progress using AI SDK data stream protocol
 */
export async function streamAnalyzeWebWorkflow(
  workflow: Workflow,
  runId: string,
  dataStream: DataStreamWriter,
  webId: string,
  options: WorkflowStreamOptions = {}
) {
  try {
    // Create a run instance to watch
    const run = workflow.createRun({ runId });
    
    // Watch workflow execution
    const unwatch = run.watch((record: any) => {
      const { activePaths, results, timestamp } = record;
      
      // Stream step start events
      Object.entries(activePaths || {}).forEach(([stepId, pathInfo]: [string, any]) => {
        if (pathInfo?.status === 'executing') {
          dataStream.writeData([{
            type: 'workflow-step-start',
            stepId,
            webId,
            timestamp,
            stepName: formatStepName(stepId),
          }]);
        }
      });
      
      // Stream step completion events
      Object.entries(results || {}).forEach(([stepId, result]: [string, any]) => {
        if (result?.status === 'success') {
          const stepData = {
            type: 'workflow-step-complete',
            stepId,
            webId,
            result: result.output,
            timestamp,
          };
          
          dataStream.writeData([stepData]);
          
          // Handle specific step completions
          if (stepId === 'generate-quick-metadata') {
            // Stream quick metadata immediately for UI updates
            dataStream.writeMessageAnnotation({
              type: 'quick-metadata',
              webId,
              title: result.output?.quickTitle,
              emoji: result.output?.quickEmoji,
              description: result.output?.quickDescription,
              topics: result.output?.suggestedTopics,
            });
            
            options.onQuickMetadata?.(result.output);
          }
          
          if (stepId === 'detailed-analysis') {
            // Stream individual URL analyses
            dataStream.writeData([{
              type: 'url-analyses',
              webId,
              analyses: result.output?.urlAnalyses?.map((a: any) => ({
                url: a.url,
                title: a.title,
                topics: a.topics?.slice(0, 5),
                insights: a.insights?.slice(0, 3),
                sentiment: a.sentiment,
              })) || [],
            }]);
          }
          
          if (stepId === 'final-assembly') {
            // Stream final completion
            dataStream.writeMessageAnnotation({
              type: 'analysis-complete',
              webId,
              result: result.output,
            });
            
            options.onWorkflowComplete?.(result.output);
          }
          
          options.onStepComplete?.({ stepId, result: result.output });
        }
        
        if (result?.status === 'failed') {
          const errorData = {
            type: 'workflow-step-error',
            stepId,
            webId,
            error: result.error || 'Step failed',
            timestamp,
          };
          
          dataStream.writeData([errorData]);
          options.onError?.(result.error);
        }
      });
      
      // Check if workflow is complete
      const allStepsComplete = Object.values(activePaths || {}).every(
        (path: any) => path?.status !== 'executing'
      );
      
      if (allStepsComplete) {
        const hasErrors = Object.values(results || {}).some((r: any) => r?.status === 'failed');
        
        if (hasErrors) {
          dataStream.writeData([{
            type: 'workflow-failed',
            webId,
            timestamp,
          }]);
        } else {
          dataStream.writeData([{
            type: 'workflow-complete',
            webId,
            results,
            timestamp,
          }]);
        }
        
        // Clean up watcher
        unwatch?.();
      }
    });
    
  } catch (error) {
    console.error('[StreamAdapter] Error setting up workflow stream:', error);
    dataStream.writeData([{
      type: 'stream-error',
      webId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }]);
    options.onError?.(error);
  }
}

/**
 * Format step ID to human-readable name
 */
function formatStepName(stepId: string): string {
  const stepNames: Record<string, string> = {
    'fetch-urls': 'Fetching URLs',
    'generate-quick-metadata': 'Generating Quick Metadata',
    'detailed-analysis': 'Analyzing Content',
    'enhanced-combine': 'Finding Connections',
    'final-assembly': 'Finalizing Results',
  };
  
  return stepNames[stepId] || stepId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Create a workflow stream for a specific web analysis
 */
export function createWebAnalysisStream(
  workflow: Workflow,
  runId: string,
  webId: string,
  options: WorkflowStreamOptions = {}
) {
  return {
    stream: async (dataStream: DataStreamWriter) => {
      await streamAnalyzeWebWorkflow(workflow, runId, dataStream, webId, options);
    },
    runId,
    webId,
  };
} 