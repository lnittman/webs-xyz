import { NextRequest } from 'next/server';
import { createFeedback, listFeedback } from '@/lib/api/services/feedback';
import { success, created, error as errorResponse } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');
    const feedback = await createFeedback({ ...body, userAgent, url: referer });
    return created({ id: feedback.id, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return errorResponse('Failed to submit feedback');
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
    return success({ ...result, hasMore: offset + limit < result.total });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return errorResponse('Failed to fetch feedback');
  }
}
