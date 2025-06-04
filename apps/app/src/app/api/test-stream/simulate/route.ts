import { NextRequest, NextResponse } from 'next/server';

// Simulate the expected SSE events for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const delay = parseInt(searchParams.get('delay') || '1000');
  
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Helper to send event
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      // 1. Connection established
      sendEvent({
        type: 'connected',
        webId: 'test-web-123',
        runId: 'test-run-123',
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 2. Fetch URLs step starts
      sendEvent({
        type: 'step-progress',
        stepId: 'fetch-urls',
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay * 2));
      
      // 3. Fetch URLs completes
      sendEvent({
        type: 'step-progress',
        stepId: 'fetch-urls',
        status: 'completed',
        output: {
          urls: ['https://example.com'],
          fetchResults: [{
            url: 'https://example.com',
            success: true,
            content: 'Example content...'
          }]
        },
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 4. Quick metadata generation starts
      sendEvent({
        type: 'step-progress',
        stepId: 'generate-quick-metadata',
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 5. Quick metadata completes - THIS IS THE KEY EVENT
      sendEvent({
        type: 'step-progress',
        stepId: 'generate-quick-metadata',
        status: 'completed',
        output: {
          quickTitle: 'Example Domain',
          quickEmoji: '🌐',
          quickDescription: 'Analysis of example.com',
          suggestedTopics: ['web', 'example', 'domain']
        },
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 6. Detailed analysis starts
      sendEvent({
        type: 'step-progress',
        stepId: 'detailed-analysis',
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay * 3));
      
      // 7. Detailed analysis completes
      sendEvent({
        type: 'step-progress',
        stepId: 'detailed-analysis',
        status: 'completed',
        output: {
          urlAnalyses: [{
            url: 'https://example.com',
            title: 'Example Domain',
            topics: ['web', 'example', 'domain', 'test'],
            sentiment: 'neutral',
            insights: ['This is an example domain', 'Used for testing'],
            confidence: 0.95
          }]
        },
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 8. Enhanced combine starts
      sendEvent({
        type: 'step-progress',
        stepId: 'enhanced-combine',
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 9. Enhanced combine completes
      sendEvent({
        type: 'step-progress',
        stepId: 'enhanced-combine',
        status: 'completed',
        output: {
          topics: ['web', 'example', 'domain', 'test'],
          sentiment: 'neutral',
          insights: ['This is an example domain', 'Used for testing'],
          confidence: 0.95
        },
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 10. Final assembly starts
      sendEvent({
        type: 'step-progress',
        stepId: 'final-assembly',
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 11. Final assembly completes
      sendEvent({
        type: 'step-progress',
        stepId: 'final-assembly',
        status: 'completed',
        output: {
          title: 'Example Domain Analysis',
          emoji: '🌐',
          description: 'Comprehensive analysis of example.com',
          topics: ['web', 'example', 'domain', 'test'],
          sentiment: 'neutral',
          insights: ['This is an example domain', 'Used for testing'],
          confidence: 0.95
        },
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 12. Workflow status update
      sendEvent({
        type: 'workflow-status',
        status: 'success',
        steps: {
          'fetch-urls': { status: 'completed' },
          'generate-quick-metadata': { status: 'completed' },
          'detailed-analysis': { status: 'completed' },
          'enhanced-combine': { status: 'completed' },
          'final-assembly': { status: 'completed' }
        },
        timestamp: new Date().toISOString()
      });
      
      // 13. Workflow complete
      sendEvent({
        type: 'workflow-complete',
        timestamp: new Date().toISOString()
      });
      
      // Close the stream
      controller.close();
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