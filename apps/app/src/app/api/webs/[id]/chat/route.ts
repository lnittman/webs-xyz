import { NextRequest } from 'next/server';
import { Message, streamText, generateId } from 'ai';
import { messageService } from '@repo/api';
import { withAuthenticatedUser } from '@repo/api/utils/auth';
import { ApiResponse, withErrorHandling } from '@repo/api/utils/response';
import { ApiError } from '@repo/api/utils/error';
import { ErrorType } from '@repo/api/constants/error';
import { websService } from '@repo/api';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const GET = withErrorHandling(
  withAuthenticatedUser(async (
    request: NextRequest,
    { params, userId }: { params: Promise<{ id: string }>; userId: string }
  ) => {
    const { id: webId } = await params;
    
    // Verify the web exists and belongs to the user using the service
    const web = await websService.getWebById(webId);
    
    if (!web || web.userId !== userId) {
      throw new ApiError(ErrorType.NOT_FOUND, 'Web not found');
    }

    // Load messages using the service
    const messages = await messageService.getMessagesByWebId(webId, userId);
    
    // Convert to AI SDK format
    const aiSdkMessages = messages.map(msg => messageService.messageToAiSdk(msg));
    
    return ApiResponse.success(aiSdkMessages);
  })
);

export const POST = withErrorHandling(
  withAuthenticatedUser(async (
    request: NextRequest,
    { params, userId }: { params: Promise<{ id: string }>; userId: string }
  ) => {
    const { id: webId } = await params;
    
    // Verify the web exists and belongs to the user using the service
    const web = await websService.getWebById(webId);
    
    if (!web || web.userId !== userId) {
      throw new ApiError(ErrorType.NOT_FOUND, 'Web not found');
    }

    const { messages } = await request.json();

    // Add web context as system message
    const webContext = `Current Web Analysis Context:
- Web ID: ${webId}
- Title: ${web.title || 'Untitled'}
- URL(s): ${web.urls.join(', ')}
- Topics: ${web.topics?.join(', ') || 'None identified'}
- Sentiment: ${web.sentiment || 'Not analyzed'}
- Confidence: ${web.confidence ? `${Math.round(web.confidence * 100)}%` : 'Unknown'}

${web.description ? `Summary: ${web.description}` : ''}
${web.insights?.length ? `Key Insights:\n${web.insights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}` : ''}
${web.entities?.length ? `\nEntities Found:\n${web.entities.map(e => `- ${e.type}: ${e.value}`).join('\n')}` : ''}

You are an AI assistant helping users understand this web analysis. You can help them explore the content, find insights, and answer questions about the analyzed web pages.

When users ask for actions like finding related webs or adding URLs, explain that those are features available in the interface but focus on helping them understand and explore the current analysis.`;

    // Convert to AI SDK format and add context
    const aiSdkMessages = [
      { role: 'system', content: webContext },
      ...messages
    ];

    try {
      // Save only user messages (not system messages) individually
      for (const message of messages) {
        if (message.role === 'user') {
          await messageService.addMessageToWeb(webId, {
            type: 'TEXT',
            content: message.content,
          });
        }
      }

      // Use AI SDK's streamText with OpenRouter
      const result = await streamText({
        model: openRouter('openai/gpt-4o'),
        messages: aiSdkMessages,
        temperature: 0.7,
        maxTokens: 1500,
        onFinish: async (finishResult) => {
          // Save the assistant's response to database
          await messageService.addMessageToWeb(webId, {
            type: 'AI',
            content: finishResult.text,
          });
        },
      });

      // Return AI SDK compatible stream response
      return result.toDataStreamResponse();

    } catch (error) {
      console.error('[Chat] Error generating response:', error);
      throw new ApiError(ErrorType.SERVER_ERROR, 'Failed to process chat request');
    }
  })
); 