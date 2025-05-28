import { NextRequest, NextResponse } from 'next/server';
import { listWebs, createWeb } from '@/lib/api/services/webs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'default';
    const webs = await listWebs(workspaceId);
    return NextResponse.json(webs);
  } catch (error) {
    console.error('Error fetching webs:', error);
    return NextResponse.json({ error: 'Failed to fetch webs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const web = await createWeb(body);
    return NextResponse.json(web, { status: 201 });
  } catch (error) {
    console.error('Error creating web:', error);
    return NextResponse.json({ error: 'Failed to create web' }, { status: 500 });
  }
}
