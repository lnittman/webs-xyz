import { z } from 'zod';
import { SPACE_DEFAULTS, AVAILABLE_MODELS, SPACE_VISIBILITY } from '../constants';

/**
 * Schema for validating UUID ID parameter in routes
 */
export const spaceIdParamSchema = z.object({
  id: z.string().uuid("Invalid Space ID format")
});

export type SpaceIdParam = z.infer<typeof spaceIdParamSchema>;

/**
 * Base space schema - represents the full space entity
 */
export const spaceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").nullable().optional(),
  emoji: z.string().max(10).nullable().optional(),
  isDefault: z.boolean(),
  // Space settings
  defaultModel: z.enum(AVAILABLE_MODELS),
  notifyWebComplete: z.boolean(),
  notifyWebFailed: z.boolean(),
  visibility: z.enum(SPACE_VISIBILITY),
  createdAt: z.string(),
  updatedAt: z.string(),
  webs: z.array(z.any()).optional(), // Will be Web[] when populated
  _count: z.object({
    webs: z.number()
  }).optional(),
});

/**
 * Inferred Space type from schema
 */
export type Space = z.infer<typeof spaceSchema>;

/**
 * Schema for creating a new space
 */
export const createSpaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
  emoji: z.string().max(10, "Emoji must be 10 characters or less").optional(),
  isDefault: z.boolean().optional(),
  // Space settings (optional during creation, will use defaults)
  defaultModel: z.enum(AVAILABLE_MODELS).default(SPACE_DEFAULTS.DEFAULT_MODEL).optional(),
  notifyWebComplete: z.boolean().default(SPACE_DEFAULTS.NOTIFY_WEB_COMPLETE).optional(),
  notifyWebFailed: z.boolean().default(SPACE_DEFAULTS.NOTIFY_WEB_FAILED).optional(),
  visibility: z.enum(SPACE_VISIBILITY).default(SPACE_DEFAULTS.VISIBILITY).optional(),
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
  webs: true,
  _count: true,
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

/**
 * Schema for updating space settings
 */
export const updateSpaceSettingsSchema = z.object({
  defaultModel: z.enum(AVAILABLE_MODELS).optional(),
  notifyWebComplete: z.boolean().optional(),
  notifyWebFailed: z.boolean().optional(),
  visibility: z.enum(SPACE_VISIBILITY).optional(),
});

export type UpdateSpaceSettings = z.infer<typeof updateSpaceSettingsSchema>;

// Legacy exports for backward compatibility
export const createSpaceInputSchema = createSpaceSchema;
export const updateSpaceInputSchema = updateSpaceSchema;
export type CreateSpaceInput = CreateSpace;
export type UpdateSpaceInput = UpdateSpace; 