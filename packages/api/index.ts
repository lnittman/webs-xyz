// Export all API services
export { websService } from './services/web';
export { userSettingsService } from './services/user-settings';
export { feedbackService } from './services/feedback';
export { messageService } from './services/message';
export { spaceService, type Space } from './services/space';

// Export Mastra services
export { 
  mastraWorkflowService,
  mastraAgentService,
  type WorkflowRunResult,
  type WorkflowAnalysisData,
  type AgentChatMessage,
  type AgentResponse
} from './services/mastra';

// Export key schemas
export { 
  webSchema, 
  createWebSchema, 
  updateWebSchema,
  webIdParamSchema 
} from './schemas/web';

export { 
  feedbackSchema 
} from './schemas/feedback';

export { 
  userSettingsSchema,
  updateUserSettingsSchema 
} from './schemas/userSettings';

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
} from './schemas/space';

// Export utilities
export { withAuthenticatedUser } from './utils/auth';
export { ApiResponse, withErrorHandling } from './utils/response';
export { ApiError } from './utils/error';

// Export constants
export { 
  ErrorType,
  SPACE_DEFAULTS,
  AVAILABLE_MODELS,
  SPACE_VISIBILITY,
  USER_SETTINGS_DEFAULTS
} from './constants';
