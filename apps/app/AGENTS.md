# AGENTS - Web App

## Overview
`app` is the main Next.js frontend for Webs. It now hosts the REST API consumed by the UI. Cron jobs and webhooks remain in `apps/api`.

## Dev Environment
- Start with `pnpm --filter app dev` (port 3000).
- Build: `pnpm --filter app build`.
- Global middleware is defined in `middleware.ts`.

## Code Standards
- Components live under `app/` using the App Router convention.
- API routes live under `src/app/api` and should call services from `src/lib/api`.
- Use the shared `@repo/design` components where possible.

## PR Instructions
Document UI or API changes in `apps/app/docs`. Include screenshots or wireframes when relevant.

## Key Files
- `src/app/` – pages, components and API routes.
- `src/lib/api/` – services and schemas backing API routes.
- `instrumentation.ts` – sets up Sentry.

## Integration Points
The app interacts with `api` for cron/webhook tasks and with `ai` for summarization. It also consumes shared packages for analytics, auth and UI.
