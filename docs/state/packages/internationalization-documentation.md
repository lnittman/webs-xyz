# Package Documentation: internationalization

## Overview
- **Purpose**: Locale detection and dictionary loading using Languine.
- **Type**: Localization utility.
- **Development Status**: Active with base languages defined.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `getDictionary`
- **Purpose**: Loads translation dictionary for given locale.
- **Usage Pattern**:
  ```ts
  const dict = await getDictionary('en')
  ```
- **Implementation Notes**: Reads JSON files from `dictionaries/`.

### Secondary Exports/Utilities

#### `locales`
- **Purpose**: List of supported locales.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Exports `getDictionary` and supported locales.
2. **middleware.ts**
   - Next.js middleware to detect locale and route accordingly.

### Implementation Patterns
- Utilizes `negotiator` to parse Accept-Language headers.
- Languine CLI handles translation file management.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| next-international | ^1.3.1 | Client side i18n | |
| negotiator | ^1.0.0 | Parses request headers | |
| @formatjs/intl-localematcher | ^0.6.1 | Locale matching | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | Dev dependency |

## Consumption Patterns

### Current App Usage
- `app` uses `getDictionary` to load translations in `generateMetadata`.

### Integration Best Practices
- Keep dictionaries small for faster loads.
- Use dynamic imports for lazy loading language data.

## Testing Strategy
- Manual verification of locale switch.
- Languine provides CLI checks for translation completeness.

## Known Issues & Limitations
- Only a few languages available.
- Middleware approach may not support edge caching.

## Recent Developments
- README added outlining dictionary structure.
