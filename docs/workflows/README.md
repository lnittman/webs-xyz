# Development Workflows

## Setup
1. `pnpm install`
2. `pnpm dev` to start all apps concurrently.

## Adding a New Package
1. Run `pnpm create turbo` or copy an existing package folder.
2. Update `pnpm-workspace.yaml` and relevant tsconfig paths.

## Deployment
Deployment is handled via Vercel for apps. The AI app uses Mastra's deployer.
