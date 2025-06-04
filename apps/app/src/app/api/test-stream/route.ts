import { NextRequest, NextResponse } from 'next/server';
import { websService, mastraWorkflowService } from '@repo/api';

// Test endpoint for streaming - DO NOT USE IN PRODUCTION
export async function POST(request: NextRequest) {
  try {
    const { url, prompt } = await request.json();
    
    // Create a test web
    const web = await websService.createWeb({
      userId: 'test-user-123',
      url,
      urls: [url],
      prompt: prompt || null,
    });
    
    // Trigger analysis workflow
    try {
      const runId = await mastraWorkflowService.triggerAnalyzeWeb({
        urls: web.urls,
        prompt: web.prompt,
        webId: web.id,
      });
      
      // Mark as processing
      await websService.markWebAsProcessing(web.id, runId);
    } catch (error) {
      console.error('Failed to trigger analysis workflow:', error);
      await websService.markWebAsFailed(web.id, error instanceof Error ? error.message : 'Unknown error');
    }
    
    return NextResponse.json({ 
      success: true, 
      webId: web.id,
      status: web.status,
      streamUrl: `/api/webs/${web.id}/stream`
    });
  } catch (error) {
    console.error('Test stream error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Test SSE endpoint without auth
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const webId = searchParams.get('webId');
  
  if (!webId) {
    return NextResponse.json({ error: 'webId required' }, { status: 400 });
  }
  
  const web = await websService.getWebById(webId);
  if (!web) {
    return NextResponse.json({ error: 'Web not found' }, { status: 404 });
  }
  
  // Only stream for processing webs
  if (web.status !== 'PROCESSING') {
    return NextResponse.json({ 
      error: 'Web is not processing',
      status: web.status 
    }, { status: 400 });
  }

  const runId = web.analysis?.runId;
  if (!runId) {
    return NextResponse.json({ error: 'No runId found' }, { status: 400 });
  }

  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isStreamActive = true;
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'connected',
        webId,
        runId,
        timestamp: new Date().toISOString()
      })}\n\n`));

      // Connect to Mastra workflow watch
      const mastraUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100';
      
      try {
        console.log(`[test-stream] Connecting to Mastra watch for runId: ${runId}`);
        
        const response = await fetch(`${mastraUrl}/api/workflows/analyzeWeb/watch?runId=${runId}`, {
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.log('[test-stream] Workflow run not found, checking if already complete');
            
            const currentWeb = await websService.getWebById(webId);
            if (currentWeb && currentWeb.status === 'COMPLETE') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'workflow-complete',
                message: 'Workflow already completed',
                web: currentWeb,
                timestamp: new Date().toISOString()
              })}\n\n`));
              controller.close();
              return;
            }
          }
          
          throw new Error(`Failed to connect: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (isStreamActive) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log(`[test-stream] Received Mastra event:`, data);
                
                // Forward the event
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                
                // Handle workflow completion
                if (data.type === 'watch' && data.payload?.workflowState?.status === 'success') {
                  isStreamActive = false;
                }
              } catch (error) {
                console.error('[test-stream] Error parsing event:', error);
              }
            }
          }
        }
        
        reader.releaseLock();
      } catch (error) {
        console.error('[test-stream] Error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
} 