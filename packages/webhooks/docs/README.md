# @repo/webhooks

Version: 0.0.0

Simple wrapper for sending events through Svix.

## Key Files
- `index.ts` – exports `webhooks` helpers
- `lib/svix.ts` – Svix client configuration
- `keys.ts` – Svix API key

## Usage
```ts
import { webhooks } from '@repo/webhooks'
```
Use in API routes to deliver webhook events to external services.
