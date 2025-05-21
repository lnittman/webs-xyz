# @repo/security

Version: 0.0.0

Arcjet based helpers for bot detection and request verification.

## Key Files
- `index.ts` – exposes `secure` function
- `middleware.ts` – Next.js middleware integration
- `keys.ts` – Arcjet key configuration

## Usage
```ts
await secure(['bot']);
```
Call inside API routes or middleware to enforce security rules.
