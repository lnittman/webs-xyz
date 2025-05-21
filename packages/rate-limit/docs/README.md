# @repo/rate-limit

Version: 0.0.0

Helpers for creating Upstash Redis based rate limiters.

## Key Files
- `index.ts` – exports `createRateLimiter` factory
- `keys.ts` – Upstash credentials

## Usage
```ts
import { createRateLimiter } from '@repo/rate-limit'
```
Use inside API routes or middleware to throttle requests.
