import { NextRequest } from 'next/server';
import { getWebById, updateWeb } from '@/lib/api/services/webs';
import { success, error as errorResponse } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const web = await getWebById(id);
    if (!web) {
      return errorResponse('Web not found', 404);
    }
    return success(web);
  } catch (error) {
    console.error('Error fetching web:', error);
    return errorResponse('Failed to fetch web');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const web = await updateWeb(id, updates);
    return success(web);
  } catch (error) {
    console.error('Error updating web:', error);
    return errorResponse('Failed to update web');
  }
}
