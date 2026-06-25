# Skill: Release Management

Used by @security via `/release` workflow.

## Versioning
- Follow semver: patch (fixes), minor (new backward-compatible features),
  major (breaking changes) — determine the bump from the actual commit
  history/diff, not a guess.

## Changelog
- Generate entries from actual commits/PRs merged since the last release
  tag — never invent entries for changes that aren't verifiably in the
  diff.
- Group entries by type (Features, Fixes, Breaking Changes, Performance,
  Security) for readability.
- Breaking changes get explicit migration notes if any consumer-facing
  contract changed (see `api_contracts.md`).

## Pre-release checklist
1. Full test suite passes.
2. `/security-review` findings (if any critical/high) are resolved or
   explicitly accepted by the user.
3. Dependency audit clean or flagged issues accepted.
4. Documentation reflects the current state (README, API docs).
5. Version bumped in `package.json`/`pubspec.yaml` consistently.

## Hard constraints
- Never tag/publish a release with failing tests or unresolved critical
  security findings without explicit user override.
