import { z } from 'zod';

/**
 * Schema for validating UUID ID parameter in routes
 */
export const spaceIdParamSchema = z.object({
  id: z.string().uuid("Invalid Space ID format")
});

export type SpaceIdParam = z.infer<typeof spaceIdParamSchema>;

/**
 * Space schema
 */
export const spaceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").nullable().optional(),
  emoji: z.string().max(10).nullable().optional(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  webs: z.array(z.any()).optional(), // Will be Web[] when populated
});

export type Space = z.infer<typeof spaceSchema>;

/**
 * Request schemas for API operations
 */
export const createSpaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
  emoji: z.string().max(10, "Emoji must be 10 characters or less").optional(),
  isDefault: z.boolean().optional(),
  userId: z.string(),
});

export type CreateSpace = z.infer<typeof createSpaceSchema>;

/**
 * Schema for updating a space
 */
export const updateSpaceSchema = spaceSchema.partial().omit({ 
  id: true, 
  userId: true, 
  createdAt: true,
  webs: true 
});

export type UpdateSpace = z.infer<typeof updateSpaceSchema>;

/**
 * Schema for assigning webs to spaces
 */
export const assignWebToSpaceSchema = z.object({
  webId: z.string().uuid("Invalid Web ID"),
  spaceId: z.string().uuid("Invalid Space ID").nullable(), // null to remove from space
});

export type AssignWebToSpace = z.infer<typeof assignWebToSpaceSchema>;

// Legacy exports for backward compatibility
export const createSpaceInputSchema = createSpaceSchema;
export const updateSpaceInputSchema = updateSpaceSchema;
export type CreateSpaceInput = CreateSpace;
export type UpdateSpaceInput = UpdateSpace; 