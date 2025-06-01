import { NextRequest } from 'next/server';
import { feedbackService, feedbackSchema } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { validateWith, validatePaginationParams } from '@repo/api/utils/validation';

async function handleGetFeedback(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { limit, offset } = validatePaginationParams(searchParams);
  
  const topic = searchParams.get('topic') as any;
  const status = searchParams.get('status') as any;
  
  const result = await feedbackService.listFeedback({
    topic,
    status,
    limit,
    offset,
  });
  
  return ApiResponse.success(result);
}

async function handleCreateFeedback(request: NextRequest) {
  const body = await request.json();
  const validatedData = await validateWith(feedbackSchema, body);
  
  const feedback = await feedbackService.createFeedback(validatedData);
  return ApiResponse.success(feedback, 201);
}

export const GET = withErrorHandling(handleGetFeedback);
export const POST = withErrorHandling(handleCreateFeedback);
