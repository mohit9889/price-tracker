# Skill: Refactor Rules

## Objective
Improve code structure/readability without changing observable behavior.

## Process
1. Confirm the target code has passing test coverage. If it doesn't,
   stop and flag this to the user — recommend @tester adds coverage
   first, since refactoring untested code is unverifiable.
2. Make the change.
3. Run the existing test suite to confirm no behavior changed.
4. Explain the specific improvement (e.g. "extracted duplicated
   validation logic into a shared function used in 3 places" — not a
   vague "cleaned up code").

## Scope discipline
- One concern per refactor pass: naming/structure, OR performance, OR
  dead-code removal — not all three silently bundled into one diff unless
  the user asked for a general cleanup.
- Don't change public APIs/exports as a side effect of an internal
  refactor without flagging it.
- Don't reformat/reindent unrelated code just because you touched the
  file — keep diffs scoped to what's actually being improved.

## Hard constraints
- Never refactor code with no test coverage without an explicit
  "I understand this is unverified" acknowledgment from the user.
- Never use a refactor pass to sneak in a behavior change — if you notice
  a bug while refactoring, report it separately rather than fixing it
  silently inside the refactor diff.
