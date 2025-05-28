import { database } from '@repo/database';
import { z } from 'zod';

export const feedbackSchema = z.object({
  topic: z.enum(['BUG', 'FEATURE', 'UI', 'PERFORMANCE', 'GENERAL']),
  message: z.string(),
  userAgent: z.string().nullable(),
  url: z.string().url().nullable(),
  userId: z.string().nullable(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
});

export type Feedback = z.infer<typeof feedbackSchema> & { id: string; createdAt: string; updatedAt: string };

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
  topic?: string;
  status?: string;
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
    feedback: feedback.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    })),
    total,
  };
}
