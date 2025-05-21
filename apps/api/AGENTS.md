# AGENTS - API App

## Overview
This Next.js application exposes the backend API used by other apps. It handles user data, authentication, and external integrations.

## Dev Environment
- Start the dev server: `pnpm --filter api dev` (port 3002).
- Build for production: `pnpm --filter api build`.
- Environment variables are defined in `.env.*` files and `env.ts`.

## Testing Instructions
Use `pnpm --filter api test` to run unit tests with Vitest when needed.

## Code Standards
Follow Next.js 15 conventions. API routes live in `app/api`.

## PR Instructions
Update API documentation under `apps/api/docs` when endpoints change. Ensure new endpoints have typed `zod` schemas.

## Key Files
- `app/` – Next.js route handlers.
- `instrumentation.ts` – Sentry instrumentation.

## Integration Points
The API app connects to the database, authentication, and other packages. Frontend and AI apps communicate with it via HTTP.
