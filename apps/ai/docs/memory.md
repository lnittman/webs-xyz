# Memory

Memory for the chat agent uses Postgres via `@mastra/pg`. The configuration in `src/mastra/agents/chat/memory.ts` shows the required environment variables:

```ts
const host = process.env.PGHOST;
const user = process.env.PGUSER;
const database = process.env.PGDATABASE;
const password = process.env.PGPASSWORD;
export const memory = new Memory({
  storage: new PostgresStore({ host, port: parseInt(process.env.PGPORT || '5432'), user, database, password, ssl: true }),
  options: { lastMessages: 10, semanticRecall: false },
});
```

Set these variables and enable `semanticRecall: true` to allow vector based recall of older messages. The Postgres database must have the Mastra schema installed.
