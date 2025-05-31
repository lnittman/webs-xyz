import { NextRequest, NextResponse } from 'next/server';
import { database } from '@repo/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Verify the web exists and get its run ID
  const web = await database.web.findUnique({
    where: { id },
    select: { id: true, status: true }
  });

  if (!web) {
    return new NextResponse('Web not found', { status: 404 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial status
      controller.enqueue(`data: ${JSON.stringify({
        type: 'status',
        status: web.status,
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Set up interval to check for updates
      const interval = setInterval(async () => {
        try {
          const updatedWeb = await database.web.findUnique({
            where: { id },
            select: { 
              id: true, 
              status: true, 
              title: true, 
              emoji: true, 
              description: true,
              updatedAt: true 
            }
          });

          if (updatedWeb) {
            controller.enqueue(`data: ${JSON.stringify({
              type: 'update',
              web: {
                id: updatedWeb.id,
                status: updatedWeb.status,
                title: updatedWeb.title,
                emoji: updatedWeb.emoji,
                description: updatedWeb.description,
                updatedAt: updatedWeb.updatedAt.toISOString(),
              },
              timestamp: new Date().toISOString()
            })}\n\n`);

            // Close stream if completed or failed
            if (updatedWeb.status === 'COMPLETE' || updatedWeb.status === 'FAILED') {
              controller.enqueue(`data: ${JSON.stringify({
                type: 'complete',
                status: updatedWeb.status,
                timestamp: new Date().toISOString()
              })}\n\n`);
              clearInterval(interval);
              controller.close();
            }
          }
        } catch (error) {
          console.error('Error in stream:', error);
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            error: 'Stream error',
            timestamp: new Date().toISOString()
          })}\n\n`);
          clearInterval(interval);
          controller.close();
        }
      }, 1000); // Check every second

      // Clean up on close
      return () => {
        clearInterval(interval);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
} 