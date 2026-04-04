# @sola_mpd/domain (Temporary Compatibility Package)

This package is kept as a temporary compatibility layer during the migration to `@sola_mpd/shared`.

## Policy

- Source of truth for shared models/constants/utils is `packages/shared`.
- `packages/domain` is read-only for migration safety.
- Do not add new code, exports, or features to this package.
- Existing consumers should migrate to `@sola_mpd/shared` in the next refactoring PRs.
- This package is scheduled to be removed in PR-12 of `REFACTORING_PLAN.md`.
