# Package Documentation: testing

## Overview
- **Purpose**: Shared Vitest configuration and utilities for React testing.
- **Type**: Configuration package.
- **Development Status**: Stable.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `defineConfig`
- **Purpose**: Extends Vitest's config with shared settings.
- **Usage Pattern**:
  ```js
  import config from '@repo/testing'
  export default config
  ```
- **Implementation Notes**: Sets up React environment and path aliases.

### Secondary Exports/Utilities
None.

## Internal Architecture

### Core Modules
1. **index.js**
   - Exports default Vitest config.
2. **tsconfig.json**
   - TypeScript settings for tests.

### Implementation Patterns
- Uses `@vitejs/plugin-react` for JSX support.
- Designed to be extended by each package's `vitest.config.ts`.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| vitest | ^3.1.1 | Test runner | |
| @vitejs/plugin-react | ^4.3.4 | React plugin | |

### Internal Package Dependencies
None.

## Consumption Patterns

### Current App Usage
- `app` and `api` extend this config in their own vitest setups.

### Integration Best Practices
- Place tests under `__tests__` directory.
- Run via `pnpm --filter <app> test`.

## Testing Strategy
- Provides basic jsdom environment for React tests.

## Known Issues & Limitations
- None identified.

## Recent Developments
- Initial configuration stable with latest Vitest version.
\n_Last Reviewed: 2025-06-04_
