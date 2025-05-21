# @repo/database

Version: 0.0.0

Prisma client configured for Neon serverless. Exports `database` instance and generated types.

## Key Files
- `index.ts` – creates Prisma client with Neon adapter
- `generated/` – Prisma generated client
- `keys.ts` – database connection string

## Usage
```ts
import { database } from '@repo/database'
```
Access models via `database.user.findMany()` and similar methods.
