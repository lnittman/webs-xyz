# Package Documentation: observability

## Overview
- **Purpose**: Logging and monitoring helpers with Sentry integration.
- **Type**: Utility package.
- **Development Status**: Active.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `log`
- **Purpose**: Wrapper around Logtail or console for logging.
- **Usage Pattern**: `log('info', 'message')`

#### `initSentry`
- **Purpose**: Initializes Sentry instrumentation.
- **Usage Pattern**: Called in app entrypoint.

### Secondary Exports/Utilities

#### `StatusPage`
- **Purpose**: React component for system status display.

## Internal Architecture

### Core Modules
1. **log.ts**
   - Main logging function using Logtail.
2. **instrumentation.ts**
   - Sets up Sentry for Next.js.
3. **status/**
   - Simple status page components.

### Implementation Patterns
- Environment keys validated with Zod.
- Uses server-only code for sensitive logging tokens.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @sentry/nextjs | ^9.12.0 | Error monitoring | |
| @logtail/next | ^0.2.0 | Structured logging | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | dev dependency |

## Consumption Patterns

### Current App Usage
- `app` and `api` call `initSentry` in `instrumentation.ts`.
- Log events from server routes.

### Integration Best Practices
- Initialize Sentry early in app startup.
- Avoid logging sensitive user data.

## Testing Strategy
- Manual tests via local Sentry events.

## Known Issues & Limitations
- Sentry DSN must be set for each environment.

## Recent Developments
- Added status page component for uptime monitoring.
\n_Last Reviewed: 2025-06-04_
