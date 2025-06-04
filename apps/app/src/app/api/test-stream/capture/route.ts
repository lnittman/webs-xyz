import { NextRequest, NextResponse } from 'next/server';
import { websService, mastraWorkflowService } from '@repo/api';

// Capture all SSE events from workflow
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
    let runId: string | undefined;
    try {
      runId = await mastraWorkflowService.triggerAnalyzeWeb({
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
    
    console.log(`[capture] Created web ${web.id} with status ${web.status}`);
    
    // Immediately connect to the SSE stream
    const events: any[] = [];
    const startTime = Date.now();
    
    if (runId) {
      const mastraUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100';
      
      try {
        console.log(`[capture] Connecting to Mastra watch for runId: ${runId}`);
        
        const response = await fetch(`${mastraUrl}/api/workflows/analyzeWeb/watch?runId=${runId}`, {
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          console.log(`[capture] Mastra watch returned ${response.status}: ${response.statusText}`);
          
          if (response.status === 404) {
            // Check if workflow already completed
            const currentWeb = await websService.getWebById(web.id);
            events.push({
              type: 'workflow-already-complete',
              timestamp: new Date().toISOString(),
              web: currentWeb,
            });
          }
        } else {
          const reader = response.body?.getReader();
          if (reader) {
            const decoder = new TextDecoder();
            let buffer = '';
            let done = false;

            while (!done) {
              const { done: readerDone, value } = await reader.read();
              done = readerDone;
              
              if (value) {
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      console.log(`[capture] Received event:`, JSON.stringify(data));
                      events.push({
                        ...data,
                        capturedAt: new Date().toISOString(),
                        elapsedMs: Date.now() - startTime,
                      });
                      
                      // Stop if workflow completed
                      if (data.type === 'watch' && 
                          (data.payload?.workflowState?.status === 'success' || 
                           data.payload?.workflowState?.status === 'completed')) {
                        done = true;
                        break;
                      }
                    } catch (error) {
                      console.error('[capture] Error parsing event:', error);
                    }
                  }
                }
              }
            }
            
            reader.releaseLock();
          }
        }
      } catch (error) {
        console.error('[capture] Error connecting to Mastra:', error);
        events.push({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // Get final web status
    const finalWeb = await websService.getWebById(web.id);
    
    return NextResponse.json({
      success: true,
      webId: web.id,
      initialStatus: web.status,
      finalStatus: finalWeb?.status,
      runId: runId,
      totalEvents: events.length,
      durationMs: Date.now() - startTime,
      events,
      finalWeb: finalWeb ? {
        id: finalWeb.id,
        status: finalWeb.status,
        title: finalWeb.title,
        emoji: finalWeb.emoji,
        description: finalWeb.description,
        topics: finalWeb.topics,
        insights: finalWeb.insights,
      } : null,
    });
  } catch (error) {
    console.error('[capture] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 