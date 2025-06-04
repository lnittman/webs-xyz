import 'server-only';

// Types
export interface WorkflowRunResult {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface WorkflowAnalysisData {
  urls: string[];
  prompt?: string | null;
  webId?: string;
}

// Service class for Mastra workflow operations
export class MastraWorkflowService {
  private mastraUrl: string;

  constructor() {
    this.mastraUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100';
  }

  /**
   * Trigger the analyzeWeb workflow
   */
  async triggerAnalyzeWeb(data: WorkflowAnalysisData): Promise<string> {
    try {
      console.log(`[MastraWorkflow] Starting analyzeWeb workflow`);
      
      // Create and start the workflow run
      const response = await fetch(`${this.mastraUrl}/api/workflows/analyzeWeb/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputData: {
            urls: data.urls,
            prompt: data.prompt || null,
            webId: data.webId,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[MastraWorkflow] Failed to start workflow:`, error);
        throw new Error(`Failed to start workflow: ${response.statusText}`);
      }

      const result = await response.json();
      const runId = result.runId;
      
      console.log(`[MastraWorkflow] Workflow started with runId: ${runId}`);
      
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
      const response = await fetch(`${this.mastraUrl}/api/workflows/${workflowId}/runs/${runId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get workflow status: ${response.statusText}`);
      }

      return response.json();
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
      const response = await fetch(`${this.mastraUrl}/api/workflows/${workflowId}/result/${runId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get workflow result: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[MastraWorkflow] Error getting result:`, error);
      throw error;
    }
  }

  /**
   * Stream workflow execution events
   */
  async streamWorkflowExecution(workflowId: string, runId: string): Promise<Response> {
    const response = await fetch(`${this.mastraUrl}/api/workflows/${workflowId}/stream/${runId}`, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to connect to workflow stream: ${response.statusText}`);
    }

    return response;
  }
}

// Export singleton instance
export const mastraWorkflowService = new MastraWorkflowService(); 