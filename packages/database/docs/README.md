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
Access models via `database.task.findMany()` and similar methods.

## Models

- `Task` – stores the submitted URL, optional prompt, status, and creation timestamps.
- `Message` – represents tool calls or text output associated with a task.
- `TaskStatus` and `MessageType` enums define available states.
