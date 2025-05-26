# Integration Testing Workflow

This repository uses Vitest for integration tests. Tests live under `tests/integration` and run with Node environment.

## Running Tests
```bash
pnpm integration:test
```

## Adding Tests
1. Create a new file in `tests/integration/` with a `.test.ts` extension.
2. Import route handlers or utilities from the apps you want to test.
3. Write tests using Vitest assertions.

Integration tests should exercise interactions between apps, such as API endpoints used by the frontend. They do not run by default with `pnpm test`.
