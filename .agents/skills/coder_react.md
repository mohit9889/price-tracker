# Skill: Coder — React

## Conventions
- Functional components + hooks only. No class components unless the
  existing codebase already uses them extensively.

## Language detection (TypeScript vs JavaScript)
Before writing any code, detect the project language:
- If `tsconfig.json` exists at the project root → **TypeScript**. Use
  `.tsx` for components, `.ts` for non-JSX files. Add proper type
  annotations to props, state, hooks, and function return types.
- If no `tsconfig.json` but `package.json` has `typescript` in
  `devDependencies` → **TypeScript** (config may be in a parent dir
  or framework preset). Use `.tsx`/`.ts`.
- Otherwise → **JavaScript**. Use `.jsx` for components, `.js` for
  utilities. If the project uses PropTypes, follow that convention
  for prop validation.
- **Never mix**: don't create `.ts` files in a JS project or `.js` files
  in a TS project without explicit permission.

## Code style
- Co-locate component, styles, and test file unless the project structure
  says otherwise (check for an existing pattern first — do not impose one).
- Props are typed (TypeScript interface/type, or PropTypes if the project
  is plain JS — match what's already there).
- No inline anonymous functions passed as props in lists/maps if it causes
  avoidable re-renders of expensive children — use `useCallback` there,
  but don't cargo-cult it everywhere.
- State lives at the lowest common owner; lift only when actually shared.
- Side effects go in `useEffect` with a complete, honest dependency array
  — no suppressing the exhaustive-deps lint rule without a comment
  explaining why.

## Database / data-fetching (see also database_rules.md, api_contracts.md)
- React components never talk to a database directly. They call an API
  layer (fetch/axios/react-query/SWR — match existing pattern).
- Loading and error states are mandatory for any async data — no silent
  failures.

## Hard rules
- Never use `dangerouslySetInnerHTML` with unsanitized input.
- Never commit API keys or secrets into component code — flag to
  @security if you find any existing ones.
