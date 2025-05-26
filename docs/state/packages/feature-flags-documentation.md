# Package Documentation: feature-flags

## Overview
- **Purpose**: Simple feature flag utilities backed by Upstash Redis.
- **Type**: Utility library.
- **Development Status**: Active with basic flag implementation.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `showBetaFeature`
- **Purpose**: Example boolean flag.
- **Usage Pattern**:
  ```ts
  if (await showBetaFeature(userId)) {
    // show feature
  }
  ```
- **Implementation Notes**: Uses Upstash Redis and caches results.

### Secondary Exports/Utilities

#### `getFlags`
- **Purpose**: Fetches all flags for a given user.
- **Usage Pattern**: Called on server side.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Exports sample flags and helper functions.
2. **lib/**
   - Contains Upstash client and caching logic.

### Implementation Patterns
- Environment variables for Upstash credentials loaded via `keys.ts`.
- Wraps Upstash REST API to store and retrieve flag state.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| flags | ^3.2.0 | Feature flag library | used to parse flag state |
| @vercel/toolbar | ^0.1.36 | Dev toolbar | for experimentation |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/analytics | Tracking flag usage | |
| @repo/auth | Determine user ID | |
| @repo/design | Optional UI for flags | |

## Consumption Patterns

### Current App Usage
- `app` gates experimental features using `showBetaFeature`.
- Admin dashboards may toggle flags through Upstash UI.

### Integration Best Practices
- Wrap flag checks in server-side functions to avoid exposing keys.
- Cache flag values for performance.

## Testing Strategy
- No automated tests yet.

## Known Issues & Limitations
- Hardcoded flag examples may not scale.
- Upstash limits may restrict high traffic usage.

## Recent Developments
- Added integration with analytics to track flag usage.
\n_Last Reviewed: 2025-06-04_
