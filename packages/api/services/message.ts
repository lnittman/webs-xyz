import 'server-only';
import { database } from '@repo/database';
import { z } from 'zod';
import type { MessageType } from '@repo/database';

// Types
export interface Message {
  id: string;
  webId: string | null;
  type: MessageType;
  content: string;
  createdAt: string;
}

// Input schemas
export const createMessageSchema = z.object({
  webId: z.string().nullable().optional(),
  type: z.enum(['TEXT', 'TOOL', 'SYSTEM', 'AI']).default('TEXT'),
  content: z.string(),
});

export const createMessagesSchema = z.array(z.object({
  id: z.string(),
  webId: z.string().nullable().optional(),
  type: z.enum(['TEXT', 'TOOL', 'SYSTEM', 'AI']).default('TEXT'),
  content: z.string(),
  createdAt: z.date().or(z.string()).optional(),
}));

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type CreateMessagesInput = z.infer<typeof createMessagesSchema>;

// Service class
export class MessageService {
  /**
   * Load all messages for a specific web
   */
  async getMessagesByWebId(webId: string, userId: string): Promise<Message[]> {
    const messages = await database.message.findMany({
      where: {
        webId,
        web: {
          userId, // Ensure the web belongs to the user
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages.map(msg => this.serializeMessage(msg));
  }

  /**
   * Create a single message
   */
  async createMessage(input: CreateMessageInput): Promise<Message> {
    const data = createMessageSchema.parse(input);
    
    const message = await database.message.create({
      data: {
        webId: data.webId,
        type: data.type,
        content: data.content,
      },
    });

    return this.serializeMessage(message);
  }

  /**
   * Save multiple messages for a web (replaces existing messages)
   */
  async saveMessagesForWeb(webId: string, messages: CreateMessagesInput): Promise<Message[]> {
    const validatedMessages = createMessagesSchema.parse(messages);

    // Use a transaction to ensure consistency
    const result = await database.$transaction(async (tx) => {
      // Delete existing messages for this web
      await tx.message.deleteMany({
        where: { webId },
      });

      // Insert all new messages
      const createdMessages = await tx.message.createMany({
        data: validatedMessages.map(msg => ({
          id: msg.id,
          webId,
          type: msg.type,
          content: msg.content,
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        })),
      });

      // Return the created messages
      return await tx.message.findMany({
        where: { webId },
        orderBy: { createdAt: 'asc' },
      });
    });

    return result.map(msg => this.serializeMessage(msg));
  }

  /**
   * Add a single message to a web (append)
   */
  async addMessageToWeb(webId: string, input: CreateMessageInput): Promise<Message> {
    const data = createMessageSchema.parse(input);
    
    const message = await database.message.create({
      data: {
        webId,
        type: data.type,
        content: data.content,
      },
    });

    return this.serializeMessage(message);
  }

  /**
   * Delete all messages for a web
   */
  async deleteMessagesForWeb(webId: string): Promise<void> {
    await database.message.deleteMany({
      where: { webId },
    });
  }

  /**
   * Get message count for a web
   */
  async getMessageCountForWeb(webId: string): Promise<number> {
    return await database.message.count({
      where: { webId },
    });
  }

  /**
   * Convert AI SDK Message format to our Message format
   */
  aiSdkToMessage(aiMsg: any, webId: string): CreateMessageInput {
    return {
      webId,
      type: aiMsg.role === 'assistant' ? 'AI' : 'TEXT',
      content: aiMsg.content,
    };
  }

  /**
   * Convert our Message format to AI SDK Message format
   */
  messageToAiSdk(msg: Message): any {
    return {
      id: msg.id,
      role: msg.type === 'AI' ? 'assistant' : 'user',
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    };
  }

  /**
   * Serialize message with proper date formatting
   */
  private serializeMessage(message: any): Message {
    return {
      ...message,
      createdAt: message.createdAt.toISOString(),
    };
  }
}

// Export singleton instance
export const messageService = new MessageService(); 