# Dashboard Components

This directory contains modular, reusable components for the main dashboard page, following Next.js 15 and React 19 best practices.

## Architecture

The dashboard has been broken down into the following components:

### Core Components

- **`Dashboard`** - Main orchestrating component that manages state and coordinates all sub-components
- **`DashboardLayout`** - Handles responsive layout logic for different screen sizes
- **`NavigationToolbar`** - Search bar, filters, and controls
- **`WebsGrid`** - Responsive grid/list display of web items

### Web Display Components

- **`WebCard`** - Individual web item display (supports both grid and list variants)
- **`EmptyState`** - Displayed when no webs exist
- **`SearchEmptyState`** - Displayed when search returns no results

### Sidebar Components (Wide Layout Only)

- **`ContextSidebar`** - Container for all sidebar panels
- **`AIActivityFeed`** - Real-time AI agent activity display
- **`RecentWebsPanel`** - Recently created webs
- **`TopDomainsPanel`** - Domain statistics
- **`SystemInfoPanel`** - System status and configuration

## Supporting Files

### Utilities
- **`/lib/dashboard-utils.ts`** - Utility functions (domain extraction, time formatting)
- **`/hooks/use-dashboard.ts`** - Custom hook for dashboard state management

### Types
- **`/types/dashboard.ts`** - TypeScript interfaces and types

## Usage

```tsx
import { Dashboard } from '@/components/dashboard';

export default function Page() {
  return (
    <Dashboard
      webs={webs}
      workspaceId={workspaceId}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onModelChange={handleModelChange}
      selectedModelId={selectedModelId}
    />
  );
}
```

## Key Features

### React 19 Best Practices
- Uses `useMemo` for expensive computations
- Proper component composition and separation of concerns
- TypeScript strict typing throughout
- Optimized re-renders with proper dependency arrays

### Responsive Design
- **Mobile** (< 768px): List view with simplified layout
- **Desktop** (768px - 1399px): 2-column grid, centered
- **Wide** (1400px+): 3-column grid with context sidebar

### Performance Optimizations
- Memoized derived state calculations
- Efficient filtering and sorting
- Minimal prop drilling through proper component hierarchy

### Accessibility
- Semantic HTML structure
- Proper keyboard navigation
- Screen reader friendly
- Focus management

## Component Hierarchy

```
Dashboard
├── PromptBar (from shared)
├── NavigationToolbar
└── DashboardLayout
    ├── WebsGrid
    │   ├── WebCard (multiple)
    │   ├── EmptyState
    │   └── SearchEmptyState
    └── ContextSidebar (wide layout only)
        ├── AIActivityFeed
        ├── RecentWebsPanel
        ├── TopDomainsPanel
        └── SystemInfoPanel
``` 