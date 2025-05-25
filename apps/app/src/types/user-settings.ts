export interface UserSettings {
  id: string;
  userId: string;
  // Appearance settings
  fontFamily: string;
  // Notification settings
  notifyProcessingComplete: boolean;
  notifyProcessingFailed: boolean;
  notifyWeeklySummary: boolean;
  notifyFeatureUpdates: boolean;
  // General settings
  workspaceName: string | null;
  defaultModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserSettingsInput {
  fontFamily?: string;
  notifyProcessingComplete?: boolean;
  notifyProcessingFailed?: boolean;
  notifyWeeklySummary?: boolean;
  notifyFeatureUpdates?: boolean;
  workspaceName?: string | null;
  defaultModel?: string;
} 