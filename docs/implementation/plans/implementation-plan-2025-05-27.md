# Implementation Plan: Monitor Bundle Size and Optimize Imports

## Selected Recommendation
- **Source**: repo-status-4.md
- **Priority**: High
- **Category**: Developer Experience
- **Estimated Time**: 1h

### Problem Statement
Dashboard features increased the bundle size over the 500KB target. Icon libraries were imported from their package root which pulls in unnecessary code. Developers need a repeatable workflow to inspect bundles and optimize imports.

### Success Criteria
- Bundle analysis instructions available in docs
- Heavy icon imports updated to path-based variants

## Selection Rationale
### Impact/Effort Analysis
- **Impact**: High
- **Effort**: Low
- **Risk**: Low
- **Score**: 8

### Stakeholder Impact
- **Developers**: Clear workflow to track bundle size and smaller client bundle
- **End Users**: Faster initial load
- **Operations**: No change
- **Business**: Supports performance goals

## Implementation Approach
### Pre-Implementation Checklist
- [ ] Current tests passing
- [ ] Backup/rollback plan documented
- [ ] Dependencies identified
- [ ] Team notified of changes

### Phases
1. **Update Imports** (10m)
   - Adjust `feedback-dropdown.tsx` and `user-menu.tsx` to import icons from `@phosphor-icons/react/dist/ssr`.
   - *Validation*: Build compiles without errors.
2. **Add Bundle Analysis Docs** (20m)
   - Create `docs/workflows/bundle-analysis.md` with steps to run the analyzer.
   - Link from `docs/workflows/README.md`.
   - *Validation*: Docs render in markdown preview.
3. **Log Update** (5m)
   - Append entry to `docs/state/development-log.md` summarizing the change.
   - *Validation*: Entry includes date and reference to repo-status-4.
4. **Create Summary Document** (5m)
   - Summarize implementation results in `docs/implementation/summaries/implementation-summary-2025-05-27.md`.
   - *Validation*: Summary references success criteria.

## Testing Strategy
- Manual check of Next.js build with `pnpm --filter app build` using `ANALYZE=true`.

## Risk Mitigation
- **Risk**: Build errors from incorrect import paths (L:Low I:Low). *Mitigation*: Run build locally before commit.

### Rollback Plan
- Revert modified files via git if issues occur.

## Communication Plan
- Notify team via PR.
- Request review from a peer.
