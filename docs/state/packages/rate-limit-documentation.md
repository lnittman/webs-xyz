# Package Documentation: rate-limit

## Overview
- **Purpose**: Utilities for creating Upstash Redis based rate limiters.
- **Type**: Utility package.
- **Development Status**: Stable.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `createRateLimiter`
- **Purpose**: Factory to create an Upstash rate limiter.
- **Usage Pattern**:
  ```ts
  const limiter = createRateLimiter('login', { interval: '1m', limit: 5 })
  ```
- **Implementation Notes**: Wraps `@upstash/ratelimit` client.

### Secondary Exports/Utilities
None.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Exports `createRateLimiter` function.
2. **keys.ts**
   - Holds Upstash credentials.

### Implementation Patterns
- Uses `@upstash/redis` for persistence.
- Zod ensures environment variables are present.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @upstash/ratelimit | ^2.0.5 | Rate limiting | |
| @upstash/redis | ^1.34.7 | Redis client | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | dev dependency |

## Consumption Patterns

### Current App Usage
- `api` uses rate limiters on sensitive endpoints (e.g., login).

### Integration Best Practices
- Instantiate limiter per route using unique prefix keys.

## Testing Strategy
- Manual testing via API requests.

## Known Issues & Limitations
- Upstash free tier limitations.

## Recent Developments
- Initial implementation stable; no recent major changes.
\n_Last Reviewed: 2025-06-04_
