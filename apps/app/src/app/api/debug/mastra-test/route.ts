import { NextRequest } from 'next/server';
import { ApiResponse } from '@repo/api/utils/response';

export async function GET(request: NextRequest) {
  const mastraUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2102';
  
  try {
    // Test if we can reach Mastra
    const mastraHealthResponse = await fetch(`${mastraUrl}/api/health`).catch(() => null);
    
    // Test if Mastra can reach us (simulate a webhook)
    const testWebhookResponse = await fetch(`${mastraUrl}/api/workflows/test-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookUrl: `${appUrl}/api/webhooks/mastra`,
        testPayload: {
          workflowName: 'test',
          runId: 'test-run-id',
          status: 'completed',
        }
      }),
    }).catch(() => null);
    
    return ApiResponse.success({
      mastraUrl,
      appUrl,
      mastraReachable: mastraHealthResponse?.ok || false,
      webhookTestResponse: testWebhookResponse?.ok || false,
      env: {
        NEXT_PUBLIC_AI_URL: process.env.NEXT_PUBLIC_AI_URL || 'not set',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'not set',
      }
    });
  } catch (error) {
    return ApiResponse.success({
      error: error instanceof Error ? error.message : 'Unknown error',
      mastraUrl,
      appUrl,
    });
  }
} 