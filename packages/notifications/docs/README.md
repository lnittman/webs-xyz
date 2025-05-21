# @repo/notifications

Version: 0.0.0

Wrapper around Knock notification API. Exports a preconfigured `Knock` instance.

## Key Files
- `index.ts` – creates `notifications` client
- `components/` – in-app notification UI
- `keys.ts` – Knock credentials

## Usage
```ts
import { notifications } from '@repo/notifications'
```
Use to send events and show real-time feeds.
