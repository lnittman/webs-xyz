# @repo/email

Version: 0.0.0

Shared email templates built with React Email. Provides components that can be sent via the API app.

## Key Files
- `templates/` – JSX email templates
- `index.ts` – exports helper to render templates
- `keys.ts` – environment variables for Vercel Blob storage

## Usage
```ts
import { ContactEmail } from '@repo/email/templates'
```
Use with `@repo/notifications` or API routes to send mail.
