# App Documentation: email

## Overview
- **Purpose**: Hosts React Email templates for transactional and marketing emails.
- **Business Value**: Enables consistent, branded email communication with users.
- **Development Status**: Maintenance with occasional new templates.
- **Responsible Team/Owner**: Growth/Marketing team.

## Quick Reference
```yaml
name: email
version: N/A
status: maintenance
primary_stack:
  - React Email
  - TypeScript
key_dependencies:
  - @repo/email
  - @react-email/components
  - resend
```

## Core Architecture

### Architectural Pattern
- Built with `react-email` CLI for preview and build.
- Templates are React components under `emails/`.
- Static exports generated for deployment.
- Minimal runtime logic; primarily compile-time rendering.

### Core Modules
1. **emails/**
   - Contains JSX components for each email template.
   - Organized by feature or event type.
2. **docs/**
   - Screenshots and guidelines for templates.

### State Management
- N/A – templates are static React components.

## Dependencies

### External Dependencies
| Dependency | Version | Purpose/Usage | Notes |
|------------|---------|--------------|-------|
| react-email | 4.0.7 | Email rendering engine | |
| @react-email/components | 0.0.36 | Base components | |
| react | 19.1.0 | JSX support | |

### Internal Package Dependencies
| Package | Usage Pattern | Integration Points | Notes |
|-----------|---------------|-------------------|-------|
| @repo/email | Shared helpers | Rendering and configuration | |

## Key Features

### Feature: Transactional Emails
- Purpose and functionality: Sends sign-up confirmations and receipts.
- Implementation approach: Templates defined in `emails/` and exported via `@repo/email` package.
- Integration points: Triggered by API webhooks or cron jobs.
- Potential improvements: Add localization support.

### Feature: Marketing Emails
- Purpose and functionality: Sends newsletters or announcements.
- Implementation approach: Similar to transactional but triggered via marketing platform.
- Key components involved: Newsletter template components.
- Integration points: Possibly integrated with analytics for open tracking.
- Potential improvements: Add A/B testing components.

## Data Management
- Data sources: API or marketing platforms supply data when rendering templates.
- API integration patterns: Functions call `renderEmail` from `@repo/email`.
- Data transformation: Template props typed with Zod schemas.
- Caching: None; templates compiled at build time.
- Data validation: Zod ensures prop shape.

## UI/UX Architecture
- Templates use consistent design from design system tokens.
- Styling inline for email client compatibility.
- Responsive design via React Email utilities.
- Interaction minimal: links and call-to-action buttons.

## Key Implementation Patterns
- Components imported from `@react-email/components`.
- Custom components reused across templates.
- Linting ensures accessibility attributes (not automatically run here).
- Build pipeline exports static HTML files for API usage.
- Example usage documented in `apps/email/docs`.

## Development Workflow
- `pnpm --filter email dev` to preview templates locally on port 3003.
- Build with `pnpm --filter email build` or `export` to generate static files.
- Templates stored in Git for version control.
- Previews updated in docs with screenshots.

## Known Issues & Technical Debt
- No automated tests for templates.
- Hardcoded styles could be abstracted for reuse.
- Need better documentation of marketing flows.
- Localization not yet implemented.

## Recent Developments
- Basic README added for template documentation.
- Additional templates planned for onboarding emails.
- Aligning styles with design updates.
- Considering integration with feature flags for targeted emails.
\n_Last Reviewed: 2025-06-04_
