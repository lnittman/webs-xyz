# Package Documentation: auth

## Overview
- **Purpose**: Wrapper around Clerk authentication providing React components and middleware.
- **Type**: Authentication library for Next.js apps.
- **Development Status**: Active.
- **Responsible Team/Owner**: Platform team.

## API Documentation

### Primary Exports

#### `AuthProvider`
- **Purpose**: Provides Clerk context to React components.
- **Usage Pattern**:
  ```tsx
  <AuthProvider>{children}</AuthProvider>
  ```
- **Implementation Notes**: Wraps Clerk's `ClerkProvider` with environment keys.

#### `SignInButton`
- **Purpose**: Prebuilt sign-in component.
- **Usage Pattern**:
  ```tsx
  <SignInButton mode="modal" />
  ```
- **Implementation Notes**: Re-exported from Clerk library.

### Secondary Exports/Utilities

#### `requireAuth`
- **Purpose**: Middleware helper to enforce authentication.
- **Usage Pattern**: Used in API route handlers to check session.
- **Implementation Notes**: Throws 401 if session missing.

## Internal Architecture

### Core Modules
1. **provider.tsx**
   - Wraps and configures Clerk provider.
2. **middleware.ts**
   - Request validation for server routes.
3. **components/**
   - Re-export of Clerk UI components.

### Implementation Patterns
- Zod for environment variable validation.
- Server/client separation for Node and browser utilities.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @clerk/nextjs | ^6.14.3 | Authentication provider | |
| @clerk/themes | ^2.2.31 | Default Clerk UI themes | |
| next-themes | ^0.4.6 | Theme switching | used by components |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/typescript-config | TS config | Dev dependency |

## Consumption Patterns

### Current App Usage
- `app` uses `AuthProvider` to wrap layout and sign-in components.
- `api` uses middleware to protect sensitive routes.

### Integration Best Practices
- Ensure environment keys for Clerk are defined in `.env` files.
- Limit server-side usage of Clerk to avoid heavy bundle size on client.

## Testing Strategy
- No dedicated unit tests yet; relies on Clerk integration tests.

## Known Issues & Limitations
- Some components may require custom styling to match design system.
- Server-only usage is limited by Clerk's API.

## Recent Developments
- README created detailing provider usage.
- Upgraded Clerk packages to latest versions.
