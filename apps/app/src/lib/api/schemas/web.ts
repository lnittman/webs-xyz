import { z } from 'zod';

/**
 * Schema for validating UUID ID parameter in routes
 */
export const webIdParamSchema = z.object({
  id: z.string().uuid("Invalid Web ID format")
});

export type WebIdParam = z.infer<typeof webIdParamSchema>;

/**
 * Message schema
 */
export const messageSchema = z.object({
  id: z.string().uuid(),
  webId: z.string().uuid().nullable().optional(),
  type: z.enum(['TEXT', 'TOOL', 'SYSTEM', 'AI']),
  content: z.string(),
  createdAt: z.string(),
});

export type Message = z.infer<typeof messageSchema>;

/**
 * Web entity schema
 */
export const webEntitySchema = z.object({
  id: z.string().uuid(),
  webId: z.string().uuid(),
  type: z.string(),
  value: z.string(),
  createdAt: z.string(),
});

export type WebEntity = z.infer<typeof webEntitySchema>;

/**
 * Web schema
 */
export const webSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
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
  relatedUrls: z.array(z.string().url()).optional(),
  emoji: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(messageSchema).optional(),
  entities: z.array(webEntitySchema).optional(),
});

export type Web = z.infer<typeof webSchema>;

/**
 * Request schemas for API operations
 */
export const createWebSchema = z.object({
  url: z.string().url('Invalid URL format'),
  urls: z.array(z.string().url('Invalid URL format')).optional(),
  prompt: z.string().min(1).max(2000).optional(),
  userId: z.string(),
});

export type CreateWeb = z.infer<typeof createWebSchema>;

/**
 * Schema for updating a web
 */
export const updateWebSchema = webSchema.partial().omit({ id: true, userId: true, createdAt: true });

export type UpdateWeb = z.infer<typeof updateWebSchema>;

// Legacy exports for backward compatibility
export const createWebInputSchema = createWebSchema;
export const updateWebInputSchema = updateWebSchema;
export type CreateWebInput = CreateWeb;
export type UpdateWebInput = UpdateWeb;
