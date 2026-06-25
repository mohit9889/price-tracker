# Skill: Tester — Node.js / Express

This mirrors the conventions from your existing Node.js BSC Test Optimizer
port: Jest/Babel, supertest, shared node-fetch mock, DI container pattern.

## Conventions
- Use `supertest` against the app instance for route/integration tests;
  use plain Jest unit tests for service/utility logic in isolation.
- Network calls go through the canonical shared `node-fetch` mock — do not
  create one-off mocks per test file if a shared factory already exists.
- Middleware gets a canonical mock factory (auth, error-handling, etc.) —
  reuse it rather than re-stubbing per test.
- DI container: inject mocked dependencies through the existing container
  pattern, not via `jest.mock()` module-path hacks, when the project has a
  DI container set up.

## Executors (match your existing per-class-type strategy)
- **Unit executor**: pure functions/services, no I/O, fully mocked deps.
- **NETWORK executor**: anything making outbound HTTP calls — always
  through the shared fetch mock, dedicated test file.
- **Integration executor**: full Express app lifecycle (start app, hit
  routes via supertest, teardown) — kept separate from unit tests so the
  split gate (below) can isolate slow suites.

## Coverage floor
- 80% statements / 75% branches minimum.

## Split gate
- Runtime > 60s for a suite → split by executor type (unit / network /
  integration) rather than arbitrarily. Requires explicit confirmation
  before splitting, same as your existing rule.

## Hard constraints
- No changes to `src/` implementation files.
- Evidence-only: don't assert behavior not confirmed by reading the
  actual route/service code.
- No inference about endpoints/contracts that aren't in the code — if
  something's ambiguous, ask rather than guess.
