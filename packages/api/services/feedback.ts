import 'server-only';
import { database } from '@repo/database';
import { z } from 'zod';
import type { FeedbackTopic, FeedbackStatus } from '@repo/database';

// Types
export interface Feedback {
  id: string;
  topic: FeedbackTopic;
  message: string;
  userAgent: string | null;
  url: string | null;
  userId: string | null;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

// Input schema
export const feedbackSchema = z.object({
  topic: z.enum(['BUG', 'FEATURE', 'UI', 'PERFORMANCE', 'GENERAL']),
  message: z.string().min(1).max(5000),
  userAgent: z.string().optional(),
  url: z.string().url().optional(),
  userId: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

// Service class
export class FeedbackService {
  /**
   * Create new feedback
   */
  async createFeedback(input: unknown): Promise<Feedback> {
    const data = feedbackSchema.parse(input);
    const feedback = await database.feedback.create({
      data: {
        ...data,
        status: data.status ?? 'OPEN',
      },
    });
    
    return this.serializeFeedback(feedback);
  }

  /**
   * List feedback with filtering
   */
  async listFeedback(params: {
    topic?: FeedbackTopic;
    status?: FeedbackStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ feedback: Feedback[]; total: number }> {
    const { topic, status, limit = 50, offset = 0 } = params;
    
    const [feedback, total] = await Promise.all([
      database.feedback.findMany({
        where: {
          ...(topic ? { topic } : {}),
          ...(status ? { status } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      database.feedback.count({
        where: {
          ...(topic ? { topic } : {}),
          ...(status ? { status } : {}),
        },
      }),
    ]);
    
    return {
      feedback: feedback.map(f => this.serializeFeedback(f)),
      total,
    };
  }

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<Feedback> {
    const feedback = await database.feedback.update({
      where: { id },
      data: { status },
    });
    
    return this.serializeFeedback(feedback);
  }

  /**
   * Serialize feedback with proper date formatting
   */
  private serializeFeedback(feedback: any): Feedback {
    return {
      ...feedback,
      createdAt: feedback.createdAt.toISOString(),
      updatedAt: feedback.updatedAt.toISOString(),
    };
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService(); 