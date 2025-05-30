import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import { PostgresStore } from '@mastra/pg';

import { chatAgent } from './agents/chat';
import { websAgent } from './agents/webs';
import { analyzeWeb } from './workflows/analyze-web';
import { storage } from './storage';

// Create a logger with less verbose level to reduce output
const logger = createLogger({
  name: 'mastra',
  level: 'debug'
});

// Create the Mastra instance with our components
export const mastra = new Mastra({
  agents: {
    chat: chatAgent,
    webs: websAgent,
  },
  workflows: {
    analyzeWeb,
  },
  logger,
  storage,
  telemetry: {
    enabled: false,
  },
});
