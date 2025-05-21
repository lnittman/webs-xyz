# @repo/analytics

Version: 0.0.0

Utilities for capturing client analytics. Provides a React `AnalyticsProvider` that integrates PostHog, Google Analytics and Vercel Analytics.

## Key Files
- `index.tsx` – exports `AnalyticsProvider`
- `google.ts` – Google Analytics wrapper
- `posthog/` – PostHog client and server helpers
- `vercel.ts` – Vercel Analytics component
- `keys.ts` – environment variables validated with `zod`

## Usage
```tsx
import { AnalyticsProvider } from '@repo/analytics'
```
Wrap your app with `AnalyticsProvider` to enable telemetry.
