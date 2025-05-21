# @repo/testing

Version: 0.0.0

Vitest configuration shared across packages. Provides React test environment and path aliases.

## Key Files
- `index.js` – exports a `defineConfig` setup for Vitest
- `tsconfig.json` – references base TS config

## Usage
```js
import config from '@repo/testing'
```
Extend this config in each package's `vitest.config.ts`.
