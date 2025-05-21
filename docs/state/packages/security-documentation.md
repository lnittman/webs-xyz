# Package Documentation: security

## Overview
- **Purpose**: Arcjet-based helpers for bot detection and request verification.
- **Type**: Utility package.
- **Development Status**: Active.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `secure`
- **Purpose**: Middleware-like function to enforce security rules.
- **Usage Pattern**:
  ```ts
  await secure(['bot'])
  ```
- **Implementation Notes**: Uses Arcjet and Nosecone libraries.

### Secondary Exports/Utilities
None.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Exposes `secure` helper and config types.
2. **middleware.ts**
   - Next.js middleware integration for route protection.

### Implementation Patterns
- Environment keys loaded via `keys.ts`.
- Designed for use in edge middleware or API routes.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @arcjet/next | 1.0.0-beta.5 | Arcjet integration | |
| @nosecone/next | 1.0.0-beta.5 | Nosecone detection | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | dev dependency |

## Consumption Patterns

### Current App Usage
- `api` and `app` implement `secure` in middleware for bot checks.

### Integration Best Practices
- Call `secure` early in request lifecycle.
- Configure allowed bots via Arcjet settings.

## Testing Strategy
- Manual QA of security middleware.

## Known Issues & Limitations
- Beta versions of Arcjet libraries may change APIs.

## Recent Developments
- Initial integration with Arcjet beta.
