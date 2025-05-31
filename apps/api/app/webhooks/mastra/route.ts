import { log } from '@repo/observability/log';
import { NextResponse } from 'next/server';
import { updateWebWithAnalysis, markWebAsFailed, getWebById } from '../../../lib/services';
import { 
  sendWebAnalysisCompleteNotification, 
  sendWebAnalysisFailedNotification 
} from '@repo/notifications/server';

/**
 * Handle workflow completion updates from Mastra
 */
const handleAnalyzeWebCompletion = async (webId: string, userId: string, analysisResult: any) => {
  try {
    // Update the web with analysis results
    const updatedWeb = await updateWebWithAnalysis(webId, analysisResult);

    log.info('Web analysis completed', { webId, userId, title: analysisResult.title });

    // Send completion notification
    try {
      await sendWebAnalysisCompleteNotification(userId, {
        id: updatedWeb.id,
        title: updatedWeb.title || '',
        url: updatedWeb.url,
        status: updatedWeb.status,
        analysis: updatedWeb.analysis,
      });
    } catch (notificationError) {
      log.error('Failed to send completion notification', { error: notificationError, webId, userId });
      // Don't throw - notification failure shouldn't break the main flow
    }
    
  } catch (error) {
    log.error('Error updating web with analysis results:', { error, webId, userId });
    
    // Mark as failed
    await markWebAsFailed(webId);
    
    // Send failure notification
    try {
      await sendWebAnalysisFailedNotification(userId, {
        id: webId,
        url: '', // We'll need to get this from the web record
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch (notificationError) {
      log.error('Failed to send failure notification', { error: notificationError, webId, userId });
      // Don't throw - notification failure shouldn't break the main flow
    }
    
    throw error;
  }
};

export const POST = async (request: Request): Promise<Response> => {
  try {
    const body = await request.json();
    
    // Extract workflow results
    const { workflowName, result, metadata } = body;
    
    log.info('Mastra webhook received', { workflowName, metadata });
    
    // Handle different workflow types
    switch (workflowName) {
      case 'analyzeWeb': {
        if (!metadata?.webId) {
          return NextResponse.json(
            { error: 'Missing webId in metadata' },
            { status: 400 }
          );
        }

        if (!metadata?.userId) {
          return NextResponse.json(
            { error: 'Missing userId in metadata' },
            { status: 400 }
          );
        }
        
        await handleAnalyzeWebCompletion(metadata.webId, metadata.userId, result);
        
        return NextResponse.json({ 
          success: true,
          message: 'Web analysis completed successfully' 
        });
      }
      
      default: {
        log.warn('Unknown workflow received', { workflowName });
        return NextResponse.json(
          { error: 'Unknown workflow type' },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    log.error('Mastra webhook error:', { error });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}; 