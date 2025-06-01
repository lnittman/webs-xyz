import { NextRequest } from 'next/server';
import { streamText, createDataStreamResponse, tool } from 'ai';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { database } from '@repo/database';
import { auth } from '@repo/auth/server';
import { z } from 'zod';

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id: webId } = await params;
  
  // Verify the web exists and belongs to the user
  const web = await database.web.findFirst({
    where: { 
      id: webId,
      userId,
    },
    include: {
      entities: true,
    },
  });

  if (!web) {
    return new Response('Web not found', { status: 404 });
  }

  const { messages } = await request.json();

  // Create tools with closure over request context
  const tools = {
    addUrlToWeb: tool({
      description: 'Add a new URL to the current web analysis',
      parameters: z.object({
        url: z.string().url().describe('The URL to add to the web'),
        reason: z.string().optional().describe('Why this URL is relevant'),
      }),
      execute: async ({ url, reason }) => {
        const updatedUrls = [...web.urls, url];
        await database.web.update({
          where: { id: webId },
          data: { 
            urls: updatedUrls,
            relatedUrls: {
              push: url,
            },
          },
        });
        
        return { 
          success: true, 
          url, 
          reason: reason || 'Added by user request',
          updatedUrlCount: updatedUrls.length,
        };
      },
    }),
    
    updateWebEmoji: tool({
      description: 'Update the emoji for the current web',
      parameters: z.object({
        emoji: z.string().describe('A single emoji character'),
      }),
      execute: async ({ emoji }) => {
        await database.web.update({
          where: { id: webId },
          data: { emoji },
        });
        
        return { success: true, emoji, webId };
      },
    }),
    
    searchRelatedWebs: tool({
      description: 'Search for other webs related to current topics',
      parameters: z.object({
        query: z.string().describe('Search query based on topics or entities'),
        limit: z.number().optional().default(5),
      }),
      execute: async ({ query, limit }) => {
        const relatedWebs = await database.web.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { topics: { hasSome: query.split(' ') } },
            ],
            NOT: { id: webId },
          },
          take: limit || 5,
          select: {
            id: true,
            title: true,
            url: true,
            emoji: true,
            topics: true,
            createdAt: true,
          },
        });
        
        return {
          query,
          count: relatedWebs.length,
          webs: relatedWebs.map(w => ({
            ...w,
            createdAt: w.createdAt.toISOString(),
          })),
        };
      },
    }),
    
    getDetailedInsight: tool({
      description: 'Get more detailed information about a specific aspect of the web analysis',
      parameters: z.object({
        aspect: z.enum(['topics', 'entities', 'sentiment', 'connections']),
        filter: z.string().optional(),
      }),
      execute: async ({ aspect, filter }) => {
        let detailedInfo: any = {};
        
        switch (aspect) {
          case 'topics':
            detailedInfo = {
              allTopics: web.topics,
              count: web.topics?.length || 0,
              filtered: filter 
                ? web.topics?.filter(t => t.toLowerCase().includes(filter.toLowerCase()))
                : web.topics,
            };
            break;
          case 'entities':
            detailedInfo = {
              allEntities: web.entities,
              byType: web.entities?.reduce((acc, e) => {
                if (!acc[e.type]) acc[e.type] = [];
                acc[e.type].push(e.value);
                return acc;
              }, {} as Record<string, string[]>),
              filtered: filter
                ? web.entities?.filter(e => 
                    e.value.toLowerCase().includes(filter.toLowerCase()) ||
                    e.type.toLowerCase().includes(filter.toLowerCase())
                  )
                : web.entities,
            };
            break;
          case 'sentiment':
            detailedInfo = {
              overall: web.sentiment,
              confidence: web.confidence,
              insights: web.insights?.filter(i => 
                i.toLowerCase().includes('sentiment') || 
                i.toLowerCase().includes('positive') ||
                i.toLowerCase().includes('negative') ||
                i.toLowerCase().includes('neutral')
              ),
            };
            break;
          case 'connections':
            detailedInfo = {
              relatedUrls: web.relatedUrls,
              urlCount: web.urls.length,
              analysis: web.analysis,
            };
            break;
        }
        
        return {
          aspect,
          filter,
          details: detailedInfo,
        };
      },
    }),
  };

  // Create a system prompt with web context
  const systemPrompt = `You are an AI assistant helping to explore and understand web content analysis.

Current Web Context:
- Title: ${web.title || 'Untitled'}
- URL(s): ${web.urls.join(', ')}
- Topics: ${web.topics?.join(', ') || 'None identified'}
- Sentiment: ${web.sentiment || 'Not analyzed'}
- Confidence: ${web.confidence ? `${Math.round(web.confidence * 100)}%` : 'Unknown'}

${web.description ? `Summary: ${web.description}` : ''}
${web.insights?.length ? `Key Insights:\n${web.insights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}` : ''}
${web.entities?.length ? `\nEntities Found:\n${web.entities.map(e => `- ${e.type}: ${e.value}`).join('\n')}` : ''}

You can use tools to:
- Add related URLs to expand the analysis
- Update the web's emoji
- Search for related webs
- Get detailed insights about specific aspects

Be helpful, conversational, and proactive in suggesting ways to explore the content further.`;

  return createDataStreamResponse({
    async execute(dataStream) {
      const result = streamText({
        model: openRouter('openai/gpt-4'),
        system: systemPrompt,
        messages,
        tools,
        maxSteps: 5,
        toolChoice: 'auto',
        onChunk: ({ chunk }) => {
          // Track streaming progress
          if (chunk.type === 'text-delta') {
            dataStream.writeMessageAnnotation({
              streaming: true,
              chunkType: chunk.type,
            });
          }
          if (chunk.type === 'tool-call-streaming-start') {
            dataStream.writeMessageAnnotation({
              toolCallStart: true,
              toolName: chunk.toolName,
            });
          }
        },
        onFinish: ({ text, toolCalls, toolResults, finishReason }) => {
          // Write completion annotation
          dataStream.writeMessageAnnotation({
            finishReason,
            toolCallCount: toolCalls?.length || 0,
            hasToolResults: !!toolResults?.length,
          });
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      return error instanceof Error ? error.message : 'Chat error';
    },
  });
} 