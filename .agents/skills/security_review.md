# Skill: Security Review

## Scope
Run when explicitly requested (`/security-review`) or before a release
(`release_management.md` workflow).

## Universal checks
- Hardcoded secrets/API keys/credentials anywhere in source (not just
  `.env` — also check config files, test fixtures, comments).
- User input reaching a database query, shell command, file path, or
  HTML output without validation/sanitization.
- Authentication/authorization checks present on every route or screen
  that should require them — not just the "main" ones.
- Dependencies with known critical/high CVEs (cross-reference with
  `dependency_management.md`).

## React / Next.js specific
- `dangerouslySetInnerHTML` usage — confirm input is sanitized.
- Secrets accidentally exposed via `NEXT_PUBLIC_` prefix or bundled into
  client code.
- Missing CSRF protection on state-changing API routes.

## Node / Express specific
- SQL/NoSQL injection via string concatenation instead of parameterized
  queries/ORM methods.
- Missing rate limiting on auth endpoints (login, password reset).
- CORS configured wider than necessary (`*` in production).
- JWT/session secrets that are weak, hardcoded, or committed.

## Flutter specific
- API keys or signing credentials bundled into the app (visible via
  decompilation) instead of fetched server-side or properly secured.
- Insecure storage of sensitive data (using `shared_preferences` instead
  of secure storage for tokens/credentials).
- Certificate pinning / TLS verification not disabled for convenience and
  left that way.

## Reporting
- Severity-rank findings (critical/high/medium/low) rather than a flat
  list.
- Propose the fix and its tradeoff — never silently weaken a security
  control (disabling a check, widening permissions) to make a finding
  "go away."
