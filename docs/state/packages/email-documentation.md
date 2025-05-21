# Package Documentation: email

## Overview
- **Purpose**: Shared email templates built with React Email and utilities for sending through Resend.
- **Type**: UI/Utility library.
- **Development Status**: Active for templates.
- **Responsible Team/Owner**: Growth/Marketing team.

## API Documentation

### Primary Exports

#### `renderEmail`
- **Purpose**: Helper to render a JSX template to HTML.
- **Usage Pattern**:
  ```ts
  const html = await renderEmail(<ContactEmail {...props} />)
  ```
- **Implementation Notes**: Wraps React Email `render` with Resend integration.

### Secondary Exports/Utilities

#### `templates`
- **Purpose**: Collection of named template components.
- **Usage Pattern**: `import { ContactEmail } from '@repo/email/templates'`

## Internal Architecture

### Core Modules
1. **templates/**
   - React components for each email type.
2. **index.ts**
   - Exports render helpers and template registry.

### Implementation Patterns
- React components built using `@react-email/components`.
- Environment variables define Resend API key and blob storage token.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| react-email | 4.0.7 | Rendering engine | |
| resend | ^4.2.0 | Email sending | |
| react | 19.1.0 | JSX runtime | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | Dev dependency |

## Consumption Patterns

### Current App Usage
- `email` app uses templates for preview and export.
- `api` app imports render functions to send mail on events.

### Integration Best Practices
- Keep templates simple and inline styles for compatibility.
- Use environment variables to configure Resend credentials.

## Testing Strategy
- Manual previews via `email dev` command.

## Known Issues & Limitations
- No automated tests.
- Styling differences across email clients.

## Recent Developments
- Added README outlining basic usage.
- Integrated with design system styles where possible.
