import { NextRequest } from 'next/server';
import { database } from '@repo/database';
import { analyzeWebAsync } from '@/lib/api/services/ai';
import { updateWeb } from '@/lib/api/services/webs';
import { ApiResponse, withErrorHandling } from '@/lib/api/response';
import { withAuthenticatedUser } from '@/lib/api/auth';
import { webIdParamSchema } from '@/lib/api/schemas/web';
import { validateWith } from '@/lib/api/validation';
import { ApiError } from '@/lib/api/error';
import { ResourceType } from '@/lib/api/constants';

type RouteParams = { id: string };

async function handleRetryWeb(
  request: NextRequest,
  { params, userId }: { params: RouteParams; userId: string }
) {
  // Validate the ID parameter
  const { id } = await validateWith(webIdParamSchema, params);
  
  // Get the web to retry
  const web = await database.web.findUnique({
    where: { id },
  });

  if (!web) {
    throw ApiError.notFound(ResourceType.WEB, id);
  }

  // Check if the web belongs to the authenticated user
  if (web.userId !== userId) {
    throw ApiError.unauthorized('You do not have permission to retry this web analysis');
  }

  // Reset status to PROCESSING
  await updateWeb(id, { status: 'PROCESSING' });

  // Retry the analysis
  analyzeWebAsync({
    url: web.url,
    prompt: web.prompt || undefined,
  })
    .then(async (runId) => {
      console.log(`Retrying analysis workflow for ${web.url} with runId: ${runId}`);
    })
    .catch((error) => {
      console.error(`Failed to retry analysis for ${web.url}:`, error);
      updateWeb(id, { status: 'FAILED' }).catch(console.error);
    });

  return ApiResponse.success({ message: 'Analysis retry started' });
}

export const POST = withErrorHandling(withAuthenticatedUser(handleRetryWeb)); 