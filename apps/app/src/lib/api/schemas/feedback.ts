import { z } from 'zod';

export const feedbackSchema = z.object({
  topic: z.enum(['BUG', 'FEATURE', 'UI', 'PERFORMANCE', 'GENERAL']),
  message: z.string(),
  userAgent: z.string().nullable(),
  url: z.string().url().nullable(),
  userId: z.string().nullable(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
