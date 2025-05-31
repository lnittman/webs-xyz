const MASTRA_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100';

export interface WorkflowExecutionResult {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export async function executeWorkflow(
  workflowName: string,
  data: any,
  metadata?: any
): Promise<WorkflowExecutionResult> {
  // First, create a run
  const createRunResponse = await fetch(`${MASTRA_URL}/api/workflows/${workflowName}/createRun`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!createRunResponse.ok) {
    throw new Error(`Failed to create workflow run: ${createRunResponse.statusText}`);
  }

  const { runId } = await createRunResponse.json();

  // Then start the workflow asynchronously
  const startResponse = await fetch(`${MASTRA_URL}/api/workflows/${workflowName}/start-async`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      runId,
      triggerData: data,
      metadata,
      // Include webhook URL for completion callback - now pointing to API app
      webhookUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2101'}/webhooks/mastra`,
    }),
  });

  if (!startResponse.ok) {
    throw new Error(`Failed to start workflow: ${startResponse.statusText}`);
  }

  const result = await startResponse.json();
  
  return {
    runId,
    status: 'running',
    ...result
  };
}

export async function getWorkflowStatus(
  workflowName: string,
  runId: string
): Promise<WorkflowExecutionResult> {
  const response = await fetch(`${MASTRA_URL}/api/workflows/${workflowName}/runs/${runId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get workflow status: ${response.statusText}`);
  }

  return response.json();
} 