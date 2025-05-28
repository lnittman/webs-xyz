import { NextRequest, NextResponse } from 'next/server';
import { createFeedback, listFeedback } from '@/lib/api/services/feedback';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');
    const feedback = await createFeedback({ ...body, userAgent, url: referer });
    return NextResponse.json(
      { success: true, id: feedback.id, message: 'Feedback submitted successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const result = await listFeedback({ topic, status, limit, offset });
    return NextResponse.json({ ...result, hasMore: offset + limit < result.total });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
