# Package Documentation: typescript-config

## Overview
- **Purpose**: Shared TypeScript configuration files for apps and packages.
- **Type**: Configuration package.
- **Development Status**: Stable.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `base.json`, `nextjs.json`, `react-library.json`
- **Purpose**: Predefined tsconfig presets.
- **Usage Pattern**: Extend in `tsconfig.json`.
  ```json
  {
    "extends": "@repo/typescript-config/base.json"
  }
  ```

### Secondary Exports/Utilities
None.

## Internal Architecture

### Core Modules
1. **base.json**
   - Core compiler options.
2. **nextjs.json**
   - Settings for Next.js apps.
3. **react-library.json**
   - Settings for React packages.

### Implementation Patterns
- Strict mode enabled by default.
- Path aliases defined for workspace packages.

## Dependencies
None.

## Consumption Patterns

### Current App Usage
- All apps and packages extend one of these configs.

### Integration Best Practices
- Keep tsconfig minimal and override only when necessary.

## Testing Strategy
- None (configuration files).

## Known Issues & Limitations
- Must stay in sync with TypeScript version upgrades.

## Recent Developments
- Initial version stable across repo.
