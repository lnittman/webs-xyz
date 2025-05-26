# Package Documentation: seo

## Overview
- **Purpose**: Utilities for generating metadata and JSON-LD for Next.js pages.
- **Type**: Utility library.
- **Development Status**: Stable.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `createMetadata`
- **Purpose**: Helper to merge default SEO metadata with page-specific data.
- **Usage Pattern**:
  ```ts
  export const metadata = createMetadata({ title: 'Home' })
  ```
- **Implementation Notes**: Uses lodash.merge internally.

#### `JsonLd`
- **Purpose**: React component for embedding JSON-LD schemas.
- **Usage Pattern**: `<JsonLd schema={mySchema} />`

### Secondary Exports/Utilities
None.

## Internal Architecture

### Core Modules
1. **metadata.ts**
   - Implements `createMetadata`.
2. **json-ld.tsx**
   - React components for structured data.

### Implementation Patterns
- Works with Next.js `generateMetadata` function.
- Schema definitions typed with `schema-dts`.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| lodash.merge | ^4.6.2 | Object merging | |
| schema-dts | ^1.1.5 | Types for JSON-LD schemas | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | dev dependency |

## Consumption Patterns

### Current App Usage
- `app` uses `createMetadata` in page files.

### Integration Best Practices
- Keep default metadata minimal and override per page.

## Testing Strategy
- Manual verification of meta tags.

## Known Issues & Limitations
- None significant.

## Recent Developments
- Added README with usage examples.
\n_Last Reviewed: 2025-06-04_
