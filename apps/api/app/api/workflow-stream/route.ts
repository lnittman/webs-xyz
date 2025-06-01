import { NextRequest } from 'next/server';
import { createDataStreamResponse } from 'ai';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get('workflowId');

  if (!workflowId) {
    return new Response('Workflow ID is required', { status: 400 });
  }

  return createDataStreamResponse({
    async execute(dataStream) {
      try {
        // Connect to Mastra workflow stream
        const mastraUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100';
        const response = await fetch(`${mastraUrl}/api/workflows/${workflowId}/watch?runId=${runId}`, {
          headers: {
            'Accept': 'text/event-stream',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to connect to workflow stream: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                // Convert Mastra workflow events to AI SDK data stream format
                if (data.type === 'step-start') {
                  // Write step start marker
                  dataStream.writeData({
                    type: 'workflow-step',
                    step: data.stepId,
                    status: 'started',
                    timestamp: new Date().toISOString(),
                  });
                  
                  // Write a message annotation for UI updates
                  dataStream.writeMessageAnnotation({
                    stepId: data.stepId,
                    status: 'executing',
                  });
                }
                
                if (data.type === 'step-complete') {
                  // Write step completion with result
                  dataStream.writeData({
                    type: 'workflow-step',
                    step: data.stepId,
                    status: 'completed',
                    result: data.result,
                    timestamp: new Date().toISOString(),
                  });
                  
                  // If this is the quick metadata step, write special annotation
                  if (data.stepId === 'generate-quick-metadata' && data.result) {
                    dataStream.writeMessageAnnotation({
                      quickMetadata: {
                        title: data.result.quickTitle,
                        emoji: data.result.quickEmoji,
                        description: data.result.quickDescription,
                      },
                    });
                  }
                }
                
                if (data.type === 'workflow-complete') {
                  // Write final result
                  dataStream.writeData({
                    type: 'workflow-complete',
                    result: data.result,
                    timestamp: new Date().toISOString(),
                  });
                }
                
                if (data.type === 'error') {
                  dataStream.writeData({
                    type: 'workflow-error',
                    error: data.error,
                    timestamp: new Date().toISOString(),
                  });
                }
              } catch (error) {
                console.error('Error parsing workflow event:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Workflow stream error:', error);
        dataStream.writeData({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    onError: (error) => {
      // Return error message for client
      return error instanceof Error ? error.message : 'Stream error';
    },
    headers: {
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
} 