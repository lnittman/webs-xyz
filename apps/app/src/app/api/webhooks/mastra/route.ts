import { NextRequest, NextResponse } from 'next/server';
import { handleWorkflowCompletion } from '@/lib/api/services/webs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract workflow results
    const { workflowName, result, metadata } = body;
    
    if (workflowName === 'analyzeWeb' && metadata?.webId) {
      // Handle web analysis completion
      await handleWorkflowCompletion(metadata.webId, result);
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { error: 'Unknown workflow or missing metadata' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 