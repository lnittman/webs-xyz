import { database } from '@repo/database';
import { feedbackSchema, type FeedbackInput } from '../schemas/feedback';
import { z } from 'zod';

export type Feedback = FeedbackInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export async function createFeedback(input: unknown): Promise<Feedback> {
  const data = feedbackSchema.parse(input);
  const feedback = await database.feedback.create({
    data: {
      ...data,
      status: data.status ?? 'OPEN',
    },
  });
  return {
    ...feedback,
    createdAt: feedback.createdAt.toISOString(),
    updatedAt: feedback.updatedAt.toISOString(),
  };
}

export async function listFeedback(params: {
  topic?: z.infer<typeof feedbackSchema>['topic'];
  status?: z.infer<typeof feedbackSchema>['status'];
  limit?: number;
  offset?: number;
}): Promise<{ feedback: Feedback[]; total: number }> {
  const { topic, status, limit = 50, offset = 0 } = params;
  const [feedback, total] = await Promise.all([
    database.feedback.findMany({
      where: {
        ...(topic ? { topic: topic as any } : {}),
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    database.feedback.count({
      where: {
        ...(topic ? { topic: topic as any } : {}),
        ...(status ? { status: status as any } : {}),
      },
    }),
  ]);
  return {
    feedback: feedback.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    })),
    total,
  };
}
