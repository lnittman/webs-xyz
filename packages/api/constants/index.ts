/**
 * Resource types for error messages
 */
export enum ResourceType {
  WEB = 'Web',
  USER = 'User',
  FEEDBACK = 'Feedback',
  USER_SETTINGS = 'UserSettings',
  SPACE = 'Space'
}

export { ErrorType, ErrorMessage, ERROR_MESSAGES } from './error';
export { 
  SPACE_DEFAULTS, 
  AVAILABLE_MODELS, 
  SPACE_VISIBILITY, 
  USER_SETTINGS_DEFAULTS 
} from './defaults';

// Re-export types and schemas that are safe for client use
export type { Space } from '../schemas/space';
export { 
  spaceSchema,
  createSpaceSchema,
  updateSpaceSchema,
  updateSpaceSettingsSchema,
  spaceIdParamSchema,
  assignWebToSpaceSchema,
  type CreateSpace,
  type UpdateSpace,
  type UpdateSpaceSettings
} from '../schemas/space'; 