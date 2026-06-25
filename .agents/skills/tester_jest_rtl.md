# Skill: Tester — Jest + React Testing Library

## Scope
Applies to React and Next.js projects. For Next.js API/Route Handlers,
also cross-reference `tester_node_express.md` conventions for the backend
portion.

## Conventions
- Test behavior, not implementation. Query by role/text/label
  (`getByRole`, `getByLabelText`) over `getByTestId` unless there's no
  accessible alternative.
- One logical assertion-group per `it()`/`test()`. Don't cram unrelated
  assertions into one giant test.
- Mock network calls at the boundary (MSW, or a shared fetch mock) —
  never let tests hit a real network or real backend.
- Snapshot tests are used sparingly, only for stable, low-churn output —
  not as a substitute for real assertions.

## Coverage floor
- 80% statements / 75% branches minimum, matching your existing Node
  project standard. If a PR drops below this, flag it — don't silently
  lower the bar.

## Split gate
- If a single test file's full suite runtime exceeds 60 seconds, split it
  into focused files by concern rather than one growing monolith. Do not
  perform this split without flagging it first — same explicit-token
  discipline as your existing Java/Node split-gate rule.

## Hard constraints
- No changes to `src/`/`app/`/`pages/` implementation files — that's
  @coder's or @debugger's job. You only write/modify test files.
- No invented assertions about behavior you haven't verified by reading
  the actual implementation — evidence-only, same as your existing rule
  set.
