import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import { VercelDeployer } from '@mastra/deployer-vercel';
import { PostgresStore } from '@mastra/pg';

import { chatAgent } from './agents/chat';

// Create a logger with less verbose level to reduce output
const logger = createLogger({
  name: 'mastra',
  level: 'info'
});

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/webs_memory';

// Create the Mastra instance with our components
export const mastra = new Mastra({
  agents: {
    chat: chatAgent,
  },
  deployer: new VercelDeployer({
    teamSlug: 'luke-labs',
    projectName: 'webs-ai',
    token: process.env.VERCEL_TOKEN || '',
  }),
  logger,
  storage: new PostgresStore({
    connectionString,
  }),
  telemetry: {
    enabled: false,
  },
});
