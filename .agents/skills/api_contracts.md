# Skill: API Contracts

Used by @coder when designing or modifying endpoints, across backend and
frontend.

## Rules
- Match the existing response envelope shape (e.g. `{ data, error }` or
  whatever the project already uses) — don't introduce a new shape for
  just one endpoint.
- HTTP status codes are meaningful: 2xx for success, 4xx for client error
  (validation, auth, not-found), 5xx only for genuine server faults — not
  a blanket 200 with an error message in the body.
- Breaking changes to an existing endpoint's request/response shape
  require explicit flagging — these affect every consumer (web app,
  Flutter app, other services) silently if not called out.
- Versioning: if the project has an API versioning scheme, follow it for
  breaking changes rather than mutating an existing version's contract.
- Input validation happens at the boundary (route/controller level)
  before business logic runs — reject invalid input early with a clear
  error message.

## Cross-stack consistency
- When the same API is consumed by both a Next.js/React frontend and a
  Flutter app, the contract is the single source of truth for both — if
  you change it for one consumer's convenience, update the contract
  documentation and flag the other consumer(s) that need updating too.
