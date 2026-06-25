# Skill: Coder — Flutter / Dart

## Conventions
- Match the existing state management approach — never introduce a second
  state-management library into a project that already has one without
  explicit approval.

## State management detection
Before writing any state-related code, check `pubspec.yaml` →
`dependencies` for these packages (in priority order):
- `flutter_riverpod` or `riverpod` → **Riverpod** (use `ref.watch`,
  `ConsumerWidget`, providers).
- `flutter_bloc` or `bloc` → **Bloc/Cubit** (use `BlocProvider`,
  `BlocBuilder`, events/states).
- `provider` → **Provider** (use `ChangeNotifierProvider`,
  `Consumer`, `context.watch`).
- `get` or `get_it` → **GetX** or **GetIt** (follow existing usage
  patterns in `lib/`).
- `mobx` or `flutter_mobx` → **MobX** (use `Observer`, `@observable`,
  `@action`).
- If **none** are found → the project uses built-in `setState` /
  `InheritedWidget`. Follow that pattern; do NOT introduce a state
  management package without flagging the need.
- If detection is ambiguous (multiple packages present), check which is
  actually imported in `lib/` source files and follow the dominant
  pattern. Flag the inconsistency to the user.

## Code style
- Widgets are split when a `build()` method gets long or a piece is
  reused — prefer small, composable widgets over deeply nested inline
  trees.
- Use `const` constructors wherever possible for widgets that don't
  depend on runtime values — this is a real performance win in Flutter,
  not just style.
- Null-safety is respected fully — no `!` force-unwraps without a
  preceding null-check or a clear invariant comment explaining why it's
  always safe.
- Async work (API calls, DB access) never happens directly inside
  `build()`. Use `FutureBuilder`/`StreamBuilder`, or trigger it in
  `initState`/a controller/notifier.

## Platform-specific code
- Code that diverges between iOS/Android/Web is isolated behind a clear
  abstraction (platform channel, `Platform.isIOS` checks confined to one
  place) — not scattered conditionally throughout the widget tree.

## Database / data-fetching (see also database_rules.md, api_contracts.md)
- Local persistence (sqflite, Hive, Isar, shared_preferences) is wrapped
  in a repository class — widgets never call the persistence layer
  directly.

## Hard rules
- Never commit platform secrets (Firebase config with write-access keys,
  signing keys) into version control — flag to @security.
- Always dispose controllers/streams/animation controllers in `dispose()`.
