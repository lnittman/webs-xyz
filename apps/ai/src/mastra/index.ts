import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';

import { chatAgent } from './agents/chat';
import { webAnalyzeAgent } from './agents/web/analyze';
import { webCombineAgent } from './agents/web/combine';
import { webMetadataAgent } from './agents/web/metadata';
import { analyzeWeb } from './workflows/web/analyze';
import { storage } from './storage';

// Create a logger with less verbose level to reduce output
const logger = createLogger({
  name: 'mastra',
  level: 'info'
});

// Create the Mastra instance with our components
export const mastra = new Mastra({
  agents: {
    chat: chatAgent,
    webAnalyze: webAnalyzeAgent,
    webMetadata: webMetadataAgent,
    webCombine: webCombineAgent,
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
