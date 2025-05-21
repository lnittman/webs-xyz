import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import { LibSQLStore } from '@mastra/libsql';
 
export const mastra = new Mastra({
  agents: {}, // Define agents if needed for other tasks
  logger: createLogger({ name: 'webs-ai', level: 'info' }),
  storage: new LibSQLStore({
    url: 'file:../mastra.db',
  }),
});