# Package Documentation: notifications

## Overview
- **Purpose**: Wrapper around Knock API providing server and client notification utilities.
- **Type**: UI/Utility library.
- **Development Status**: Active for sending events and rendering feeds.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `notifications`
- **Purpose**: Preconfigured Knock client instance.
- **Usage Pattern**:
  ```ts
  import { notifications } from '@repo/notifications'
  await notifications.workflows.trigger('welcome', { recipient: userId })
  ```
- **Implementation Notes**: Reads API key via environment variable.

#### `NotificationFeed`
- **Purpose**: React component showing in-app notification feed.
- **Usage Pattern**: `<NotificationFeed userId={id} />`

### Secondary Exports/Utilities
None.

## Internal Architecture

### Core Modules
1. **index.ts**
   - Sets up Knock client and exports feed component.
2. **components/**
   - React components for notification lists.

### Implementation Patterns
- Uses Knock React SDK for real-time updates.
- Zod ensures environment variables for Knock keys.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @knocklabs/node | ^0.6.19 | Server API client | |
| @knocklabs/react | ^0.7.3 | React components | |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | dev dependency |

## Consumption Patterns

### Current App Usage
- `app` imports `NotificationFeed` for user inbox.
- `api` triggers workflows when events occur.

### Integration Best Practices
- Handle errors from Knock API gracefully.
- Provide userId when rendering feed component.

## Testing Strategy
- Manual testing in staging environment.

## Known Issues & Limitations
- Limited to features provided by Knock service.

## Recent Developments
- README created with basic examples.
