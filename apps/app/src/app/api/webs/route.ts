import { NextRequest } from 'next/server';
import { listWebs, createWeb, updateWeb } from '@/lib/api/services/webs';
import { analyzeWebAsync } from '@/lib/api/services/ai';
import { ApiResponse, withErrorHandling } from '@/lib/api/response';
import { withAuthenticatedUser } from '@/lib/api/auth';
import { createWebSchema } from '@/lib/api/schemas/web';
import { validateWith } from '@/lib/api/validation';

async function handleGetWebs(request: NextRequest, { userId }: { userId: string }) {
  const webs = await listWebs(userId);
  return ApiResponse.success(webs);
}

async function handleCreateWeb(request: NextRequest, { userId }: { userId: string }) {
  const body = await request.json();
  const validatedData = await validateWith(createWebSchema, { ...body, userId });
  
  const web = await createWeb(validatedData);
  
  // Start the analysis workflow asynchronously
  analyzeWebAsync({
    url: web.url,
    prompt: web.prompt || undefined,
  })
    .then(async (runId) => {
      console.log(`Started analysis workflow for ${web.url} with runId: ${runId}`);
      // Update the web status to PROCESSING
      await updateWeb(web.id, { status: 'PROCESSING' });
    })
    .catch((error) => {
      console.error(`Failed to start analysis for ${web.url}:`, error);
      // Update the web status to FAILED
      updateWeb(web.id, { status: 'FAILED' }).catch(console.error);
    });
  
  return ApiResponse.success(web, 201);
}

export const GET = withErrorHandling(withAuthenticatedUser(handleGetWebs));
export const POST = withErrorHandling(withAuthenticatedUser(handleCreateWeb));
