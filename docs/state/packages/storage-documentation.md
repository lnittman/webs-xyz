# Package Documentation: storage

## Overview
- **Purpose**: Wrapper around Vercel Blob storage utilities.
- **Type**: Utility package.
- **Development Status**: Stable, minimal API.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `put`, `get` etc.
- **Purpose**: Re-export Vercel Blob SDK functions.
- **Usage Pattern**:
  ```ts
  import { put } from '@repo/storage'
  await put('file.txt', buffer)
  ```

### Secondary Exports/Utilities

#### `client`
- **Purpose**: Client-side helper for uploads.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Re-exports Vercel Blob SDK methods.
2. **client.ts**
   - Provides browser friendly helpers.

### Implementation Patterns
- Keys validated via `keys.ts`.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @vercel/blob | ^1.0.0 | Blob storage SDK | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | dev dependency |

## Consumption Patterns

### Current App Usage
- `api` uses storage utilities to persist user uploads.

### Integration Best Practices
- Avoid large file uploads in free tier.

## Testing Strategy
- Manual tests via local Vercel Blob emulator.

## Known Issues & Limitations
- None documented.

## Recent Developments
- Initial release with minimal wrappers.
