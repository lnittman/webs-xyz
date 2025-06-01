import { NextRequest } from 'next/server';
import { websService, createWebSchema } from '@repo/api';
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { validateWith } from '@repo/api/utils/validation';

async function handleGetWebs(request: NextRequest, { userId }: { userId: string }) {
  const webs = await websService.listWebs(userId);
  return ApiResponse.success(webs);
}

async function handleCreateWeb(request: NextRequest, { userId }: { userId: string }) {
  const body = await request.json();
  const validatedData = await validateWith(createWebSchema, { ...body, userId });
  
  // Create web and trigger analysis workflow
  const web = await websService.createWebAndAnalyze(validatedData);
  
  return ApiResponse.success(web, 201);
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetWebs));
export const POST = withErrorHandling(withAuthenticatedUser(handleCreateWeb));
