import { z } from 'zod';

export const feedbackTopicEnum = z.enum(['BUG', 'FEATURE', 'UI', 'PERFORMANCE', 'GENERAL']);
export const feedbackStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export const feedbackSentimentEnum = z.enum(['POSITIVE', 'NEGATIVE']).nullable().optional();

export const feedbackSchema = z.object({
  topic: feedbackTopicEnum,
  message: z.string(),
  sentiment: feedbackSentimentEnum,
  userAgent: z.string().nullable(),
  url: z.string().url().nullable(),
  userId: z.string().nullable(),
  status: feedbackStatusEnum.optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
