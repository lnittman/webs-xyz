# @repo/internationalization

Version: 0.0.0

Locale detection and dictionary loading using `languine`. Provides `getDictionary` helper.

## Key Files
- `index.ts` – dictionary loader and locale list
- `dictionaries/` – JSON translation files
- `middleware.ts` – Next.js middleware for locale handling
- `languine.json` – configuration for languages

## Usage
```ts
import { getDictionary } from '@repo/internationalization'
```
Call within `generateMetadata` or pages to fetch translations.
