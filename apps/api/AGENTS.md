# AGENTS - API App

## Overview
This Next.js application is reserved for cron jobs and inbound/outbound webhooks. Business APIs for the frontend live in `apps/app`.

## Dev Environment
- Start the dev server: `pnpm --filter api dev` (port 3002).
- Build for production: `pnpm --filter api build`.
- Environment variables are defined in `.env.*` files and `env.ts`.

## Testing Instructions
Use `pnpm --filter api test` to run unit tests with Vitest when needed.

## Code Standards
Follow Next.js 15 conventions. Only cron and webhook routes reside under `app/`.

## PR Instructions
Document any new webhook or cron endpoints in `apps/api/docs`. Ensure handlers validate payloads with `zod`.

## Key Files
- `app/` – Route handlers for cron and webhooks.
- `instrumentation.ts` – Sentry instrumentation.

## Webhook Endpoints

### Clerk Webhooks
- `POST /webhooks/clerk` - Handles user lifecycle events from Clerk authentication

### Mastra Webhooks  
- `POST /webhooks/mastra` - Handles workflow completion notifications from Mastra
- See `docs/mastra-webhook.md` for detailed documentation

## Integration Points
The API app triggers jobs and external integrations. Other apps call these endpoints only for background tasks.
