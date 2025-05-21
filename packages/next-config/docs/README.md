# @repo/next-config

Version: 0.0.0

Shared Next.js configuration with Prisma plugin and custom rewrites for PostHog. Exports `config` and `withAnalyzer` helpers.

## Key Files
- `index.ts` – Next.js config
- `keys.ts` – environment variables

## Usage
```ts
import { config } from '@repo/next-config'
```
Use in `next.config.js` via `export default config`.
