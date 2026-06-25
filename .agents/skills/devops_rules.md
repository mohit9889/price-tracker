# Skill: DevOps Rules

Used by @security when handling Docker, CI/CD, or deployment tasks.

## Docker
- Multi-stage builds for production images — don't ship build tools/dev
  dependencies in the final image.
- No secrets baked into image layers (use build args + multi-stage, or
  runtime env injection — never `ENV SECRET=value` committed in a
  Dockerfile).
- `.dockerignore` excludes `node_modules`, `.env`, `.git`, build
  artifacts.

## CI/CD
- Tests must pass before any deploy step runs — never skip or bypass the
  test gate to "just ship it" without explicit user instruction.
- Secrets live in the CI platform's secret store, never in the workflow
  YAML in plaintext.
- Changes to CI/CD config files are flagged explicitly since they affect
  the whole team's pipeline, not just one feature branch.

## Flutter-specific
- Signing keys/keystores are never committed — referenced via CI secrets
  or local-only gitignored files.
- Separate build flavors/configs for dev/staging/prod are kept consistent
  when adding new environment-specific config.

## Hard constraints
- Never disable a CI check (test gate, lint gate, security scan) to make
  a pipeline pass without explicit user approval and a stated reason.
