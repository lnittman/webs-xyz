# AGENTS - Web App

## Overview
`app` is the main Next.js frontend for Webs. It provides a minimal, thumb-friendly UI for research and reading, integrating AI insights from the `ai` app and data from the `api` app.

## Dev Environment
- Start with `pnpm --filter app dev` (port 3000).
- Build: `pnpm --filter app build`.
- Global middleware is defined in `middleware.ts`.

## Testing Instructions
Run `pnpm --filter app test` when necessary. Tests use Vitest and Testing Library.

## Code Standards
- Components live under `app/` using the `/routes` convention.
- Use the shared `@repo/design-system` components where possible.

## PR Instructions
Document UI changes in `apps/app/docs`. Include screenshots or wireframes when relevant.

## Key Files
- `app/` – Next.js pages and components.
- `instrumentation.ts` – sets up Sentry.

## Integration Points
Interacts with the API app for data fetching and with AI app for summarization features. Utilizes shared packages for analytics, auth, and UI.
