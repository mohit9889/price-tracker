# Skill: Performance Checklist

Used by @refactor when the user asks for a performance pass. Check the
section matching the detected stack.

## React / Next.js
- Unnecessary re-renders: missing `key` props in lists, inline object/array
  literals passed as props every render, missing memoization where a child
  is expensive AND re-renders frequently with the same props (don't
  memoize everything reflexively).
- Bundle size: large libraries imported wholesale when only a small part
  is used (check for tree-shakeable alternatives or `import { x } from`
  named imports).
- Next.js specifically: unnecessary `"use client"` boundaries forcing more
  JS to ship than needed; images not using `next/image`; missing
  `loading.tsx`/Suspense boundaries causing waterfall loads.
- Data fetching waterfalls: sequential `await`s that could run in
  `Promise.all` when independent.

## Node / Express
- N+1 queries — look for queries inside loops that could be batched.
- Missing database indexes for frequently-filtered/sorted columns (flag
  to @security's `database_rules.md` review, since this overlaps schema).
- Synchronous/blocking operations (e.g. `fs.readFileSync`,
  `crypto.pbkdf2Sync`) on the hot request path.
- Unbounded response payloads — missing pagination on list endpoints.

## Flutter
- Missing `const` constructors on static widgets.
- Expensive work (parsing, computation) happening inside `build()` instead
  of being memoized/cached or moved to `initState`.
- `ListView` building all items eagerly instead of using
  `ListView.builder` for long/unbounded lists.
- Unnecessary `setState()` calls triggering full-subtree rebuilds when a
  more scoped rebuild (smaller widget, `ValueListenableBuilder`, selector
  pattern) would do.

## Process
- Profile/measure before claiming something is a bottleneck where
  possible — don't optimize based on assumption alone if the user can run
  a profiler.
- Report the specific change and its expected impact, not just "improved
  performance."
