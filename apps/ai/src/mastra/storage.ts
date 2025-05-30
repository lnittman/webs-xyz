import { PostgresStore } from '@mastra/pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/webs_memory';

export const storage = new PostgresStore({
  connectionString,
}); 