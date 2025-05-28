import { NextRequest, NextResponse } from 'next/server';
import { getWebById, updateWeb } from '@/lib/api/services/webs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const web = await getWebById(id);
    if (!web) {
      return NextResponse.json({ error: 'Web not found' }, { status: 404 });
    }
    return NextResponse.json(web);
  } catch (error) {
    console.error('Error fetching web:', error);
    return NextResponse.json({ error: 'Failed to fetch web' }, { status: 500 });
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
    return NextResponse.json(web);
  } catch (error) {
    console.error('Error updating web:', error);
    return NextResponse.json({ error: 'Failed to update web' }, { status: 500 });
  }
}
