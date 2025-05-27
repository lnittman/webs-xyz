# Bundle Analysis Workflow

This guide describes how to monitor client bundle size for the Next.js apps and troubleshoot large bundles.

## Running the Analyzer

1. Execute `pnpm --filter app analyze` or `pnpm --filter api analyze` to build the app with bundle analysis enabled.
2. The command sets `ANALYZE=true` which activates `withAnalyzer` from `@repo/next-config`.
3. After the build completes, open `.next/analyze/client.html` in your browser to inspect bundle composition.

## Import Optimization Tips

- Prefer path-based imports to avoid bringing in entire libraries. For example, import icons from `@phosphor-icons/react/dist/ssr` rather than the package root.
- Check `client.html` for large dependencies and convert them to dynamic imports when possible.

Keeping bundles under **500KB** helps maintain fast page loads.
