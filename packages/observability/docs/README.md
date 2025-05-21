# @repo/observability

Version: 0.0.0

Logging and monitoring helpers including Sentry integration and BetterStack pings.

## Key Files
- `log.ts` – wrapper around Logtail or console
- `instrumentation.ts` – Sentry instrumentation
- `client.ts` – browser Sentry utilities
- `status/` – components for status page
- `keys.ts` – environment variables

## Usage
```ts
import { log } from '@repo/observability'
```
Use to log events or instrument applications.
