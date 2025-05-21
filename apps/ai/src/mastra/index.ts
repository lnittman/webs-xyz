import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import { LibSQLStore } from '@mastra/libsql';
import { transfermarktWorkflow } from './workflows/transfermarkt';
import { newsWorkflow } from './workflows/news';
 
export const mastra = new Mastra({
  agents: {}, // Define agents if needed for other tasks
  logger: createLogger({ name: 'voet-ai', level: 'info' }),
  storage: new LibSQLStore({
    url: 'file:../mastra.db',
  }),
  vnext_workflows: {
    transfermarkt: transfermarktWorkflow,
    news: newsWorkflow,
  },
});