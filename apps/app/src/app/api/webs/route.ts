import { NextRequest } from 'next/server';
import { listWebs, createWeb, updateWeb } from '@/lib/api/services/webs';
import { analyzeWebAsync } from '@/lib/api/services/ai';
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
    
    return created(web);
  } catch (error) {
    console.error('Error creating web:', error);
    return errorResponse('Failed to create web');
  }
}
