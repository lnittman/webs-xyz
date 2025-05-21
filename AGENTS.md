# AGENTS

## Overview
This repository "webs" is a turborepo monorepo containing all services and packages required to build the project. It is intended as a minimal AI-native web research platform that replaces a traditional browser. Apps provide the user interface, API layer, and AI integrations. Packages provide shared libraries such as design-system, analytics and auth.

## Dev Environment
- **Node**: `>=18`
- **Package manager**: `pnpm` (version declared in `package.json`)
- **Tooling**: turborepo (`turbo`), TypeScript, Next.js, and Mastra for AI.
- Clone the repo and run `pnpm install` at the root.
- Use `pnpm dev` to start all apps for local development.
- Individual apps can be started with `pnpm --filter <app> dev`.

## Testing Instructions
No tests should be executed automatically. To run tests manually use `pnpm --filter <app> test` or `pnpm test` to run across the repo. Vitest is configured for unit testing.

## Code Standards
- Code is formatted with Biome (see `biome.json`).
- All packages use TypeScript strict mode. Follow existing folder structures.
- Prefer functional components and hooks in React apps.

## PR Instructions
1. Create a feature branch and commit changes.
2. Run local checks (lint, tests) if needed.
3. Open a Pull Request with a clear description of the changes.
4. Ensure all tasks in AGENTS docs are respected.

## Key Files
- `turbo.json` – turborepo task configuration.
- `pnpm-workspace.yaml` – workspace package list.
- `apps/*` – application entry points.
- `packages/*` – shared libraries.

## Integration Points
Apps consume shared packages via workspace protocol. The `api` app exposes endpoints consumed by the `app` frontend. The `ai` app handles AI workflows using Mastra. Common utilities like logging or authentication are imported from packages.
