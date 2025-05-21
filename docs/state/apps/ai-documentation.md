# App Documentation: ai

## Overview
- **Purpose**: Contains Mastra-based AI agents that perform summarization and research workflows.
- **Business Value**: Provides the core AI capabilities powering summarization in the frontend.
- **Development Status**: Active but lighter development compared to frontend.
- **Responsible Team/Owner**: AI/ML team.

## Core Architecture

### Architectural Pattern
- Built with Mastra using TypeScript modules.
- Agents defined under `src/` with separate directories per agent.
- Uses Mastra memory modules for chat history storage.
- Executes tasks via Mastra runtime when invoked by API.

### Core Modules
1. **src/mastra/**
   - Agents for summarizing URLs and conversation handling.
   - Contains memory configuration and tool definitions.
2. **docs/**
   - Reference documentation for agents and memory usage.
   - Helps define prompts and environment variables.

### State Management
- Agent state stored in Postgres using `@mastra/pg` memory.
- Each conversation has a memory context with limited recent messages.
- Persistent storage via Mastra memory ensures recall across sessions.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| mastra | ^0.6.1 | Development server and CLI | |
| @mastra/core | ^0.9.2 | Agent framework | |
| @mastra/memory | ^0.3.2 | Memory management | Uses PostgresStore |
| @openrouter/ai-sdk-provider | ^0.4.5 | LLM provider | |
| zod | ^3.24.4 | Schema validation | |

### Internal Package Dependencies
| Package | Usage Pattern | Integration Points | Notes |
|-----------|---------------|-------------------|-------|
| None | | | |

## Key Features

### Feature: URL Summarization Agent
- Purpose and functionality: Crawls a URL and summarizes the content.
- Implementation approach: Agent uses fetching tools and LLM prompts.
- Key components involved: `src/mastra/agents/url-summary.ts`.
- Integration points: Triggered by API app and results stored in database.
- Potential improvements: Add vector embeddings for deeper search.

### Feature: Chat Agent
- Purpose and functionality: Allows interactive conversations with memory.
- Implementation approach: Uses memory module with Postgres backend.
- Key components involved: `src/mastra/agents/chat`.
- Integration points: Called by frontend for AI chat features.
- Potential improvements: Improve semantic recall via vector store.

## Data Management
- Sources: User-provided URLs and messages.
- API integration: Data flows from API endpoints to AI agents.
- Transformations: Text extraction and summarization via LLM.
- Caching: Minimal; rely on memory store for chat context.
- Validation: `zod` for prompt schemas.

## UI/UX Architecture
- N/A – CLI/agent service only.

## Key Implementation Patterns
- Agents constructed using Mastra's builder pattern.
- Error handling using standard try/catch and logging utilities.
- Async operations executed via Mastra runtime tasks.
- Configuration through environment variables loaded in `tsconfig.json`.
- Deployment via `@mastra/deployer-vercel` for Vercel functions.

## Development Workflow
- `pnpm --filter ai dev` to start Mastra server on port 1905.
- Source code under `src/` with TypeScript modules.
- Environment setup documented in `docs` folder.
- Manual testing recommended for agents.

## Known Issues & Technical Debt
- Lack of automated tests.
- Memory configuration may not scale for large conversations.
- Documentation for new agents needs expansion.
- Integration with API triggers could be more robust.

## Recent Developments
- Memory documentation added with Postgres configuration.
- Updated Mastra dependencies to latest versions.
- Preparing new tools integration as shown in docs/tools.md.
- Basic Vercel deployment scripts included.
