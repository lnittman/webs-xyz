# AGENTS - AI App

## Overview
The `ai` app contains Mastra-based AI workflows. It leverages Mastra packages to run agents that provide summarization and interaction with external URLs for research.

## Dev Environment
- Run `pnpm --filter ai install` if dependencies change.
- Use `pnpm --filter ai dev` to start the Mastra development server on port 1905.
- TypeScript configuration is in `apps/ai/tsconfig.json`.

## Testing Instructions
No automated tests are present. Manual validation is recommended when changing AI pipelines.

## Code Standards
Follow Mastra conventions for agent definitions. Keep TypeScript strict.

## PR Instructions
Document any new agents or changes to prompts within `apps/ai/docs` when submitting a PR.

## Key Files
- `src/` – agent definitions and support code.
- `docs/` – references such as `mastra` docs.

## Integration Points
The AI app communicates with the API and other packages via HTTP or shared libraries. Outputs are consumed by the main `app` frontend.
