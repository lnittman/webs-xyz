# Package Documentation: design

## Overview
- **Purpose**: Shared React component library implementing design tokens and shadcn/ui primitives.
- **Type**: UI component library.
- **Development Status**: Active with frequent updates.
- **Responsible Team/Owner**: Frontend/design team.

## API Documentation

### Primary Exports

#### `Button`, `Input`, etc.
- **Purpose**: Reusable UI components styled with Tailwind.
- **Usage Pattern**:
  ```tsx
  import { Button } from '@repo/design'
  ```
- **Implementation Notes**: Components built on Radix primitives.

### Secondary Exports/Utilities

#### `ThemeProvider`
- **Purpose**: Provides dark/light theme switching.
- **Usage Pattern**: Wrap root layout to enable theme selection.

## Internal Architecture

### Core Modules
1. **components/**
   - Contains individual component implementations.
2. **providers/**
   - Theme provider and other context components.

### Implementation Patterns
- Tailwind CSS with shadcn ui conventions.
- Composition using Radix UI primitives for accessibility.
- Utility classes with `class-variance-authority` for variants.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| @radix-ui/react-dialog | ^1.1.7 | Base dialog component | |
| lucide-react | ^0.488.0 | Icon set | |
| tailwindcss | ^4.1.3 | Styling | Dev dependency |

### Internal Package Dependencies
| Package | Usage Pattern | Notes |
|-----------|---------------|-------|
| @repo/analytics | Telemetry hooks | |
| @repo/auth | Auth components integration | |
| @repo/observability | Logging wrappers | |

## Consumption Patterns

### Current App Usage
- `app` uses components for UI pages.
- `email` templates reuse some simple components for styling.

### Integration Best Practices
- Consume via named imports from root index.
- Customize via Tailwind utility classes when needed.
- Keep variants consistent across apps.

## Testing Strategy
- Limited manual testing; future plan to use Storybook for visual testing.

## Known Issues & Limitations
- Component coverage incomplete for all design tokens.
- Some Radix primitives not yet wrapped.

## Recent Developments
- Added sacred components in recent PR.
- Refined theme provider and dark mode support.
