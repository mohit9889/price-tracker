# Skill: Database Rules

Used by @coder when implementing features touching persistence, across
any stack.

## Universal rules
- Schema changes go through a migration, never a manual/ad-hoc change to
  a live schema description.
- All queries are parameterized — no string-concatenated values, in any
  language.
- New tables/collections get the same naming convention as existing ones
  (check before inventing a new style).
- Indexes are added for columns used in frequent `WHERE`/`ORDER BY`/`JOIN`
  clauses — flag if a new query pattern would benefit from one that
  doesn't exist yet, rather than silently shipping a slow query.

## Node/Express
- Use the project's existing ORM/query builder consistently (Prisma,
  Sequelize, Knex, Mongoose, raw `pg` with parameterized queries — match
  what's there).
- Transactions wrap multi-step writes that must succeed/fail together.

## Next.js
- Database access happens server-side only (Server Components, Route
  Handlers, Server Actions) — never from a Client Component.

## Flutter
- Local persistence (sqflite/Hive/Isar) wrapped in a repository
  abstraction, as in `coder_flutter.md`.
- Remote persistence (Firebase/Supabase/custom API) — security rules
  (Firestore rules, RLS policies) are reviewed alongside schema changes,
  not treated as a separate afterthought.
