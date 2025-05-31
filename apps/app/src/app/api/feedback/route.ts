import { NextRequest } from 'next/server';

import { ApiResponse, withErrorHandling } from '@/lib/api/response';
import { feedbackSchema } from '@/lib/api/schemas/feedback';
import { validateWith, validatePaginationParams } from '@/lib/api/validation';
import { createFeedback, listFeedback } from '@/lib/api/services/feedback';

async function handleGetFeedback(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { limit, offset } = validatePaginationParams(searchParams);
  
  const topic = searchParams.get('topic') as any;
  const status = searchParams.get('status') as any;

  const result = await listFeedback({
    topic,
    status,
    limit,
    offset,
  });

  return ApiResponse.success(result);
}

async function handleCreateFeedback(request: NextRequest) {
  const body = await request.json();
  
  // Add user-agent and referer from headers
  const userAgent = request.headers.get('user-agent');
  const referer = request.headers.get('referer');
  
  const validatedData = await validateWith(feedbackSchema, {
    ...body,
    userAgent,
    url: referer,
  });
  
  const feedback = await createFeedback(validatedData);
  return ApiResponse.success(feedback, 201);
}

export const GET = withErrorHandling(handleGetFeedback);
export const POST = withErrorHandling(handleCreateFeedback);
