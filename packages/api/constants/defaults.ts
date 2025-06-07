/**
 * Default values for space settings
 */
export const SPACE_DEFAULTS = {
  DEFAULT_MODEL: 'claude-4-sonnet',
  NOTIFY_WEB_COMPLETE: true,
  NOTIFY_WEB_FAILED: true,
  VISIBILITY: 'PRIVATE',
} as const;

/**
 * Available models for spaces
 */
export const AVAILABLE_MODELS = [
  'claude-4-sonnet',
  'gpt-4o',
  'gpt-4o-mini',
  'gemini-pro',
] as [string, ...string[]];

/**
 * Space visibility options
 */
export const SPACE_VISIBILITY = [
  'PRIVATE',
  'SHARED', 
  'PUBLIC',
] as [string, ...string[]];

/**
 * Default user settings
 */
export const USER_SETTINGS_DEFAULTS = {
  FONT_FAMILY: 'iosevka-term',
  NOTIFY_PROCESSING_COMPLETE: true,
  NOTIFY_PROCESSING_FAILED: true,
  NOTIFY_WEEKLY_SUMMARY: false,
  NOTIFY_FEATURE_UPDATES: false,
  DEFAULT_MODEL: 'claude-4-sonnet',
} as const; 