---
description: Run pre-release checks, security review, dependency audit, changelog, and version bump
---

When the user types `/release <version-bump: patch|minor|major>`,
orchestrate using `.agents/agents.md` and `.agents/skills/`.

### Execution Sequence
1. Act as **@security**, load `skills/security_review.md` and run a full
   review. Report findings by severity. STOP and wait for user
   acknowledgment if any critical/high findings exist.
2. Act as **@security**, load `skills/dependency_management.md` and run
   the stack-appropriate audit command. Report findings.
3. Act as **@security**, load `skills/documentation.md`. Verify README
   and any API docs reflect current behavior; update if stale.
4. Act as **@security**, load `skills/release_management.md`. Run the
   full test suite (do not proceed if it fails). Generate the changelog
   from actual commit history since the last tag. Bump the version
   consistently in `package.json`/`pubspec.yaml` per `<version-bump>`.
5. Present the changelog and version bump to the user for final approval
   before tagging/publishing anything.
