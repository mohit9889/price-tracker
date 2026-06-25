# Skill: Detect Stack

## Objective
Before any other action, determine which stack the current workspace/file
belongs to so the correct stack-specific skill is loaded.

## Detection rules (check in this order)
1. If `pubspec.yaml` exists at the project root → **Flutter**.
2. If `package.json` exists, inspect `dependencies`/`devDependencies`:
   - If `next` is present → **Next.js**.
   - Else if `express` (or `fastify`, `koa`) is present AND there is no
     `react`/`react-dom` → **Node/Express (backend)**.
   - Else if `react`/`react-dom` is present without `next` → **React (SPA,
     e.g. Vite/CRA)**.
3. If the project has BOTH a `/client` (or `/frontend`) and `/server` (or
   `/backend`) folder with separate `package.json` files, treat it as a
   **monorepo** — detect each side independently and apply the matching
   skill per-folder. Never apply one stack's rules across the whole repo.
4. If detection is ambiguous, ASK the user once rather than guessing.

## Output
State which stack was detected in one line before proceeding, e.g.:
`Detected stack: Node/Express (backend only, monorepo /server folder)`
