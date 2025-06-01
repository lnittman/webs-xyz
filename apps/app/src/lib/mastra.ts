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
  console.log(`[mastra] Creating run for workflow: ${workflowName}`);
  
  // First, create a run
  const createRunResponse = await fetch(`${MASTRA_URL}/api/workflows/${workflowName}/createRun`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!createRunResponse.ok) {
    const error = await createRunResponse.text();
    console.error(`[mastra] Failed to create run:`, error);
    throw new Error(`Failed to create workflow run: ${createRunResponse.statusText}`);
  }

  const createRunResult = await createRunResponse.json();
  const { runId } = createRunResult;
  console.log(`[mastra] Created run with ID: ${runId}`);

  // Get the app URL for webhook
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2102';
  const webhookUrl = `${appUrl}/api/webhooks/mastra`;
  console.log(`[mastra] Using webhook URL: ${webhookUrl}`);

  // Then start the workflow asynchronously
  console.log(`[mastra] Starting workflow with runId: ${runId}`);
  const startResponse = await fetch(`${MASTRA_URL}/api/workflows/${workflowName}/start-async`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      runId,
      triggerData: data,
      metadata,
      webhook: {
        url: webhookUrl,
        method: 'POST',
      },
    }),
  });

  if (!startResponse.ok) {
    const error = await startResponse.text();
    console.error(`[mastra] Failed to start workflow:`, error);
    throw new Error(`Failed to start workflow: ${startResponse.statusText}`);
  }

  const result = await startResponse.json();
  console.log(`[mastra] Workflow started, result:`, result);
  
  // Return the original runId, not the one from the result
  return {
    runId,
    status: 'running',
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