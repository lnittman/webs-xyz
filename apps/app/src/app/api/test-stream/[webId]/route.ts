import { NextRequest, NextResponse } from 'next/server';
import { websService } from '@repo/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ webId: string }> }
) {
  const { webId } = await params;
  
  try {
    const web = await websService.getWebById(webId);
    if (!web) {
      return NextResponse.json({ error: 'Web not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      id: web.id,
      status: web.status,
      title: web.title,
      emoji: web.emoji,
      description: web.description,
      topics: web.topics,
      runId: web.analysis?.runId,
      createdAt: web.createdAt,
      updatedAt: web.updatedAt,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 