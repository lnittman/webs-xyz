# AGENTS - Email App

## Overview
This app manages transactional and marketing emails using React Email. Templates reside under `emails/` and can be previewed locally.

## Dev Environment
- Run `pnpm --filter email dev` to preview emails (port 3003).
- Build static exports via `pnpm --filter email build`.

## Testing Instructions
Currently there are no automated tests.

## Code Standards
Templates use JSX components from `@react-email/components` and shared code from `@repo/email`.

## PR Instructions
Any new email templates should include screenshots in `apps/email/docs`.

## Key Files
- `emails/` – React Email components.
- `tsconfig.json` – TypeScript configuration.

## Integration Points
Emails are triggered by the API app via webhooks or jobs and use packages like analytics and notifications.
