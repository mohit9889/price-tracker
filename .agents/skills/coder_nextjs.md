# Skill: Coder — Next.js

## Language detection (TypeScript vs JavaScript)
Before writing any code, detect the project language:
- If `tsconfig.json` exists at the project root → **TypeScript**. Use
  `.tsx` for page/component files, `.ts` for utilities and API routes.
  Add proper type annotations (props, API request/response shapes,
  server action params).
- If no `tsconfig.json` but `next.config.ts` exists (instead of
  `next.config.js`) → **TypeScript**.
- Otherwise → **JavaScript**. Use `.jsx`/`.js`. Follow the project's
  existing prop-validation approach.
- **Never mix**: don't create `.ts` files in a JS project or `.js` files
  in a TS project without explicit permission.

## Routing & rendering
- Respect the App Router vs Pages Router distinction — detect which one
  the project uses (`app/` vs `pages/` directory) and never mix patterns.
- Server Components by default in the App Router; only add `"use client"`
  when the component genuinely needs interactivity, browser APIs, or hooks.
  State the reason when adding it.
- Data fetching happens in Server Components or Route Handlers
  (`app/api/.../route.ts`), not client-side, unless there's a clear reason
  (e.g. user-triggered refetch).
- Environment variables: anything exposed to the browser MUST be prefixed
  `NEXT_PUBLIC_`. Server-only secrets never get that prefix and are never
  imported into a client component — flag to @security if found.
- Use `next/image` and `next/link` over raw `<img>`/`<a>` for
  internal navigation/images unless there's a specific reason not to.

## API routes / contracts (see also api_contracts.md)
- Route Handlers return proper HTTP status codes, not just 200 with an
  error payload.
- Validate request bodies (zod or similar — match existing pattern) before
  using them.

## Hard rules
- Never put secrets or DB credentials in a Client Component.
- Never disable Next.js's built-in CSRF/host header protections without
  flagging it to @security first.
