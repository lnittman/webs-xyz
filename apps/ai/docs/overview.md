# AI Overview

The `apps/ai` project exposes Mastra agents and workflows used across the platform. The main entry point is `src/mastra/index.ts` which registers agents and workflows.

Current features:

- **Chat agent** – defined in `src/mastra/agents/chat` and accessible via `/api/chat`.
- **Transfermarkt workflow** – defined in `src/mastra/workflows/transfermarkt.ts` for scraping football data.

Agents and workflows consume prompt templates from the `src/mastra` directory and helper docs under this folder.
