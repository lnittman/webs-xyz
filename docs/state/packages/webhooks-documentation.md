# Package Documentation: webhooks

## Overview
- **Purpose**: Simplified wrapper for sending events through Svix.
- **Type**: Utility package.
- **Development Status**: Stable with minimal API.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `webhooks`
- **Purpose**: Preconfigured Svix client helper.
- **Usage Pattern**:
  ```ts
  await webhooks.send('event.type', payload)
  ```
- **Implementation Notes**: Reads API key from environment variables.

### Secondary Exports/Utilities
None.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Exports helper functions for Svix client.
2. **lib/svix.ts**
   - Configures Svix instance.

### Implementation Patterns
- Server-only code with environment variable validation.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| svix | ^1.64.0 | Webhook service client | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/auth | Retrieve auth tokens | |

## Consumption Patterns

### Current App Usage
- `api` uses `webhooks` to send events to external services.

### Integration Best Practices
- Ensure proper error handling and retries when delivering webhooks.

## Testing Strategy
- Manual testing by triggering events.

## Known Issues & Limitations
- Limited to Svix capabilities.

## Recent Developments
- Initial wrapper implemented with basic send helper.
\n_Last Reviewed: 2025-06-04_
