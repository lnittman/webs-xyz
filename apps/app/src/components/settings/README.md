# Settings Components Architecture

This directory contains the modularized settings page components, following Next.js best practices.

## Architecture Overview

### Component Structure

```
settings/
├── index.tsx                 # Main Settings component (client)
├── settings-layout.tsx       # Layout with sidebar navigation
├── settings-navigation.ts    # Navigation configuration
├── settings-content.tsx      # Content router component
├── general-settings.tsx      # General settings section
├── appearance-settings.tsx   # Appearance settings section
├── data-settings.tsx        # Data management section
├── notification-settings.tsx # Notification settings section
└── README.md                # This file
```

### Data Flow

1. **Server Component Page** (`/app/(authenticated)/settings/page.tsx`)
   - Simple server component that renders the Settings client component
   - No data fetching or prop drilling

2. **Main Settings Component** (`index.tsx`)
   - Client component that manages font application
   - Renders layout and content components

3. **Settings Sections**
   - Each section is a separate client component
   - Use SWR hooks for data fetching (`useUserSettings`)
   - Call server actions directly for mutations
   - Handle their own loading and error states

4. **Server Actions** (`/app/actions/user-settings/`)
   - `update-settings.ts` - Updates user settings via service
   - `export-data.ts` - Exports user data via service
   - `clear-data.ts` - Clears all user data via service
   - All actions use services, never direct database access

5. **Services** (`/packages/api/services/`)
   - `user-settings.ts` - Handles all database operations
   - Server-only modules with proper validation

6. **API Routes** (`/app/api/user-settings/`)
   - Used by SWR for client-side data fetching
   - Also use services for database access

## Usage

```tsx
// In a page component (server component)
import { Settings } from '@/components/settings';

export default function SettingsPage() {
  return <Settings />;
}
```

## Key Patterns

### Clean Architecture

```
Page (Server Component)
  ↓
Settings (Client Component)
  ↓
Settings Layout + Content
  ↓
Individual Setting Sections
  ↓
SWR Hooks + Server Actions
  ↓
Services
  ↓
Database
```

### Direct Server Action Usage in Components

```typescript
import { updateUserSettings } from '@/app/actions/user-settings';
import { useUserSettings } from '@/hooks/user-settings/queries';

// In component
const { settings, mutate } = useUserSettings();

const handleUpdate = async (updates) => {
  // Optimistic update
  await mutate({ ...settings, ...updates }, false);
  
  // Call server action
  const result = await updateUserSettings(updates);
  
  if ('error' in result) {
    // Revert on error
    await mutate();
    throw new Error(result.error);
  }
  
  // Revalidate
  await mutate();
};
```

### Benefits

1. **Clean Separation**: Server components stay simple
2. **No Prop Drilling**: Client components fetch their own data
3. **Type Safety**: End-to-end TypeScript support
4. **Optimistic Updates**: Immediate UI feedback
5. **Server Validation**: Using Zod schemas in services
6. **Proper Architecture**: Actions use services, not direct DB access
7. **Modular**: Each settings section is independent

### Best Practices

1. Keep pages as simple server components
2. Use SWR for data fetching in client components
3. Call server actions directly (no wrapper hooks)
4. Server actions always use services
5. Services handle all database operations
6. Validate data in services with Zod
7. Handle loading and error states in components
8. Each settings section manages its own state

### Adding New Settings Sections

1. Add navigation item to `settings-navigation.ts`
2. Create new component file (e.g., `security-settings.tsx`)
3. Add case to `settings-content.tsx` switch statement
4. Create server actions if needed in `/app/actions/user-settings/`
5. Update services if new database operations are needed 