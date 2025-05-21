# @repo/feature-flags

Version: 0.0.0

Simple feature flag utilities built on Upstash Redis. Export helpers to define and check boolean flags.

## Key Files
- `index.ts` – defines sample `showBetaFeature` flag
- `lib/` – helper functions
- `access.ts` – user access rules
- `keys.ts` – Upstash credentials

## Usage
```ts
import { showBetaFeature } from '@repo/feature-flags'
```
Use inside apps to gate beta features.
