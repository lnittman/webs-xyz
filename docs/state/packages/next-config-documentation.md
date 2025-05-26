# Package Documentation: next-config

## Overview
- **Purpose**: Shared Next.js configuration with Prisma plugin and custom rewrites.
- **Type**: Configuration utility.
- **Development Status**: Stable, used by all Next.js apps.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `config`
- **Purpose**: Base Next.js configuration object.
- **Usage Pattern**:
  ```ts
  import { config } from '@repo/next-config'
  export default config
  ```
- **Implementation Notes**: Includes Prisma plugin to workaround monorepo issue.

#### `withAnalyzer`
- **Purpose**: Wraps config to enable bundle analysis.
- **Usage Pattern**: `export default withAnalyzer(config)` when `ANALYZE=true`.

### Secondary Exports/Utilities
None.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Defines `config` and `withAnalyzer`.
2. **keys.ts**
   - Validates environment variables for rewrites.

### Implementation Patterns
- Uses `@next/bundle-analyzer` plugin.
- Environment variables typed with Zod.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @next/bundle-analyzer | 15.3.0 | Bundle analysis plugin | optional |
| @prisma/nextjs-monorepo-workaround-plugin | ^6.6.0 | Prisma plugin | |
| @t3-oss/env-nextjs | ^0.12.0 | Env validation | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | dev dependency |

## Consumption Patterns

### Current App Usage
- `app` and `api` import config from this package in `next.config.ts`.

### Integration Best Practices
- Extend config rather than overriding fields.
- Use `withAnalyzer` only during local analysis.

## Testing Strategy
- Config tested indirectly via Next.js build commands.

## Known Issues & Limitations
- Coupled to Next.js 15.x; may require updates for future versions.

## Recent Developments
- Added rewrites for PostHog script loading.
\n_Last Reviewed: 2025-06-04_
