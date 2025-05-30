import { database } from '@repo/database';
import { createWebInputSchema, updateWebInputSchema, Web } from '../schemas/web';
import { executeWorkflow } from '@/lib/mastra';

// Import Mastra client for workflow execution
async function triggerWebAnalysis(webId: string, urls: string[], prompt?: string) {
  try {
    const result = await executeWorkflow('analyzeWeb', {
      urls,
      prompt,
    }, {
      webId, // Pass webId as metadata for webhook handling
    });

    if (!result.runId) {
      throw new Error('Workflow execution failed: No runId returned');
    }

    console.log(`Started analysis workflow for web ${webId} with runId: ${result.runId}`);
    
    // Since we're using start-async, the workflow is now running in the background
    // The webhook will be called when it completes, or we can poll for status
    
    // For now, let's implement a simple polling mechanism
    pollForWorkflowCompletion(webId, result.runId);
    
  } catch (error) {
    console.error('Error triggering workflow:', error);
    // Mark web as failed if workflow trigger fails
    await database.web.update({
      where: { id: webId },
      data: { status: 'FAILED' },
    });
  }
}

// Poll for workflow completion
async function pollForWorkflowCompletion(webId: string, runId: string) {
  const maxAttempts = 60; // 2 minutes with 2 second intervals
  let attempts = 0;
  
  const pollInterval = setInterval(async () => {
    attempts++;
    
    try {
      // Get all runs for this workflow and find our specific run
      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100'}/api/workflows/analyzeWeb/runs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get workflow runs: ${response.statusText}`);
      }
      
      const runsData = await response.json();
      
      // Find our specific run
      const ourRun = runsData.runs?.find((run: any) => run.runId === runId);
      
      if (!ourRun) {
        console.error(`Run ${runId} not found in workflow runs`);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          await database.web.update({
            where: { id: webId },
            data: { status: 'FAILED' },
          });
        }
        return;
      }
      
      console.log(`Workflow ${runId} status:`, ourRun.snapshot?.status);
      
      // Check if workflow is done (either completed or failed)
      if (ourRun.snapshot?.status === 'done') {
        clearInterval(pollInterval);
        
        // Check the step status
        const analyzeWebStep = ourRun.snapshot?.context?.steps?.['analyze-web'];
        
        if (analyzeWebStep?.status === 'success' && analyzeWebStep?.output) {
          console.log('Workflow completed successfully, updating database');
          await handleWorkflowCompletion(webId, analyzeWebStep.output);
        } else {
          console.error('Workflow failed:', analyzeWebStep?.error);
          await database.web.update({
            where: { id: webId },
            data: { status: 'FAILED' },
          });
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        console.error('Workflow timed out');
        await database.web.update({
          where: { id: webId },
          data: { status: 'FAILED' },
        });
      }
    } catch (error) {
      console.error('Error polling workflow status:', error);
      attempts++; // Count errors as attempts
      
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        await database.web.update({
          where: { id: webId },
          data: { status: 'FAILED' },
        });
      }
    }
  }, 2000); // Poll every 2 seconds
}

export async function listWebs(workspaceId: string): Promise<Web[]> {
  const webs = await database.web.findMany({
    include: { 
      messages: true,
      entities: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return webs.map(w => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
    messages: w.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
    entities: w.entities?.map(e => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })) || [],
  }));
}

export async function getWebById(id: string): Promise<Web | null> {
  const web = await database.web.findUnique({
    where: { id },
    include: { 
      messages: true,
      entities: true,
    },
  });
  if (!web) return null;
  return {
    ...web,
    createdAt: web.createdAt.toISOString(),
    updatedAt: web.updatedAt.toISOString(),
    messages: web.messages.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
    entities: web.entities?.map(e => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })) || [],
  };
}

export async function createWeb(input: unknown): Promise<Web> {
  const data = createWebInputSchema.parse(input);
  
  // Use urls array if provided, otherwise fall back to single url
  const urls = data.urls || [data.url];
  const primaryUrl = urls[0];
  const domain = new URL(primaryUrl).hostname.replace('www.', '');
  
  const web = await database.web.create({
    data: {
      url: primaryUrl,
      urls,
      domain,
      prompt: data.prompt,
      status: 'PROCESSING', // Start in processing state
    },
    include: { 
      messages: true,
      entities: true,
    },
  });

  // Trigger the workflow asynchronously
  triggerWebAnalysis(web.id, urls, data.prompt);

  return {
    ...web,
    createdAt: web.createdAt.toISOString(),
    updatedAt: web.updatedAt.toISOString(),
    messages: [],
    entities: [],
  };
}

export async function updateWeb(id: string, input: unknown): Promise<Web | null> {
  const data = updateWebInputSchema.parse(input);

  // Prepare update data for Prisma
  let updateData: any = { ...data };
  
  // Handle messages updates
  if (data.messages) {
    updateData = {
      ...data,
      messages: {
        update: data.messages.map(msg => ({
          where: { id: msg.id },
          data: {
            type: msg.type,
            content: msg.content,
            createdAt: msg.createdAt,
          }
        }))
      }
    };
    delete updateData.messages;
  }

  // Handle entities updates
  if (data.entities) {
    updateData.entities = {
      deleteMany: {}, // Clear existing entities
      create: data.entities.map(entity => ({
        type: entity.type,
        value: entity.value,
      }))
    };
  }

  const web = await database.web.update({
    where: { id },
    data: updateData,
    include: { 
      messages: true,
      entities: true,
    },
  }) as any;

  return {
    ...web,
    createdAt: web.createdAt.toISOString(),
    updatedAt: web.updatedAt.toISOString(),
    messages: Array.isArray(web.messages)
      ? web.messages.map((m: any) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        }))
      : [],
    entities: Array.isArray(web.entities)
      ? web.entities.map((e: any) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
        }))
      : [],
  };
}

// New function to handle workflow completion
export async function handleWorkflowCompletion(webId: string, analysisResult: any) {
  try {
    // Update the web with analysis results
    await database.web.update({
      where: { id: webId },
      data: {
        status: 'COMPLETE',
        title: analysisResult.title,
        description: analysisResult.description,
        analysis: analysisResult,
        topics: analysisResult.topics,
        sentiment: analysisResult.sentiment,
        confidence: analysisResult.confidence,
        readingTime: analysisResult.readingTime,
        insights: analysisResult.insights,
        relatedUrls: analysisResult.relatedUrls,
        entities: {
          create: analysisResult.entities.map((entity: any) => ({
            type: entity.type,
            value: entity.value,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Error updating web with analysis results:', error);
    // Mark as failed
    await database.web.update({
      where: { id: webId },
      data: { status: 'FAILED' },
    });
  }
}
