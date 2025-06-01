import 'server-only';
import { database } from '@repo/database';
import type { Prisma, WebStatus } from '@repo/database';
import { createWebInputSchema, updateWebInputSchema } from '../schemas/web';

// Types
export interface Web {
  id: string;
  userId: string;
  url: string;
  urls: string[];
  domain: string | null;
  title: string | null;
  description: string | null;
  prompt: string | null;
  status: WebStatus;
  analysis: any;
  topics: string[];
  sentiment: string | null;
  confidence: number | null;
  readingTime: number | null;
  insights: string[];
  relatedUrls: string[];
  emoji: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  entities?: WebEntity[];
}

export interface Message {
  id: string;
  webId: string | null;
  type: string;
  content: string;
  createdAt: string;
}

export interface WebEntity {
  id: string;
  webId: string;
  type: string;
  value: string;
  createdAt: string;
}

// Service class
export class WebsService {
  /**
   * List all webs for a user
   */
  async listWebs(userId: string): Promise<Web[]> {
    const webs = await database.web.findMany({
      where: { userId },
      include: { 
        messages: true,
        entities: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return webs.map(w => this.serializeWeb(w));
  }

  /**
   * Get a web by ID
   */
  async getWebById(id: string): Promise<Web | null> {
    const web = await database.web.findUnique({
      where: { id },
      include: { 
        messages: true,
        entities: true,
      },
    });
    
    if (!web) return null;
    return this.serializeWeb(web);
  }

  /**
   * Create a new web
   */
  async createWeb(input: unknown): Promise<Web> {
    const data = createWebInputSchema.parse(input);
    
    // Use urls array if provided, otherwise fall back to single url
    const urls = data.urls || (data.url ? [data.url] : []);
    if (urls.length === 0) {
      throw new Error('At least one URL is required');
    }
    
    const primaryUrl = urls[0];
    const domain = new URL(primaryUrl).hostname.replace('www.', '');
    
    const web = await database.web.create({
      data: {
        userId: data.userId,
        url: primaryUrl,
        urls,
        domain,
        prompt: data.prompt,
        status: 'PENDING', // Start in pending state
      },
      include: { 
        messages: true,
        entities: true,
      },
    });

    return this.serializeWeb(web);
  }

  /**
   * Update a web
   */
  async updateWeb(id: string, input: unknown): Promise<Web | null> {
    const data = updateWebInputSchema.parse(input);

    // Extract only the fields that can be directly updated
    const updateData: Prisma.WebUpdateInput = {
      url: data.url,
      urls: data.urls,
      domain: data.domain,
      title: data.title,
      description: data.description,
      prompt: data.prompt,
      status: data.status,
      analysis: data.analysis,
      topics: data.topics,
      sentiment: data.sentiment,
      confidence: data.confidence,
      readingTime: data.readingTime,
      insights: data.insights,
      relatedUrls: data.relatedUrls,
      emoji: data.emoji,
      updatedAt: new Date(),
    };

    const web = await database.web.update({
      where: { id },
      data: updateData,
      include: { 
        messages: true,
        entities: true,
      },
    });

    return this.serializeWeb(web);
  }

  /**
   * Update web with quick metadata (title, emoji, description)
   */
  async updateWebWithQuickMetadata(
    webId: string, 
    quickData: { 
      title?: string; 
      emoji?: string; 
      description?: string;
      topics?: string[];
    }
  ): Promise<Web> {
    const web = await database.web.update({
      where: { id: webId },
      data: {
        title: quickData.title,
        emoji: quickData.emoji,
        description: quickData.description,
        topics: quickData.topics,
        // Keep status as PROCESSING since analysis isn't complete
      },
      include: {
        messages: true,
        entities: true,
      },
    });
    
    return this.serializeWeb(web);
  }

  /**
   * Update web with complete analysis results
   */
  async updateWebWithAnalysis(webId: string, analysisResult: any): Promise<Web> {
    // Get web for notification
    const web = await this.getWebById(webId);
    
    const updated = await database.web.update({
      where: { id: webId },
      data: {
        status: 'COMPLETE',
        title: analysisResult.title || analysisResult.quickTitle,
        emoji: analysisResult.emoji || analysisResult.quickEmoji,
        description: analysisResult.description || analysisResult.quickDescription,
        topics: analysisResult.topics,
        sentiment: analysisResult.sentiment,
        confidence: analysisResult.confidence,
        readingTime: analysisResult.readingTime,
        insights: analysisResult.insights,
        relatedUrls: analysisResult.relatedUrls,
        analysis: analysisResult,
        entities: analysisResult.entities ? {
          deleteMany: {},
          create: analysisResult.entities.map((entity: any) => ({
            type: entity.type,
            value: entity.value,
          })),
        } : undefined,
      },
      include: {
        messages: true,
        entities: true,
      },
    });
    
    return this.serializeWeb(updated);
  }

  /**
   * Mark a web as processing with runId
   */
  async markWebAsProcessing(webId: string, runId: string): Promise<Web> {
    const web = await database.web.update({
      where: { id: webId },
      data: { 
        status: 'PROCESSING',
        // Store runId in analysis field temporarily for tracking
        analysis: { runId }
      },
      include: {
        messages: true,
        entities: true,
      },
    });
    
    return this.serializeWeb(web);
  }

  /**
   * Mark a web as failed
   */
  async markWebAsFailed(webId: string, error?: string): Promise<Web> {
    // Get web for notification
    const web = await this.getWebById(webId);
    
    const updated = await database.web.update({
      where: { id: webId },
      data: { status: 'FAILED' },
      include: {
        messages: true,
        entities: true,
      },
    });
    
    return this.serializeWeb(updated);
  }

  /**
   * Delete a web
   */
  async deleteWeb(webId: string): Promise<void> {
    await database.web.delete({
      where: { id: webId },
    });
  }

  /**
   * Update web emoji
   */
  async updateWebEmoji(webId: string, emoji: string): Promise<Web> {
    const web = await database.web.update({
      where: { id: webId },
      data: { emoji },
      include: {
        messages: true,
        entities: true,
      },
    });
    
    return this.serializeWeb(web);
  }

  /**
   * Serialize web with proper date formatting
   */
  private serializeWeb(web: any): Web {
    return {
      ...web,
      createdAt: web.createdAt.toISOString(),
      updatedAt: web.updatedAt.toISOString(),
      messages: web.messages?.map((m: any) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })) || [],
      entities: web.entities?.map((e: any) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })) || [],
    };
  }

  /**
   * Create a web and trigger analysis workflow
   */
  async createWebAndAnalyze(input: unknown): Promise<Web> {
    // Create the web first
    const web = await this.createWeb(input);
    
    // Trigger analysis workflow
    try {
      const runId = await this.triggerAnalysisWorkflow({
        urls: web.urls,
        prompt: web.prompt,
        webId: web.id,
      });
      // Mark as processing with runId
      await this.markWebAsProcessing(web.id, runId);
    } catch (error) {
      console.error('Failed to trigger analysis workflow:', error);
      await this.markWebAsFailed(web.id, error instanceof Error ? error.message : 'Unknown error');
    }
    
    return web;
  }

  /**
   * Trigger analysis workflow for an existing web
   */
  async analyzeWebAsync(webData: { url: string; prompt?: string; webId?: string }): Promise<string> {
    const web = webData.webId ? await this.getWebById(webData.webId) : null;
    if (!web && webData.webId) {
      throw new Error('Web not found');
    }
    
    const analysisData = {
      urls: [webData.url],
      prompt: webData.prompt,
      webId: webData.webId,
    };
    
    return this.triggerAnalysisWorkflow(analysisData);
  }

  /**
   * Trigger the Mastra workflow for web analysis
   */
  private async triggerAnalysisWorkflow(data: any): Promise<string> {
    const mastraUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:2100';
    
    try {
      console.log(`[triggerAnalysisWorkflow] Creating run for workflow: analyzeWeb`);
      
      // First, create a run
      const createRunResponse = await fetch(`${mastraUrl}/api/workflows/analyzeWeb/createRun`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!createRunResponse.ok) {
        const error = await createRunResponse.text();
        console.error(`[triggerAnalysisWorkflow] Failed to create run:`, error);
        throw new Error(`Failed to create workflow run: ${createRunResponse.statusText}`);
      }

      const createRunResult = await createRunResponse.json();
      const { runId } = createRunResult;
      console.log(`[triggerAnalysisWorkflow] Created run with ID: ${runId}`);

      // Get the app URL for webhook
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:2102';
      const webhookUrl = `${appUrl}/api/webhooks/mastra`;
      console.log(`[triggerAnalysisWorkflow] Using webhook URL: ${webhookUrl}`);

      // Then start the workflow asynchronously
      console.log(`[triggerAnalysisWorkflow] Starting workflow with runId: ${runId}`);
      const startResponse = await fetch(`${mastraUrl}/api/workflows/analyzeWeb/start-async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          runId,
          triggerData: data,
          metadata: {
            webId: data.webId,
          },
          webhook: {
            url: webhookUrl,
            method: 'POST',
          },
        }),
      });

      if (!startResponse.ok) {
        const error = await startResponse.text();
        console.error(`[triggerAnalysisWorkflow] Failed to start workflow:`, error);
        throw new Error(`Failed to start workflow: ${startResponse.statusText}`);
      }

      const result = await startResponse.json();
      console.log(`[triggerAnalysisWorkflow] Workflow started, result:`, result);
      
      return runId;
    } catch (error) {
      console.error('Failed to trigger analysis workflow:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const websService = new WebsService(); 