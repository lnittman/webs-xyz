# @repo/auth

Version: 0.0.0

Wrapper around Clerk authentication for both client and server. Includes React components and middleware helpers.

## Key Files
- `provider.tsx` – Clerk provider for Next.js
- `client.ts` – re-export of Clerk client utilities
- `middleware.ts` – request validation helpers
- `keys.ts` – environment variables for Clerk API

## Usage
```tsx
import { SignInButton } from '@repo/auth/components'
```
Use the exported components and hooks wherever authentication is required.
