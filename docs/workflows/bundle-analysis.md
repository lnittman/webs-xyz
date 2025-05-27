# Bundle Analysis Workflow

This guide describes how to monitor client bundle size for the Next.js apps and troubleshoot large bundles.

## Running the Analyzer

1. Execute `pnpm --filter app analyze` or `pnpm --filter api analyze` to build the app with bundle analysis enabled.
2. The command sets `ANALYZE=true` which activates `withAnalyzer` from `@repo/next-config`.
3. After the build completes, open `.next/analyze/client.html` in your browser to inspect bundle composition.

## Import Optimization Tips

- Prefer path-based imports to avoid bringing in entire libraries. For example, import icons from `@phosphor-icons/react/dist/ssr` rather than the package root.
- Check `client.html` for large dependencies and convert them to dynamic imports when possible.
- Lazy-load heavy modals such as `BrowserTabsModal` with `next/dynamic`.
  We've now implemented this for the modal, so bundle size work is largely complete. Focus can shift to new functional features in the apps.

Keeping bundles under **500KB** helps maintain fast page loads.

## Automated Check

Run `pnpm bundle:check` to build the `app` with analysis enabled and verify the bundle size. The script fails if `client.html` exceeds **500KB**.

## CI Enforcement

A GitHub Actions workflow named **Bundle Size Check** runs on every pull request. It installs dependencies, builds the app with analysis enabled, and fails if `pnpm bundle:check` reports a size above 500KB. The `client.html` report is uploaded as an artifact for inspection.
