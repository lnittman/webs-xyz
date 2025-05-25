# App Documentation: app

## Overview
- **Purpose**: Primary Next.js frontend delivering the research UI and integrating AI summaries.
- **Business Value**: Provides users with an interface to enter URLs and read AI-enhanced content.
- **Development Status**: Active development with ongoing UI improvements.
- **Responsible Team/Owner**: Webs frontend team.

## Quick Reference
```yaml
name: app
version: N/A
status: active
primary_stack:
  - Next.js 15
  - React 19
  - TypeScript
key_dependencies:
  - @repo/design
  - @repo/auth
  - @repo/analytics
```

## Core Architecture

### Architectural Pattern
- Uses Next.js App Router with React functional components.
- Leverages shared design system for consistent UI.
- Middleware handles authentication and analytics.
- Data flows from API endpoints to client via React hooks.

### Core Modules
1. **app/**
   - Contains page routes and UI components.
   - Organized by route folders following Next.js conventions.
   - Integrates with shared packages for analytics and auth.
2. **src/**
   - Additional utilities and hooks.
   - Houses testing utilities and helper functions.

### State Management
- Uses React hooks and `jotai` for local state.
- No global state outside of React context providers.
- Session data retrieved via Clerk from `@repo/auth`.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| next | 15.3.0 | React framework | Uses App Router with server components |
| react | 19.1.0 | UI library | |
| @sentry/nextjs | ^9.12.0 | Error monitoring | Instrumentation via `instrumentation.ts` |
| fuse.js | ^7.1.0 | Fuzzy search | Used in search components |
| zod | ^3.24.2 | Schema validation | Validates API responses |

### Internal Package Dependencies
| Package | Usage Pattern | Integration Points | Notes |
|-----------|---------------|-------------------|-------|
| @repo/design | Components | UI components and theme providers | |
| @repo/auth | Authentication hooks | Clerk provider, session data | |
| @repo/analytics | Analytics tracking | Wraps pages in AnalyticsProvider | |
| @repo/feature-flags | Feature toggles | Conditional rendering of beta features | |
| @repo/observability | Sentry config | Client and server error logging | |

## Key Features

### Feature: URL Summarization
- Purpose and functionality: Allows user to enter a URL and view AI-generated summary.
- Implementation approach: Fetch data from `api` endpoints and display in UI.
- Key components involved: SummaryInput, SummaryView.
- Integration points: Uses API routes and AI outputs.
- Potential improvements: Add caching and offline mode.

### Feature: User Authentication
- Purpose and functionality: Enables sign-in and session management.
- Implementation approach: Utilizes Clerk components from `@repo/auth`.
- Key components involved: SignInButton, UserProfile.
- Integration points: Middleware and server actions.
- Potential improvements: Expand role-based access controls.

## Data Management
- Data sources: `api` app via REST/Next.js routes.
- API integration patterns: Fetch functions using `fetch` and React hooks.
- Data transformation: Minimal, mainly schema validation with `zod`.
- Caching strategies: Browser cache for repeated requests.
- Data validation: `zod` ensures expected shape of responses.

## UI/UX Architecture
- Components organized by route and feature folders.
- Styling via Tailwind from design system.
- Responsive design supported through utility classes.
- UI state managed with React hooks and context providers.
- Interaction patterns kept simple for mobile friendliness.

## Key Implementation Patterns
- Reusable components from design system.
- Custom hooks for data fetching and feature flags.
- Error boundaries and Sentry for error handling.
- Async operations handled with React Suspense where possible.
- Performance optimizations via lazy loading of components.

## Development Workflow
- `pnpm --filter app dev` to start local server on port 3000.
- Builds via `pnpm --filter app build`.
- Environment variables defined in `env.ts`.
- Debugging through Next.js dev tools and Sentry.

## Known Issues & Technical Debt
- Limited documentation for some internal hooks.
- Potential duplication of state management patterns across pages.
- Need for enhanced integration tests once test setup stabilizes.
- Some design tokens may be outdated with latest design system.

## Recent Developments
- Added additional sacred UI components through recent PRs.
- Refactored middleware to align with Next.js 15 conventions.
- Ongoing work on improving search functionality.
- Preparing for deeper integration with AI summaries.
