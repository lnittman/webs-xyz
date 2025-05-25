# App Documentation: api

## Overview
- **Purpose**: Next.js backend exposing REST and Next.js API routes.
- **Business Value**: Provides data persistence, authentication and endpoints for the frontend and AI workflows.
- **Development Status**: Active; supports current features with incremental updates.
- **Responsible Team/Owner**: Webs backend team.

## Core Architecture

### Architectural Pattern
- Next.js App Router used for API routes under `app/api`.
- Integrates Prisma via `@repo/database`.
- Authentication handled through middleware from `@repo/auth`.
- Uses Zod schemas for request validation.

### Core Modules
1. **app/api/**
   - Route handlers for CRUD and user endpoints.
   - Organized by resource (e.g., `/users`, `/sessions`).
   - Uses `POST`/`GET` handlers with typed data.
2. **instrumentation.ts**
   - Configures Sentry for error reporting.
   - Hooks into Next.js instrumentation.

### State Management
- Stateless REST APIs; state managed via database layer.
- Authentication sessions via Clerk tokens.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| next | 15.3.0 | Backend framework | |
| @sentry/nextjs | ^9.12.0 | Error tracking | |
| svix | ^1.64.0 | Webhooks | Used for outbound events |
| zod | ^3.24.2 | Validation | Validates request/response |

### Internal Package Dependencies
| Package | Usage Pattern | Integration Points | Notes |
|-----------|---------------|-------------------|-------|
| @repo/database | Database client | Prisma connection | |
| @repo/auth | Auth utilities | Middleware and session checks | |
| @repo/analytics | Server analytics | Logging API requests | |
| @repo/observability | Sentry instrumentation | Error logging | |
| @repo/testing | Test utilities | Unit tests via vitest | |

## Key Features

### Feature: User API
- Purpose: CRUD operations for users and sessions.
- Implementation: Next.js route handlers using Prisma models.
- Key components: `/app/api/users/route.ts` and related schema files.
- Integration: Consumed by `app` frontend for sign-up and profile management.
- Potential improvements: Additional role-based permissions.

### Feature: Webhook Delivery
- Purpose: Send events to external services (e.g., notifications, payment providers).
- Implementation: Utilizes `@repo/webhooks` and `svix` client.
- Key components: `/app/api/webhooks/*` routes.
- Integration: Triggered after actions like subscription purchase.
- Potential improvements: Add retry logic and monitoring.

## Data Management
- Data sources: Postgres via Prisma client.
- API patterns: Standard REST endpoints with Zod validation.
- Data transformation: Minimal mapping from DTOs to database models.
- Caching: Currently none beyond database connection pooling.
- Validation: Strict Zod schemas for all endpoints.

## UI/UX Architecture
- N/A – API app exposes endpoints only.

## Key Implementation Patterns
- Use of `@t3-oss/env-nextjs` for environment variable typing.
- Handler utilities for standardized responses.
- Error handling through `try/catch` with Sentry capture.
- Tests use `@repo/testing` config with Vitest.
- Mastra workflows triggered via HTTP to `ai` app.

## Development Workflow
- `pnpm --filter api dev` runs local server on port 3002.
- Build with `pnpm --filter api build`.
- Environment variables stored in `.env.*` and typed with `env.ts`.
- Debugging using Sentry and local logging utilities.

## Known Issues & Technical Debt
- Some routes have incomplete validation coverage.
- Webhook retry logic is minimal.
- Need more integration tests for database edge cases.
- Documentation for API contracts could be expanded.

## Recent Developments
- Added additional design components used in API documentation pages.
- Updated Prisma schema for new user fields.
- Minor refactoring of middleware for Next.js 15.
- Preparing support for new AI workflow triggers.
