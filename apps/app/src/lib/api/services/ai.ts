interface AnalyzeWebParams {
  url: string;
  prompt?: string;
}

interface AnalyzeWebResponse {
  runId: string;
  status: string;
  result?: {
    title?: string;
    description?: string;
    content?: string;
    analysis?: string;
  };
  error?: string;
}

const MASTRA_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100';

/**
 * Calls the Mastra analyzeWeb workflow asynchronously
 * @param params - The parameters for the analysis
 * @returns Promise with the workflow run ID
 */
export async function analyzeWebAsync(params: AnalyzeWebParams): Promise<string> {
  try {
    // First, create a run
    const createRunResponse = await fetch(`${MASTRA_URL}/api/workflows/analyzeWeb/createRun`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!createRunResponse.ok) {
      const errorText = await createRunResponse.text();
      throw new Error(`Failed to create workflow run: ${createRunResponse.status} - ${errorText}`);
    }

    const { runId } = await createRunResponse.json();

    // Then start the workflow asynchronously
    const startResponse = await fetch(`${MASTRA_URL}/api/workflows/analyzeWeb/start-async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        runId,
        triggerData: {
          urls: [params.url], // Convert single URL to array as expected by workflow
          prompt: params.prompt || undefined,
        },
      }),
    });

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      throw new Error(`Failed to start analysis workflow: ${startResponse.status} - ${errorText}`);
    }

    return runId;
  } catch (error) {
    console.error('Error calling Mastra analyzeWeb workflow:', error);
    throw error;
  }
}

/**
 * Gets the status of a workflow run
 * @param runId - The workflow run ID
 * @returns Promise with the workflow status and result
 */
export async function getWorkflowStatus(runId: string): Promise<AnalyzeWebResponse> {
  try {
    const response = await fetch(`${MASTRA_URL}/api/workflows/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get workflow status: ${response.status} - ${errorText}`);
    }

    const data: AnalyzeWebResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting workflow status:', error);
    throw error;
  }
}

/**
 * Polls the workflow status until completion
 * @param runId - The workflow run ID
 * @param maxAttempts - Maximum number of polling attempts
 * @param delayMs - Delay between polls in milliseconds
 * @returns Promise with the final workflow result
 */
export async function waitForWorkflowCompletion(
  runId: string,
  maxAttempts: number = 30,
  delayMs: number = 2000
): Promise<AnalyzeWebResponse> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const status = await getWorkflowStatus(runId);
    
    if (status.status === 'COMPLETED' || status.status === 'FAILED') {
      return status;
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error(`Workflow did not complete within ${maxAttempts * delayMs / 1000} seconds`);
}