import type { ComponentType } from 'react';
import type { Web } from './web';

export interface ProcessingActivity {
  id: string;
  type: 'processing' | 'completed' | 'queued';
  action: string;
  target: string;
  timestamp: Date;
  icon?: ComponentType<any>;
}

export type { Web };

export interface DashboardProps {
  workspaceId: string;
  selectedModelId: string;
  webs?: Web[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onModelChange: (modelId: string) => void;
  onSubmit: (input: string) => Promise<void>;
  isSubmitting: boolean;
} 