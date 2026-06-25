# Skill: Dependency Management

## Objective
Manage package additions, updates, and audits responsibly — never as a
silent side effect of an unrelated task.

## Rules
- Adding a new dependency requires explicit user approval. State why it's
  needed and what alternative (writing it yourself, an existing dep that
  already covers it) was considered first.
- Before adding, check: is it actively maintained (recent commits/releases),
  reasonably popular, and does it have a compatible license for the
  project?
- Version pinning: match the existing project convention (exact versions
  vs caret ranges) — don't introduce a different pinning style.
- When asked to update dependencies:
  - Run the audit tool for the stack (`npm audit` / `flutter pub outdated`)
    and report findings before making changes.
  - Distinguish patch/minor (generally safe) from major (breaking changes
    likely — read the changelog, flag specific breaking changes) updates.
  - Update and run the full test suite before declaring success.
- Never remove a dependency that's still imported somewhere in the
  codebase without confirming it's truly unused (search the whole repo,
  not just the obvious files).

## Stack notes
- **Node/Express, React, Next.js**: `npm audit` / `npm outdated`; check
  `package-lock.json` is updated consistently with `package.json`.
- **Flutter**: `flutter pub outdated`; check `pubspec.lock` consistency;
  watch for platform-specific breaking changes (iOS/Android) in major
  version bumps of plugins.
