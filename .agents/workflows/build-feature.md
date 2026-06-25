---
description: Implement a feature end-to-end through Coder -> Tester -> Debugger, with a Refactor pass
---

When the user types `/build-feature <description>`, orchestrate using
`.agents/agents.md` and `.agents/skills/`.

### Execution Sequence
1. Load `skills/detect_stack.md` and identify the stack(s) involved
   (a single repo may have a frontend + backend stack — handle each
   separately where relevant).
2. Act as **@coder**, load the matching stack skill(s), and implement
   `<description>`. Report what was built and where.
3. Act as **@tester**, load the matching stack test skill, and write
   tests for the new code. Run the suite and report real pass/fail and
   coverage numbers.
   - If tests fail because of a bug in the implementation (not the test
     itself), proceed to step 4. If tests pass, skip to step 5.
4. Act as **@debugger**, load `skills/debugging_protocol.md`, diagnose
   and fix the failing test(s). Re-run the suite to confirm. Loop back to
   step 3's verification if new issues surface.
   - **Loop limit**: If the debug → test cycle has run **3 times** without
     all tests passing, STOP looping. Report the remaining failures to the
     user with: (a) what was tried, (b) current hypothesis for the
     remaining issue, and (c) a recommendation (e.g. "this may need a
     design change" or "this test assertion may be wrong"). Let the user
     decide how to proceed rather than churning indefinitely.
5. Act as **@refactor**: only if the implementation has an obvious
   readability or structural issue worth flagging — do NOT perform a
   refactor pass automatically every time. Ask the user first: "Want a
   quick refactor pass on this before we wrap up?"
6. Summarize: what was built, test results, coverage, and any flags
   raised (security concerns, dependency needs, contract changes) that
   need the user's attention.
