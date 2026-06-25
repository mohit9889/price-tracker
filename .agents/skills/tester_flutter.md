# Skill: Tester — Flutter

## Conventions
- Three test types, kept separate:
  - **Unit tests** (`test/`) — pure Dart logic, no widgets, no platform
    channels. Fastest, run most often.
  - **Widget tests** (`test/`, using `flutter_test`) — pump individual
    widgets, verify rendering/interaction without a real device.
  - **Integration tests** (`integration_test/`) — full app flows on a
    real/simulated device. Use sparingly for critical user journeys only.
- Mock platform channels and external services (HTTP, local DB) — never
  let widget/unit tests touch a real network or real device storage.
- Use `mocktail` or `mockito` — match whichever the project already uses,
  don't mix both in the same project.

## Mock library detection
Before writing any mocks, check `pubspec.yaml` → `dev_dependencies`:
- If `mocktail` is present → use `mocktail` (no code generation needed,
  `class MockFoo extends Mock implements Foo {}`).
- If `mockito` + `build_runner` are present → use `mockito` with
  `@GenerateMocks` annotations and run `dart run build_runner build`.
- If **neither** is present → recommend `mocktail` (simpler setup, no
  codegen) and flag the dependency need to the user per
  `dependency_management.md`. Do not install it yourself.
- If **both** are present → check existing test files to see which is
  actually used, and follow that. Flag the inconsistency to the user.

## Coverage floor
- 80% statements / 75% branches minimum, same standard as your other
  stacks, measured via `flutter test --coverage`.

## Hard constraints
- No changes to `lib/` implementation files — test files only.
- Golden/screenshot tests are opt-in, not default — only add them when
  explicitly requested, since they're high-maintenance across platforms.
- Evidence-only: read the actual widget/provider code before asserting
  behavior in a test.
