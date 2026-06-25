# Skill: Documentation

Used by @security during release (via `release_management.md`) and
on-demand when the user asks for documentation updates.

## README
- Keep README accurate to what the code actually does — verify setup
  instructions still work (correct install command, correct env vars
  listed) rather than assuming they're unchanged.
- Sections: what it does, setup/install, how to run (dev/test/build),
  project structure overview, and any stack-specific notes (e.g. "run
  `flutter pub get` before first build").

## Code-level docs
- Doc comments on exported/public functions, classes, and complex logic —
  not on every trivial getter/setter.
- Comments explain *why*, not *what* (the code already shows what; explain
  non-obvious reasoning, tradeoffs, or gotchas).

## API documentation
- If the project has API docs (OpenAPI/Swagger, or a markdown contract
  doc), update them in the same change as any endpoint modification —
  not as a separate forgotten step.

## Hard constraints
- Never document behavior that doesn't actually exist in the code —
  verify against the actual implementation before writing docs.
- Don't auto-generate sprawling documentation for trivial internal
  helpers; focus effort where it helps future readers most.
