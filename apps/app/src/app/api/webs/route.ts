import { NextRequest } from 'next/server';
import { listWebs, createWeb } from '@/lib/api/services/webs';
import { success, created, error as errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'default';
    const webs = await listWebs(workspaceId);
    return success(webs);
  } catch (error) {
    console.error('Error fetching webs:', error);
    return errorResponse('Failed to fetch webs');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const web = await createWeb(body);
    return created(web);
  } catch (error) {
    console.error('Error creating web:', error);
    return errorResponse('Failed to create web');
  }
}
