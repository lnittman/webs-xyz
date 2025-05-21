# Package Documentation: analytics

## Overview
- **Purpose**: Shared utilities for capturing analytics events from client and server.
- **Type**: Utility/React library.
- **Development Status**: Active, used across apps.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `AnalyticsProvider`
- **Purpose**: Wraps React app to initialize PostHog, Google Analytics and Vercel Analytics.
- **Usage Pattern**:
  ```tsx
  <AnalyticsProvider>{children}</AnalyticsProvider>
  ```
- **Examples**: Used in `app` and `api` apps.
- **Implementation Notes**: Reads environment keys via Zod from `keys.ts`.

### Secondary Exports/Utilities

#### `posthogClient`
- **Purpose**: Server-side PostHog instance.
- **Usage Pattern**: Import in API routes to capture events.
- **Implementation Notes**: Configured with server-only package.

## Internal Architecture

### Core Modules
1. **index.tsx**
   - Exports provider and hooks.
   - Imports from submodules for each analytics service.
2. **posthog/**
   - Client and server wrappers for PostHog.
   - Handles capture events and user identification.

### Implementation Patterns
- Uses React context for provider pattern.
- Environment variables validated with Zod.
- Works in both client and server contexts using dynamic imports.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| posthog-js | ^1.235.6 | Client analytics | |
| posthog-node | ^4.11.3 | Server analytics | |
| @vercel/analytics | ^1.5.0 | Vercel Analytics | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/auth | Optional user info | |
| @repo/typescript-config | TS config | Dev dependency |

## Consumption Patterns

### Current App Usage
- `app` and `api` wrap top-level components with `AnalyticsProvider`.
- Events captured on user actions and server events.

### Integration Best Practices
- Provide required keys via environment variables.
- Avoid sending PII in analytics events.
- Use server-only wrappers for sensitive tokens.

## Testing Strategy
- Manual testing of event flows; no dedicated tests yet.
- Could add Vitest unit tests for provider logic.

## Known Issues & Limitations
- Analytics scripts add to bundle size.
- PostHog self-hosted mode not yet supported.

## Recent Developments
- Provider updated to support Vercel Analytics.
- Added Zod validation for environment keys.
