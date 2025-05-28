# Web App Docs

Guidelines and design references for the user-facing application.

Include screenshots of wireframes and note any design tokens used from `@repo/design`.

## Routes

- `/` - main authenticated workspace page.
- `/settings` - workspace settings page.
- `/c/[id]` - view a web's interaction history and messages.

## API Structure

All REST endpoints are implemented under `src/app/api`. Each route uses a service from `src/lib/api` and returns data validated with Zod schemas. Cron and webhook endpoints live in the separate `api` app.
