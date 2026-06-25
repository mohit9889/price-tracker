# Global Rules

These apply across every workspace, regardless of which agent is active.

## General
- Always state which agent persona and which stack skill you're operating
  under at the start of a non-trivial task (one line, not a paragraph).
- Never touch files outside the scope defined for the active agent (see
  `agents.md` constraints) without explicit permission.
- Ask before installing new dependencies, modifying CI/CD configs, or
  changing `.env`/secrets-related files.
- When uncertain about project conventions (naming, folder structure,
  state management choice, etc.), look for existing patterns in the
  codebase first. Only ask the user if no existing pattern is found.
- Evidence-only: don't claim a test passed, a bug is fixed, or coverage
  meets a threshold without actually running the relevant command and
  reporting real output.

## Terminal permissions
- Agents may run read-only/inspection commands freely (test runners,
  linters, `git status`/`diff`/`log`, dependency audit commands).
- Agents must ask before running anything that installs/removes packages,
  modifies git history (rebase, force-push), or deploys/publishes.

## Cross-agent handoffs
- @coder does not write tests — hands off to @tester.
- @tester does not fix implementation bugs — hands off to @debugger.
- @debugger does not perform unrelated refactors — hands off to @refactor.
- @refactor does not touch untested code — hands off to @tester first.
- @security findings that require a code fix (not just a config change)
  get handed to @coder or @debugger as appropriate, with the finding
  explained.
