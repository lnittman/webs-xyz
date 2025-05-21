import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";

const host = process.env.PGHOST;
const user = process.env.PGUSER;
const database = process.env.PGDATABASE;
const password = process.env.PGPASSWORD;
const port = process.env.PGPORT || "5432";
 
// Initialize memory with PostgreSQL storage and vector search
export const memory = new Memory({
  storage: new PostgresStore({
    host: host || "",
    port: port ? parseInt(port) : 5432,
    user: user || "",
    database: database || "",
    password: password || "",
    ssl: true,
  }),
  options: {
    lastMessages: 10,
    semanticRecall: false,
  },
});