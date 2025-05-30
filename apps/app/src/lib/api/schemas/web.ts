import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string(),
  webId: z.string().nullable().optional(),
  type: z.enum(['TEXT', 'TOOL', 'SYSTEM', 'AI']),
  content: z.string(),
  createdAt: z.string(),
});

export const webEntitySchema = z.object({
  id: z.string(),
  webId: z.string(),
  type: z.string(),
  value: z.string(),
  createdAt: z.string(),
});

export const webSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  urls: z.array(z.string().url()).optional(),
  domain: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  prompt: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETE', 'FAILED']),
  // Analysis results
  analysis: z.any().nullable().optional(),
  topics: z.array(z.string()).optional(),
  sentiment: z.string().nullable().optional(),
  confidence: z.number().nullable().optional(),
  readingTime: z.number().nullable().optional(),
  insights: z.array(z.string()).optional(),
  relatedUrls: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(messageSchema).optional(),
  entities: z.array(webEntitySchema).optional(),
});

export const createWebInputSchema = z.object({
  url: z.string().url(),
  urls: z.array(z.string().url()).optional(),
  prompt: z.string().optional(),
});

export const updateWebInputSchema = webSchema.partial();

export type Web = z.infer<typeof webSchema>;
export type CreateWebInput = z.infer<typeof createWebInputSchema>;
export type UpdateWebInput = z.infer<typeof updateWebInputSchema>;
