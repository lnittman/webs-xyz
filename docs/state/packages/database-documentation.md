# Package Documentation: database

## Overview
- **Purpose**: Provides Prisma client configured for Neon serverless database.
- **Type**: Data layer package.
- **Development Status**: Active as shared DB client.
- **Responsible Team/Owner**: Backend team.

## API Documentation

### Primary Exports

#### `database`
- **Purpose**: Singleton Prisma client.
- **Usage Pattern**:
  ```ts
  import { database } from '@repo/database'
  const users = await database.user.findMany()
  ```
- **Implementation Notes**: Uses Neon adapter for serverless Postgres.

### Secondary Exports/Utilities

#### `keys`
- **Purpose**: Environment variable definitions for database connection.
- **Usage Pattern**: Imported in apps to configure DB access.
- **Implementation Notes**: Utilizes `@t3-oss/env-nextjs` for validation.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Creates and exports Prisma client instance.
2. **prisma/**
   - Contains schema and generated client output.

### Implementation Patterns
- Prisma used in Data Proxy mode with serverless Neon.
- Strict typing of models and queries.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @prisma/client | 6.4.1 | ORM client | |
| @neondatabase/serverless | ^1.0.0 | Neon driver | |
| undici | ^7.8.0 | HTTP client for Prisma | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | Dev dependency |

## Consumption Patterns

### Current App Usage
- `api` app imports `database` for CRUD endpoints.
- `ai` app may store conversation memory via Prisma models.

### Integration Best Practices
- Keep Prisma schema in sync with application models.
- Run `prisma generate` when schema changes.

## Testing Strategy
- No unit tests yet, but Prisma type safety reduces risk.
- Future: add integration tests with a test database.

## Known Issues & Limitations
- Serverless connection can incur latency.
- Need to monitor connection limits when scaling.

## Recent Developments
- Schema updated for new user fields.
- Added script to generate Prisma client during build.
- Added `Feedback` and `UserSettings` models with enumerations for topics and status
