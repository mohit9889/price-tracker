# Skill: Coder — Node.js / Express


## Language detection (TypeScript vs JavaScript)
Before writing any code, detect the project language:
- If `tsconfig.json` exists at the project root → **TypeScript**. Use
  `.ts` for all source files. Add proper type annotations to function
  signatures, request/response shapes, service interfaces, and
  middleware params.
- If no `tsconfig.json` but `package.json` has `typescript`, `ts-node`,
  or `tsx` in `devDependencies` → **TypeScript** (config may be in a
  parent dir or framework preset). Use `.ts`.
- Otherwise → **JavaScript**. Use `.js`. Follow the project's existing
  JSDoc or module conventions.
- **Never mix**: don't create `.ts` files in a JS project or `.js` files
  in a TS project without explicit permission.

## Architecture
- Controllers stay thin; business logic lives in a service layer, not in
  route handlers directly — match the existing layering if the project
  already has one (controller/service/repository, MVC, etc.).
- Every route has explicit input validation (Joi/zod/express-validator —
  match existing pattern) before touching the DB or business logic.
- Async route handlers are wrapped so rejected promises are caught (either
  a wrapper util or middleware) — never let an unhandled rejection crash
  the process silently.
- Centralized error-handling middleware; handlers throw/forward errors
  rather than constructing ad-hoc error responses inline everywhere.
- Use dependency injection or a clear module boundary (matches your DI
  container pattern from existing Jest/Babel projects) — don't reach
  directly into `require('../db')` from deep inside unrelated modules.

## Database & queries (see also database_rules.md)
- All queries go through the established data-access layer/ORM — no raw
  string-concatenated SQL ever (use parameterized queries / ORM methods).
- N+1 query patterns get flagged, not silently introduced.

## API contracts (see also api_contracts.md)
- Response shape is consistent across endpoints (status, data, error
  envelope) — match the existing contract before introducing variations.

## Hard rules
- Never log secrets, tokens, full request bodies containing passwords, or
  PII at info/debug level.
- Never trust `req.body`/`req.query`/`req.params` without validation.
