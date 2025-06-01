import { MastraClient } from '@mastra/client-js';

export interface WorkflowExecutionResult {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface WorkflowMetadata {
  webId?: string;
  userId?: string;
  [key: string]: any;
}

export interface MastraClientOptions {
  baseUrl?: string;
}

/**
 * Create a Mastra client instance
 */
export function createMastraClient(options: MastraClientOptions = {}) {
  return new MastraClient({
    baseUrl: options.baseUrl || process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:4111',
  });
}

// Default client instance
export const mastraClient = createMastraClient(); 