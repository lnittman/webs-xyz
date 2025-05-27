# Integration Testing Guidelines

These guidelines explain how to set up and run integration tests within the `webs` monorepo. Integration tests validate interactions between apps and packages without requiring full end-to-end environments.

## Setup
1. Ensure dependencies are installed with `pnpm install` at the repo root.
2. Start any required services locally (e.g. database) using `pnpm dev` or the individual app commands.
3. Integration tests rely on Vitest. Each app has a `vitest.config.ts` configured for Node and Next.js environments.

## Running Tests
- To run integration tests for a specific app, execute `pnpm --filter <app> test`.
- To run all tests across the repo, use `pnpm test`.
- Tests live under an `__tests__/` directory at the app or package level. Naming files with `.test.ts` or `.test.tsx` keeps them isolated from production code.

## Best Practices
- Mock external HTTP requests and services to keep tests fast and deterministic.
- Prefer interacting with public APIs rather than internal module internals.
- Use helper functions to create common test data and reduce boilerplate.
- Clean up any temporary resources (files, database records) created during tests.

Following these practices will help keep integration tests reliable and easy to maintain.
