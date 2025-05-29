import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string(),
  webId: z.string().nullable().optional(),
  type: z.enum(['TEXT', 'TOOL', 'SYSTEM', 'AI']),
  content: z.string(),
  createdAt: z.string(),
});

export const webSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  domain: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  prompt: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETE', 'FAILED']),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(messageSchema).optional(),
});

export const createWebInputSchema = z.object({
  url: z.string().url(),
  prompt: z.string().optional(),
});

export const updateWebInputSchema = webSchema.partial();

export type Web = z.infer<typeof webSchema>;
export type CreateWebInput = z.infer<typeof createWebInputSchema>;
export type UpdateWebInput = z.infer<typeof updateWebInputSchema>;
