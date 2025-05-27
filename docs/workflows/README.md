# Development Workflows

## Setup
1. `pnpm install`
2. `pnpm dev` to start all apps concurrently.

## Adding a New Package
1. Run `pnpm create turbo` or copy an existing package folder.
2. Update `pnpm-workspace.yaml` and relevant tsconfig paths.

## Deployment
Deployment is handled via Vercel for apps. The AI app uses Mastra's deployer.

## Bundle Analysis
See [bundle-analysis.md](./bundle-analysis.md) for steps to inspect client bundle sizes and optimize imports. Use `pnpm bundle:check` for a local size check. A CI workflow runs this command on every pull request and uploads the report if the threshold is exceeded.
